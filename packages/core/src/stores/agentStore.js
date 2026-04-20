/**
 * agentStore.js — CleanFlow KE Agent Job Management (Supabase)
 * Pulls available jobs directly from the `bookings` table.
 */
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient.js';
import { AGENT_EARNINGS, AI_COACH_INSIGHTS } from '../data/mockData.js';
import { useAuthStore } from './authStore.js';
import { useBookingStore } from './bookingStore.js';
import { useNotificationStore } from './notificationStore.js';
import { ROLES } from '@cleanflow/constants';

export const useAgentStore = create((set, get) => ({
  availableJobs: [],
  activeJobs: [],
  rejectedJobIds: [],
  earnings: {
    today: 0,
    todayGoal: 3000,
    thisWeek: 0,
    thisMonth: 0,
    lastWeek: 0,
    completedToday: 0,
    totalJobs: 0,
    rating: 0,
    weeklyData: [
      { day: 'Mon', earnings: 0 },
      { day: 'Tue', earnings: 0 },
      { day: 'Wed', earnings: 0 },
      { day: 'Thu', earnings: 0 },
      { day: 'Fri', earnings: 0 },
      { day: 'Sat', earnings: 0 },
      { day: 'Sun', earnings: 0 },
    ],
  },
  recentReviews: [],
  isLoadingReviews: false,
  coachInsights: AI_COACH_INSIGHTS,
  isLoadingJobs: false,
  currentInsightIndex: 0,

  /** Fetch jobs from Supabase Bookings table */
  fetchAvailableJobs: async () => {
    const { userId } = useAuthStore.getState();
    const { rejectedJobIds } = get();
    if (!userId) return;

    set({ isLoadingJobs: true });

    // Fetch pending bookings that don't have an agent assigned yet
    // Fetch pending bookings that are either:
    // 1. Open to everyone (agent_id IS NULL)
    // 2. Targeted specifically to this agent (agent_id = userId)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'pending')
      .or(`agent_id.is.null,agent_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data
        .filter(b => !rejectedJobIds.includes(b.id))
        .map(b => ({
          id: b.id,
          material: b.waste_type,
          bags: b.bags,
          pay: (b.fee || 0) * 0.7, // Agent commission (70% of fee)
          location: b.estate,
          time: b.time_slot,
          status: b.status,
          agent_id: b.agent_id,
          user_id: b.user_id,
          customer: 'Client',
        }));
      set({ availableJobs: mapped, isLoadingJobs: false });
    } else {
      set({ isLoadingJobs: false });
    }
  },

  /** Fetch jobs currently assigned to this agent */
  fetchActiveJobs: async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    // 1. Fetch bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('agent_id', userId)
      .in('status', ['confirmed', 'in-progress'])
      .order('updated_at', { ascending: false });

    if (bookingsError) return;

    // 2. Fetch associated profiles manually to avoid 400 ambiguity error
    const userIds = [...new Set(bookingsData.map(b => b.user_id).filter(Boolean))];
    const { data: profilesData } = userIds.length > 0 
      ? await supabase.from('profiles').select('id, name, avatar_url').in('id', userIds)
      : { data: [] };

    const profileMap = Object.fromEntries(profilesData?.map(p => [p.id, p]) || []);

    // 3. Map together
    const mapped = bookingsData.map(b => ({
      id: b.id,
      material: b.waste_type,
      bags: b.bags,
      pay: (b.fee || 0) * 0.7,
      location: b.estate,
      time: b.time_slot,
      status: b.status,
      latitude: b.latitude,
      longitude: b.longitude,
      phone: b.phone,
      user_id: b.user_id,
      customerName: profileMap[b.user_id]?.name || 'Customer',
      customerAvatar: profileMap[b.user_id]?.avatar_url
    }));

    set({ activeJobs: mapped });
  },

  /** Fetch earnings statistics from DB */
  fetchEarnings: async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    // Get all completed jobs for this agent
    const { data, error } = await supabase
      .from('bookings')
      .select('fee, updated_at, status')
      .eq('agent_id', userId)
      .eq('status', 'completed');

    if (!error && data) {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(now.getDate() - 14);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Initialize weekly chart data (Monday to Sunday)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // We want to show the last 7 days leading up to today, or just fixed Mon-Sun for current week
      // Let's do current week (Mon-Sun)
      const currentDayOfWeek = now.getDay(); // 0 is Sunday
      const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - daysSinceMonday);
      startOfWeek.setHours(0,0,0,0);

      const weeklyDataMap = {
        Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
      };

      let todayEarnings = 0;
      let thisWeekEarnings = 0;
      let lastWeekEarnings = 0;
      let thisMonthEarnings = 0;
      let completedToday = 0;

      data.forEach(b => {
        const d = new Date(b.updated_at);
        const dayStr = b.updated_at.split('T')[0];
        const agentPay = (b.fee || 0) * 0.7; // Agent commission is 70%

        // Today
        if (dayStr === todayStr) {
          todayEarnings += agentPay;
          completedToday++;
        }

        // This Month
        if (d >= startOfMonth) {
          thisMonthEarnings += agentPay;
        }

        // This Week vs Last Week (Rolling 7 days)
        if (d >= oneWeekAgo) {
          thisWeekEarnings += agentPay;
        } else if (d >= twoWeeksAgo && d < oneWeekAgo) {
          lastWeekEarnings += agentPay;
        }

        // Current Calendar Week Chart Data
        if (d >= startOfWeek) {
          const dayName = dayNames[d.getDay()];
          weeklyDataMap[dayName] += agentPay;
        }
      });
      
      const weeklyData = [
        { day: 'Mon', earnings: weeklyDataMap['Mon'] },
        { day: 'Tue', earnings: weeklyDataMap['Tue'] },
        { day: 'Wed', earnings: weeklyDataMap['Wed'] },
        { day: 'Thu', earnings: weeklyDataMap['Thu'] },
        { day: 'Fri', earnings: weeklyDataMap['Fri'] },
        { day: 'Sat', earnings: weeklyDataMap['Sat'] },
        { day: 'Sun', earnings: weeklyDataMap['Sun'] },
      ];

      set((s) => ({
        earnings: {
          ...s.earnings,
          today: todayEarnings,
          thisWeek: thisWeekEarnings,
          lastWeek: lastWeekEarnings,
          thisMonth: thisMonthEarnings,
          completedToday,
          totalJobs: data.length,
          rating: useAuthStore.getState().profile?.rating || 5.0,
          weeklyData
        }
      }));
    }
  },

  /** Fetch reviews for this agent */
  fetchReviews: async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    set({ isLoadingReviews: true });

    // 1. Fetch rated bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, agent_rating, agent_feedback, updated_at, waste_type, user_id')
      .eq('agent_id', userId)
      .not('agent_rating', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (bookingsError) {
      set({ isLoadingReviews: false });
      return;
    }

    // 2. Fetch associated customer profiles manually
    const userIds = [...new Set(bookingsData.map(b => b.user_id).filter(Boolean))];
    const { data: profilesData } = userIds.length > 0 
      ? await supabase.from('profiles').select('id, name, avatar_url').in('id', userIds)
      : { data: [] };

    const profileMap = Object.fromEntries(profilesData?.map(p => [p.id, p]) || []);

    // 3. Map together
    const mapped = bookingsData.map(b => ({
      id: b.id,
      rating: b.agent_rating,
      feedback: b.agent_feedback,
      date: new Date(b.updated_at).toLocaleDateString(),
      wasteType: b.waste_type,
      customerName: profileMap[b.user_id]?.name || 'Customer',
      customerAvatar: profileMap[b.user_id]?.avatar_url
    }));

    set({ recentReviews: mapped, isLoadingReviews: false });
  },

  /** Accept a job */
  acceptJob: async (jobId) => {
    try {
      const { userId, profile } = useAuthStore.getState();
      if (!userId) return false;

      // 1. Update Booking
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          agent_id: userId, 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) {
        console.error('[CleanFlow Agent] Accept Job Error:', updateError);
        throw new Error(updateError.message || 'Failed to claim job');
      }

      // 2. Refresh State
      await get().fetchAvailableJobs();
      await get().fetchActiveJobs();

      // 3. Notify Customer
      const { data: booking } = await supabase
        .from('bookings')
        .select('user_id')
        .eq('id', jobId)
        .single();

      if (booking?.user_id) {
        await useNotificationStore.getState().addNotification(
          'Agent is coming! 🚛',
          `HygeneX Agent ${profile.name} has accepted your request and is on the way.`,
          'success',
          ROLES.USER,
          booking.user_id
        );
      }
      return true;
    } catch (err) {
      console.error('[CleanFlow Agent] Job Acceptance Failed:', err);
      return false;
    }
  },

  /** Reject/Dismiss an available job — handles global broadcast failover */
  rejectJob: async (job) => {
    const { userId, profile } = useAuthStore.getState();
    const { addNotification } = useNotificationStore.getState();
    const jobId = job.id;

    console.log(`[CleanFlow Agent] Dismissing job ${jobId}`);

    // 1. If this was a targeted job for THIS agent, we must open it to the world (Failover)
    if (job.agent_id === userId) {
      console.log(`[Failover] Agent ${userId} declining priority mission ${jobId}. Broadcasting...`);
      
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ agent_id: null, status: 'pending' })
        .eq('id', jobId);

      if (!updateError) {
        // Penalty: Increment rejection count for penalty tracking
        const currentCount = profile?.rejection_count || 0;
        await useAuthStore.getState().updateProfile({ 
          rejection_count: currentCount + 1 
        });

        // Notify User
        await addNotification(
          "Mission Update 🚛",
          "Your preferred agent is currently finishing another task. We've broadcast your mission to all available agents to ensure a fast pickup!",
          'info',
          'user',
          job.user_id
        );

        // Notify Admins
        await addNotification(
          "Priority Mission Declined ⚠️",
          `Agent ${profile.name} declined a direct request in ${job.location}. Mission broadcasted.`,
          'warning',
          'admin'
        );
      }
    }

    // 2. Perform local cleanup so agent doesn't see it again
    set((s) => ({
      rejectedJobIds: [...s.rejectedJobIds, jobId],
      availableJobs: s.availableJobs.filter(j => j.id !== jobId)
    }));
  },

  /** Mark a job as completed with weighing */
  completeJob: async (jobId, weightKg) => {
    const { fetchActiveJobs, fetchEarnings } = get();
    
    console.log(`[CleanFlow Agent] Completing job ${jobId} with weight: ${weightKg}kg`);
    
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'completed', 
        actual_weight_kg: weightKg,
        updated_at: new Date().toISOString() 
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('[CleanFlow Agent] Completion error:', updateError);
      throw updateError;
    }

    console.log('[CleanFlow Agent] Job status updated successfully in DB');

    // Refresh Agent UI to reflect earnings and remove job from active list
    fetchActiveJobs();
    fetchEarnings();
  },

  /** Cycle through AI coach insights */
  nextInsight: () => {
    set((s) => ({
      currentInsightIndex: (s.currentInsightIndex + 1) % s.coachInsights.length,
    }));
  },

  /** Pulse current location to Supabase for Admin tracking */
  broadcastLocation: async (lat, lng, status = 'active') => {
    const { userId, profile } = useAuthStore.getState();
    if (!userId) return;

    console.log(`[CleanFlow Agent] Broadcasting location pulse: ${lat}, ${lng} (${status})`);

    const { error } = await supabase
      .from('profiles')
      .update({
        location: {
          ...profile?.location,
          latitude: lat,
          longitude: lng,
          status: status,
          last_pulse: new Date().toISOString()
        }
      })
      .eq('id', userId);
    
    if (error) {
      console.error('[CleanFlow Agent] Location broadcast failed:', error);
    }
  },
}));
