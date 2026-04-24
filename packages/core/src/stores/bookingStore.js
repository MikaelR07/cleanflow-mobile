/**
 * bookingStore.js — CleanFlow KE Pickup Logistics (Supabase)
 */
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient.js';
import { useAuthStore } from './authStore.js';
import { useSystemStore } from './systemStore.js';
import { useNotificationStore, NOTIFICATION_TYPES } from './notificationStore.js';

export const useBookingStore = create((set, get) => ({
  bookings: [],
  liveAgents: [],
  aiSuggestions: [],
  isLoadingAI: false,
  selectedTime: null,
  activeReleaseBooking: null, 
  bookingSubscription: null,
  agentSubscription: null,

  // ── Voice Booking State ───────────────────────────────
  voiceModalOpen: false,
  voiceStep: 'idle', // 'idle' | 'listening' | 'processing' | 'done'
  voiceResult: null,

  openVoiceModal: () => set({ voiceModalOpen: true, voiceStep: 'idle', voiceResult: null }),
  closeVoiceModal: () => set({ voiceModalOpen: false, voiceStep: 'idle', voiceResult: null }),
  
  startVoiceRecognition: async () => {
    set({ voiceStep: 'listening' });
    
    // Simulate listening for 2 seconds
    setTimeout(() => {
      set({ voiceStep: 'processing' });
      
      // Simulate AI processing for 1.5 seconds
      setTimeout(() => {
        set({ 
          voiceStep: 'done',
          voiceResult: {
            transcript: "I need a pickup for 3 bags of recyclables tomorrow morning",
            wasteType: "recyclable",
            bags: 3,
            estate: useAuthStore.getState().profile?.location?.estate || "South B",
            time: "Tomorrow, 09:00 AM"
          }
        });
      }, 1500);
    }, 2000);
  },
  
  setActiveReleaseBooking: (booking) => set({ activeReleaseBooking: booking }),
  clearActiveRelease: () => set({ activeReleaseBooking: null }),

  // ── Realtime Booking Listener ───────────────────────────
  subscribeToBookings: (userId) => {
    if (get().bookingSubscription) return;
    const sub = supabase
      .channel(`public:bookings:${userId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `user_id=eq.${userId}` }, 
        (payload) => {
          const updated = payload.new;
          console.log('[BookingStore] REAL-TIME UPDATE RECEIVED:', updated.id, updated.status, updated.payment_status);
          
          if (updated.status === 'picked_up' && updated.payment_status === 'authorized') {
            console.log('[BookingStore] 🚀 TRIGGERING RELEASE MODAL!');
            set({ activeReleaseBooking: updated });
            useNotificationStore.getState().playNotificationSound();
          }
          get().fetchBookings();
        }
      )
      .subscribe();
    set({ bookingSubscription: sub });
  },

  cleanupBookings: () => {
    if (get().bookingSubscription) {
      get().bookingSubscription.unsubscribe();
      set({ bookingSubscription: null });
    }
  },

  fetchNearbyAgents: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, location, role, is_online, business_type, is_staff')
      .eq('role', 'agent')
      .eq('is_online', true);
    if (!error && data) {
      const mapped = data.map(a => ({ ...a, isStaff: a.is_staff }));
      set({ liveAgents: mapped });
      get().generateTimeSuggestions();
    }
  },

  subscribeToAgents: () => {
    if (get().agentSubscription) return;
    const sub = supabase
      .channel('public:online-agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => get().fetchNearbyAgents())
      .subscribe();
    set({ agentSubscription: sub });
  },

  cleanupAgents: () => {
    if (get().agentSubscription) {
      get().agentSubscription.unsubscribe();
      set({ agentSubscription: null });
    }
  },

  fetchBookings: async () => {
    const { userId, role } = useAuthStore.getState();
    if (!userId) return;
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (role === 'user') query = query.eq('user_id', userId);
    if (role === 'agent') query = query.or(`agent_id.eq.${userId},and(status.eq.pending,agent_id.is.null)`);
    const { data, error } = await query;
    if (!error && data) {
      const mapped = data.map(b => ({
        id: b.id, userId: b.user_id, agentId: b.agent_id, wasteType: b.waste_type,
        date: b.preferred_date, time: b.time_slot, status: b.status, bags: b.bags,
        fee: b.fee, notes: b.notes, estate: b.estate, latitude: b.latitude,
        longitude: b.longitude, paymentStatus: b.payment_status, totalPrice: b.total_price,
        actualWeightKg: b.actual_weight_kg,
        createdAt: b.created_at, photoUrl: b.photo_url,
      }));
      set({ bookings: mapped });
    }
  },

  createBooking: async (booking) => {
    const { userId, profile } = useAuthStore.getState();
    if (!userId) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('bookings').insert({
      user_id: userId, waste_type: booking.wasteType, 
      preferred_date: booking.date || new Date().toISOString().split('T')[0],
      time_slot: booking.time, status: 'pending', bags: booking.bags || 1,
      fee: booking.amount || 0, notes: booking.notes || null,
      estate: booking.estate || profile?.location?.estate || null,
      latitude: booking.latitude || profile?.location?.latitude || null,
      longitude: booking.longitude || profile?.location?.longitude || null,
      agent_id: booking.agentId || null, photo_url: booking.photoUrl || null,
      booking_type: booking.bookingType || 'any',
    }).select().single();
    if (error) throw new Error(error.message);
    get().fetchBookings();
    return data;
  },

  // ── SMART ASAP ENGINE ──
  // Client sees one simple "ASAP" option. 
  // Behind the scenes, routing is automatic based on time + availability.
  generateTimeSuggestions: async () => {
    const { operatingHours, fetchConfig, isLoaded } = useSystemStore.getState();
    if (!isLoaded) await fetchConfig();
    
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    const config = operatingHours[currentDay];
    const liveAgents = get().liveAgents;

    const currentHour = now.getHours();
    const isWithinCompanyHours = config?.active && 
                                 currentHour >= Number(config.start.split(':')[0]) && 
                                 currentHour < Number(config.end.split(':')[0]);
    
    const staffOnline = liveAgents.filter(a => a.isStaff);
    const freelancersOnline = liveAgents.filter(a => !a.isStaff);
    const totalOnline = liveAgents.length;

    const slots = [];

    if (totalOnline > 0) {
      // Determine who gets the job
      let routeType = 'any';
      let subtitle = '';

      if (isWithinCompanyHours && staffOnline.length > 0) {
        // Priority: Staff handles it during company hours
        routeType = 'staff';
        subtitle = `${staffOnline.length} CleanFlow agent${staffOnline.length > 1 ? 's' : ''} nearby`;
      } else if (freelancersOnline.length > 0) {
        // Fallback: Freelancers cover outside hours or when no staff
        routeType = 'freelance';
        subtitle = `${freelancersOnline.length} independent agent${freelancersOnline.length > 1 ? 's' : ''} available`;
      } else if (staffOnline.length > 0) {
        // Edge case: Only staff online but outside hours (still serve them)
        routeType = 'staff';
        subtitle = `${staffOnline.length} agent${staffOnline.length > 1 ? 's' : ''} available`;
      }

      slots.push({ 
        time: 'ASAP', 
        discount: 0, 
        label: subtitle,
        type: routeType 
      });
    }

    // If no one is online, slots stay empty — UI shows "Schedule Later"
    set({ aiSuggestions: slots });
  },

  selectTime: (time) => set({ selectedTime: time }),
  
  // ── PAYMENT & COMPLETION ──
  confirmPayment: async (bookingId) => {
    console.log('[BookingStore] Confirming payment for:', bookingId);
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'completed', 
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) throw error;
    
    set({ activeReleaseBooking: null });
    get().fetchBookings();
  },

  submitAgentRating: async (bookingId, rating, comment = '') => {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        agent_rating: rating,
        agent_feedback: comment
      })
      .eq('id', bookingId);
      
    if (error) throw error;
    get().fetchBookings();
  },
}));
