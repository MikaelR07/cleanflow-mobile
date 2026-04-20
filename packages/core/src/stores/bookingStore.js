/**
 * bookingStore.js — CleanFlow KE Pickup Logistics (Supabase)
 * Writes bookings to the `bookings` table.
 * Agents & Admins can query and update bookings in real-time.
 */
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient.js';
import { AI_PICKUP_TIMES } from '../data/mockData.js';
import { aiService } from '../services/aiService.js';
import { useAuthStore } from './authStore.js';
import { useNotificationStore, NOTIFICATION_TYPES } from './notificationStore.js';

export const useBookingStore = create((set, get) => ({
  bookings: [],
  liveAgents: [],
  aiSuggestions: AI_PICKUP_TIMES.slice(0, 4),
  isLoadingAI: false,
  selectedTime: null,

  // ── Fetch Online Agents for Client Map ──────────────────
  agentSubscription: null,
  
  fetchNearbyAgents: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, location, role, is_online')
      .eq('role', 'agent')
      .eq('is_online', true);

    if (!error && data) {
      set({ liveAgents: data });
    }
  },

  subscribeToAgents: () => {
    // Prevent duplicate subscriptions
    if (get().agentSubscription) return;

    const sub = supabase
      .channel('public:online-agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        // Refresh only if it's an agent or relevant change
        get().fetchNearbyAgents();
      })
      .subscribe();

    set({ agentSubscription: sub });
  },

  cleanupAgents: () => {
    if (get().agentSubscription) {
      get().agentSubscription.unsubscribe();
      set({ agentSubscription: null });
    }
  },

  /* ── Voice Booking ─────────────────────────────────────── */
  voiceModalOpen: false,
  voiceStep: 'idle',
  voiceResult: null,

  openVoiceModal: () => set({ voiceModalOpen: true, voiceStep: 'idle', voiceResult: null }),
  closeVoiceModal: () => set({ voiceModalOpen: false, voiceStep: 'idle', voiceResult: null }),

  startVoiceRecognition: () => {
    set({ voiceStep: 'listening' });
    setTimeout(() => {
      set({ voiceStep: 'processing' });
      setTimeout(() => {
        set({
          voiceStep: 'done',
          voiceResult: {
            wasteType: 'general',
            bags: 2,
            estate: 'South B',
            time: 'Tue, 6:00 AM',
            transcript: 'Nataka pickup ya takataka mbili kesho asubuhi South B',
          },
        });
      }, 1500);
    }, 2500);
  },

  /* ── Fetch Bookings ──────────────────────────────────────── */
  fetchBookings: async () => {
    const { userId, role, profile } = useAuthStore.getState();
    if (!userId) return;

    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });

    // Regular users only see their own bookings
    if (role === 'user') {
      query = query.eq('user_id', userId);
    }
    // Agents see bookings assigned to them OR unassigned pending bookings
    if (role === 'agent') {
      query = query.or(`agent_id.eq.${userId},and(status.eq.pending,agent_id.is.null)`);
    }

    const { data, error } = await query;
    if (!error && data) {
      let filtered = data;
      
      // Logical Clear: Hide past jobs before their respective clear timestamps
      if (role === 'user') {
        const completedCleared = profile?.completedClearedAt ? new Date(profile.completedClearedAt).getTime() : 0;
        const cancelledCleared = profile?.cancelledClearedAt ? new Date(profile.cancelledClearedAt).getTime() : 0;
        
        filtered = data.filter(b => {
          if (b.status === 'completed' && completedCleared > 0) {
            return new Date(b.created_at).getTime() > completedCleared;
          }
          if (b.status === 'cancelled' && cancelledCleared > 0) {
            return new Date(b.created_at).getTime() > cancelledCleared;
          }
          return true;
        });
      }

      const mapped = filtered.map(b => ({
        id: b.id,
        userId: b.user_id,
        agentId: b.agent_id,
        wasteType: b.waste_type,
        date: b.preferred_date,
        time: b.time_slot,
        status: b.status,
        bags: b.bags,
        weightKg: b.weight_kg,
        fee: b.fee,
        notes: b.notes,
        estate: b.estate,
        latitude: b.latitude,
        longitude: b.longitude,
        lastUpdated: b.updated_at,
      }));
      set({ bookings: mapped });
    }
  },

  clearBookingHistory: async (type = 'all') => {
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    const now = new Date().toISOString();
    const updatePayload = {};
    
    if (type === 'completed' || type === 'all') {
      updatePayload.completed_cleared_at = now;
    }
    if (type === 'cancelled' || type === 'all') {
      updatePayload.cancelled_cleared_at = now;
    }

    // 1. Update Database
    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (error) {
      console.error(`[CleanFlow Logistics] Clear ${type} History Error:`, error);
      throw error;
    }

    // 2. Update Auth Store State (camelCase for state)
    const stateUpdate = {};
    if (type === 'completed' || type === 'all') stateUpdate.completedClearedAt = now;
    if (type === 'cancelled' || type === 'all') stateUpdate.cancelledClearedAt = now;
    
    useAuthStore.getState().updateProfile(stateUpdate);

    // 3. Refresh
    get().fetchBookings();
  },

  /* ── Create Booking ──────────────────────────────────────── */
  createBooking: async (booking) => {
    const { userId, profile } = useAuthStore.getState();
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase.from('bookings').insert({
      user_id: userId,
      waste_type: booking.wasteType,
      preferred_date: booking.date || new Date().toISOString().split('T')[0],
      time_slot: booking.time,
      status: 'pending',
      bags: booking.bags || 1,
      fee: booking.amount || 0,
      notes: booking.notes || null,
      estate: booking.estate || profile?.location?.estate || null,
      latitude: booking.latitude || profile?.location?.latitude || null,
      longitude: booking.longitude || profile?.location?.longitude || null,
      agent_id: booking.agentId || null, // Persist the specifically selected agent
    }).select().single();

    if (error) {
      console.error('[CleanFlow Booking] Creation Failed:', error);
      throw new Error(error.message);
    }

    // Notify Agents of new available job
    useNotificationStore.getState().addNotification(
      'New Job Available! 🚛',
      `A new cleanup is requested in ${booking.estate || profile?.location?.estate || 'your sector'}.`,
      'info',
      'agent'
    );

    const newBooking = {
      id: data.id,
      userId: data.user_id,
      wasteType: data.waste_type,
      date: data.preferred_date,
      time: data.time_slot,
      status: data.status,
      bags: data.bags,
      fee: data.fee,
      estate: data.estate,
      lastUpdated: data.updated_at,
    };

    set((s) => ({ bookings: [newBooking, ...s.bookings] }));

    // Notify the user
    await useNotificationStore.getState().addNotification(
      'Pickup Scheduled! 🗓️',
      `Your ${newBooking.wasteType} collection has been submitted for ${newBooking.time || 'your preferred slot'}.`,
      NOTIFICATION_TYPES.SUCCESS,
      'user',
      userId
    );

    // Notify ALL Agents about the new job
    await useNotificationStore.getState().addNotification(
      'New Job Request! 🚛',
      `A new pickups has been requested in ${newBooking.estate || 'your area'}. Open Dispatcher to accept.`,
      NOTIFICATION_TYPES.INFO,
      'agent',
      null // Target all agents
    );

    return newBooking;
  },

  /* ── Cancel Booking ──────────────────────────────────────── */
  cancelBooking: async (id) => {
    const { userId } = useAuthStore.getState();

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw new Error(error.message);

    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled', lastUpdated: new Date().toISOString() } : b
      ),
    }));

    await useNotificationStore.getState().addNotification(
      'Booking Cancelled',
      `Your pickup request has been successfully cancelled.`,
      NOTIFICATION_TYPES.INFO,
      'user',
      userId
    );
  },

  /* ── Update Booking ──────────────────────────────────────── */
  updateBooking: async (id, updates) => {
    // Map camelCase to snake_case
    const dbUpdates = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.agentId) dbUpdates.agent_id = updates.agentId;
    if (updates.weightKg !== undefined) dbUpdates.weight_kg = updates.weightKg;
    if (updates.fee !== undefined) dbUpdates.fee = updates.fee;

    const { error } = await supabase.from('bookings').update(dbUpdates).eq('id', id);
    if (error) throw new Error(error.message);

    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates, lastUpdated: new Date().toISOString() } : b
      ),
    }));
  },

  /* ── Reschedule ──────────────────────────────────────────── */
  rescheduleBooking: async (id) => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const newDate = nextDay.toISOString().split('T')[0];

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'pending', preferred_date: newDate })
      .eq('id', id);

    if (error) throw new Error(error.message);

    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'pending', date: newDate, lastUpdated: new Date().toISOString() } : b
      ),
    }));
  },

  selectTime: (time) => set({ selectedTime: time }),

  /* ── Agent Rating ────────────────────────────────────────── */
  submitAgentRating: async (bookingId, rating, feedback = null) => {
    const { bookings } = get();
    const targeted = bookings.find(b => b.id === bookingId);
    if (!targeted || !targeted.agentId) return;

    // 1. Update the booking itself
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ 
        agent_rating: rating, 
        agent_feedback: feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (bookingError) throw bookingError;

    // 2. Recalculate Agent's Total Average
    const { data: agentBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('agent_rating')
      .eq('agent_id', targeted.agentId)
      .not('agent_rating', 'is', null);

    if (!fetchError && agentBookings.length > 0) {
      const sum = agentBookings.reduce((acc, b) => acc + b.agent_rating, 0);
      const avg = sum / agentBookings.length;

      // 3. Update Agent's Profile
      await supabase
        .from('profiles')
        .update({ rating: parseFloat(avg.toFixed(2)) })
        .eq('id', targeted.agentId);
    }

    // 4. Update local state
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, agentRating: rating, agentFeedback: feedback } : b
      )
    }));
  },

  clearCancelledBookings: () => {
    set((state) => ({
      bookings: state.bookings.filter((b) => b.status !== 'cancelled'),
    }));
  },

  /* ── AI Suggestions ──────────────────────────────────────── */
  refreshAISuggestions: async (smartBins) => {
    const { profile } = useAuthStore.getState();
    const isIotEnabled = profile?.isIotEnabled ?? false;
    set({ isLoadingAI: true });
    try {
      const suggestions = await aiService.getRecommendations(profile?.id, smartBins, isIotEnabled);
      set({ aiSuggestions: suggestions });
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
    } finally {
      set({ isLoadingAI: false });
    }
  },
}));
