/**
 * notificationStore.js — CleanFlow KE Cross-App Notifications (Supabase)
 */
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient.js';
import { useAuthStore } from './authStore.js';

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  REWARD: 'reward',
  INFO: 'info',
};

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  subscription: null,

  fetchNotifications: async (userId, role) => {
    const lastCleared = localStorage.getItem(`cf_nots_cleared_${userId}`) || '1970-01-01T00:00:00Z';
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`target_user.eq.${userId},target_role.eq.${(role || '').toLowerCase()},target_role.eq.all`)
      .gt('created_at', lastCleared)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      set({ notifications: data.map(n => ({ ...n, read: n.is_read })) });
    }
  },

  playNotificationSound: () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.volume = 0.5;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.warn('[NotificationStore] Audio play deferred until user interaction.');
        });
      }
    } catch (err) {
      console.error('Failed to play notification sound:', err);
    }
  },

  subscribeToRealtime: (userId, role) => {
    const existing = get().subscription;
    if (existing) existing.unsubscribe();

    const myRole = (role || '').toLowerCase();
    const sub = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const n = payload.new;
          const targetRole = (n.target_role || '').toLowerCase();
          const targeted = n.target_user === userId || targetRole === myRole || targetRole === 'all';
          
          if (targeted) {
            set((state) => ({
              notifications: [{ ...n, read: false, is_read: false }, ...state.notifications].slice(0, 50),
            }));
            // INSTANT SOUND (Zero Delay)
            get().playNotificationSound();
          }
        })
      .subscribe();

    set({ subscription: sub });
  },

  addNotification: async (title, body, type = NOTIFICATION_TYPES.INFO, targetRole = 'all', targetUser = null) => {
    // Normalize 'client' role to 'user' to match the auth system
    const normalizedRole = targetRole === 'client' ? 'user' : targetRole;

    const { error } = await supabase.from('notifications').insert({
      title,
      body,
      type,
      target_role: (normalizedRole || 'all').toLowerCase(),
      target_user: targetUser,
    });

    if (error) {
      console.error('[NotificationStore] INSERT ERROR:', error.message, error.details);
      // Fallback: Add to local list anyway so UI doesn't break
      const id = `NT-${Date.now()}`;
      set((state) => ({
        notifications: [
          { id, title, body, type, target_role: targetRole, is_read: false, created_at: new Date().toISOString(), read: false },
          ...state.notifications,
        ].slice(0, 50),
      }));
    }
  },

  markAsRead: async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true, is_read: true } : n),
    }));
  },

  markAllAsRead: async () => {
    const { notifications } = get();
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true, is_read: true })),
    }));
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
  },

  clearAll: async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) {
      set({ notifications: [] });
      return;
    }
    await supabase.from('notifications').delete().eq('target_user', userId);
    const now = new Date().toISOString();
    localStorage.setItem(`cf_nots_cleared_${userId}`, now);
    set({ notifications: [] });
  },

  getUnreadCount: () => get().notifications.filter(n => !n.read).length,

  cleanup: () => {
    const sub = get().subscription;
    if (sub) sub.unsubscribe();
    set({ subscription: null });
  },
}));
