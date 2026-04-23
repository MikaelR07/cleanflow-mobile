/**
 * hygenexStore.js — CleanFlow KE AI Chat Intelligence (Supabase)
 * Persistent chat history and real-time AI advisor response synchronization.
 */
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient.js';
import { useAuthStore } from './authStore.js';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hygenex-agent`;

const WELCOME_MESSAGE = {
  id: 'initial-1',
  role: 'ai',
  text: "Hello! I'm HygeneX, your smart waste intelligence assistant. How can I help you today?",
  timestamp: new Date().toISOString(),
};

export const useHygenexStore = create((set, get) => ({
  messages: [WELCOME_MESSAGE],
  isTyping: false,
  realtimeChannel: null,
  metrics: {
    estates: 12,
    activeAgents: 24,
    segregationRate: 72
  },

  // ── INIT: load history + subscribe to realtime ─────────────────
  initChat: async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    // 1. Cleanup existing to prevent race conditions
    const existingChannel = get().realtimeChannel;
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    // 2. Fetch History
    const { data: history, error } = await supabase
      .from('hygenex_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && history) {
      const mapped = history.map((row) => ({
        id: row.id,
        role: row.role,
        text: row.text,
        timestamp: row.created_at,
      }));
      set({ messages: [WELCOME_MESSAGE, ...mapped] });
    }

    // 3. Realtime listener for incoming AI responses
    const channel = supabase
      .channel(`hygenex_realtime_${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hygenex_messages', filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new;
          if (row.role === 'ai') {
            set((s) => {
              const exists = s.messages.find((m) => m.id === row.id);
              if (exists) return s;
              return {
                messages: [...s.messages, { id: row.id, role: row.role, text: row.text, timestamp: row.created_at }],
                isTyping: false
              };
            });
          }
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  stopChat: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  },

  // ── SEND: Save message + call Edge Function ───────────────────
  sendMessage: async (text) => {
    const { userId } = useAuthStore.getState();
    if (!userId || !text.trim()) return;

    // 1. Optimistic Update
    const tempId = crypto.randomUUID();
    const userMsg = { id: tempId, role: 'user', text, timestamp: new Date().toISOString() };
    set((s) => ({ messages: [...s.messages, userMsg], isTyping: true }));

    // 2. Persist user message
    const { error: insertError } = await supabase.from('hygenex_messages').insert({
      user_id: userId,
      role: 'user',
      text
    });

    if (insertError) {
      console.error('[HygeneX] Message save failed:', insertError);
      set({ isTyping: false });
      return;
    }

    // 3. Call Edge Function
    try {
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          type: 'user_message',
          userId,
          payload: { message: text }
        }),
      });

      if (!res.ok) {
        throw new Error('AI Response Failed');
      }

      // We don't need to manually add the AI response here because the Realtime listener
      // will pick up the row inserted by the Edge Function.
      // But we set a timeout to stop typing if it takes too long.
      setTimeout(() => set({ isTyping: false }), 5000);

    } catch (err) {
      console.error('[HygeneX] AI Error:', err);
      set({ isTyping: false });
    }
  },

  resetChat: () => set({ messages: [WELCOME_MESSAGE], isTyping: false }),
}));
