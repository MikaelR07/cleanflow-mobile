/**
 * notificationStore.js — CleanFlow KE Cross-App Notifications (Supabase)
 * Uses `notifications` table with role-based targeting.
 * Supabase Realtime subscription updates the list live.
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

  // Fetch notifications for the logged-in role/user
  fetchNotifications: async (userId, role) => {
    // Persistent clear logic: don't fetch anything before the last "Clear All" action
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

  // Helper for notification sounds
  playNotificationSound: () => {
    try {
      console.log('[NotificationStore] Attempting to play alert sound...');
      // Use a more reliable CDN URL for the notification sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.volume = 0.5;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn('[NotificationStore] Audio play deferred until user interaction. Click anywhere on the app to enable sounds.');
        });
      }
    } catch (err) {
      console.error('Failed to play notification sound:', err);
    }
  },

  // Subscribe to Realtime new notifications
  subscribeToRealtime: (userId, role) => {
    // Cleanup existing subscription
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
          
          console.log(`[CleanFlow Sync] New Notification: "${n.title}"`, { 
            targeted, 
            myId: userId, 
            myRole, 
            targetId: n.target_user, 
            targetRole
          });

          if (targeted) {
            set((state) => ({
              notifications: [{ ...n, read: false, is_read: false }, ...state.notifications].slice(0, 50),
            }));

            // Play sound for targeted notifications after state update
            setTimeout(() => get().playNotificationSound(), 100);
          }
        })
      .subscribe();

    set({ subscription: sub });
  },

  // Add a new notification (cross-app, admin gets notified too)
  addNotification: async (title, body, type = NOTIFICATION_TYPES.INFO, targetRole = 'all', targetUser = null) => {
    const { error } = await supabase.from('notifications').insert({
      title,
      body,
      type,
      target_role: (targetRole || 'all').toLowerCase(),
      target_user: targetUser,
    });

    if (error) {
      // Fallback: add locally if insert fails
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

    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true, is_read: true })),
    }));

    // DB Sync
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
  },

  clearAll: async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) {
      set({ notifications: [] });
      return;
    }

    // 1. Physically delete personal notifications from DB
    await supabase
      .from('notifications')
      .delete()
      .eq('target_user', userId);

    // 2. Persistent hide for broadcast/role notifications
    const now = new Date().toISOString();
    localStorage.setItem(`cf_nots_cleared_${userId}`, now);

    // 3. Clear local state
    set({ notifications: [] });
  },

  getUnreadCount: () => get().notifications.filter(n => !n.read).length,

  cleanup: () => {
    const sub = get().subscription;
    if (sub) sub.unsubscribe();
    set({ subscription: null });
  },
}));
