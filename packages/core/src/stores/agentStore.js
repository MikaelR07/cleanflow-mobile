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
  jobHistory: [],
  rejectedJobIds: [],
  arrivedJobIds: [], 
  setJobArrived: (jobId) => set((s) => ({ 
    arrivedJobIds: s.arrivedJobIds.includes(jobId) ? s.arrivedJobIds : [...s.arrivedJobIds, jobId] 
  })),
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
  jobSubscription: null,

  // ── Realtime Job Listener ───────────────────────────
  subscribeToJobs: () => {
    if (get().jobSubscription) return;
    
    // Listen for ANY new bookings or updates to bookings in the 'pending' status
    const sub = supabase
      .channel('public:agent-bookings')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings', filter: "status=eq.pending" }, 
        (payload) => {
          console.log('[Agent Store] Realtime Booking Update Detected:', payload);
          // Play a sound if it's a new job (INSERT)
          if (payload.eventType === 'INSERT') {
             useNotificationStore.getState().playNotificationSound();
          }
          // Refresh the jobs list
          get().fetchAvailableJobs();
        }
      )
      .subscribe();
      
    set({ jobSubscription: sub });
  },

  cleanupJobs: () => {
    if (get().jobSubscription) {
      get().jobSubscription.unsubscribe();
      set({ jobSubscription: null });
    }
  },

  /** Fetch jobs from Supabase Bookings table — filtered by agent type */
  fetchAvailableJobs: async () => {
    const { userId, profile } = useAuthStore.getState();
    const { rejectedJobIds } = get();
    if (!userId) return;

    set({ isLoadingJobs: true });

    const isStaff = profile?.isStaff === true || profile?.is_staff === true;

    // Fetch bookings via Security Definer RPC to bypass stubborn RLS policies
    const { data, error } = await supabase
      .rpc('get_available_bookings', { agent_uuid: userId });

    if (error) console.error('[fetchAvailableJobs] RPC Error:', error);

    if (!error && data) {
      // 1. Filter jobs based on agent routing rules
      const filteredJobs = data
        .filter(b => !rejectedJobIds.includes(b.id))
        .filter(b => {
          const type = b.booking_type || 'any';
          if (type === 'any') return true;
          if (isStaff) return true; 
          if (!isStaff && type === 'freelance') return true;
          return false;
        });

      // 2. Fetch customer names manually to avoid ambiguity 
      const userIds = [...new Set(filteredJobs.map(b => b.user_id).filter(Boolean))];
      const { data: profilesData } = userIds.length > 0 
        ? await supabase.from('profiles').select('id, name').in('id', userIds)
        : { data: [] };
      const profileMap = Object.fromEntries(profilesData?.map(p => [p.id, p]) || []);

      // 3. Map final job list
      const mapped = filteredJobs.map(b => ({
          id: b.id,
          material: b.waste_type,
          bags: b.bags,
          location: b.estate,
          time: b.time_slot,
          status: b.status,
          agent_id: b.agent_id,
          user_id: b.user_id,
          customer: profileMap[b.user_id]?.name || 'Resident',
          bookingType: b.booking_type || 'any',
          pay: Number(b.fee) || Number(b.total_price) || 0,
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

    // 1. Fetch bookings via Security Definer RPC to bypass stubborn RLS policies
    const { data: bookingsData, error: bookingsError } = await supabase
      .rpc('get_active_agent_jobs', { agent_uuid: userId });

    console.log('[fetchActiveJobs] Fetched data:', bookingsData, 'Error:', bookingsError);

    if (bookingsError) {
      console.error('[fetchActiveJobs] RLS or DB error:', bookingsError);
      return;
    }

    // 2. Fetch associated profiles manually to avoid 400 ambiguity error
    const userIds = [...new Set(bookingsData.map(b => b.user_id).filter(Boolean))];
    const { data: profilesData } = userIds.length > 0 
      ? await supabase.from('profiles').select('id, name').in('id', userIds)
      : { data: [] };

    const profileMap = Object.fromEntries(profilesData?.map(p => [p.id, p]) || []);

    // 3. Map together
    const mapped = bookingsData.map(b => ({
      id: b.id,
      material: b.waste_type,
      bags: b.bags,
      pay: (b.fee || 0) * 0.85,
      location: b.estate,
      time: b.time_slot,
      status: b.status,
      latitude: b.latitude,
      longitude: b.longitude,
      phone: b.phone,
      user_id: b.user_id,
      customerName: profileMap[b.user_id]?.name || 'Customer'
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
      .select('id, fee, updated_at, status, waste_type, estate')
      .eq('agent_id', userId)
      .in('status', ['completed', 'cancelled'])
      .order('updated_at', { ascending: false })
      .limit(20);

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
        const agentPay = (b.fee || 0) * 0.85; // Agent commission is 85% (Founder Rate)

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
        jobHistory: data.map(b => ({
          id: b.id,
          wasteType: b.waste_type,
          location: b.estate,
          date: new Date(b.updated_at).toLocaleDateString(),
          status: b.status,
          price: (b.fee || 0) * 0.85
        })),
        earnings: {
          ...s.earnings,
          today: todayEarnings,
          thisWeek: thisWeekEarnings,
          lastWeek: lastWeekEarnings,
          thisMonth: thisMonthEarnings,
          completedToday,
          totalJobs: data.filter(b => b.status === 'completed').length,
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

      // 1. Bypass RLS using our Security Definer RPC, explicitly passing the agent ID
      const { error: updateError } = await supabase
        .rpc('accept_booking', { 
          target_booking_id: jobId,
          assigned_agent_id: userId
        });

      if (updateError) {
        console.error('[CleanFlow Agent] Accept Job Error:', updateError);
        throw new Error(updateError.message || 'Failed to claim job');
      }

      // DIAGNOSTIC: Check the actual row immediately using admin bypass to see what happened
      const { data: checkData } = await supabase
        .rpc('get_active_agent_jobs', { agent_uuid: userId });
      console.log(`[Diagnostic] Right after accept_booking on ${jobId}, get_active_agent_jobs returned:`, checkData);

      // 2. Refresh State
      await get().fetchAvailableJobs();
      await get().fetchActiveJobs();

      // 3. Notify Customer
      const activeList = get().activeJobs;
      const acceptedJob = activeList.find(j => j.id === jobId);

      if (acceptedJob && acceptedJob.user_id) {
        await useNotificationStore.getState().addNotification(
          'Agent is coming! 🚛',
          `HygeneX Agent ${profile.name} has accepted your request and is on the way.`,
          'success',
          ROLES.USER,
          acceptedJob.user_id
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

  /** Mark a job as completed with weighing (Auto-creates Asset for Weaver) */
  completeJob: async (jobId, weightKg) => {
    const { fetchActiveJobs, fetchEarnings } = get();
    const { userId } = useAuthStore.getState();
    
    console.log(`[CleanFlow Agent] Completing job ${jobId} with weight: ${weightKg}kg`);
    
    try {
      // 1. Get job data from local store first (faster/more reliable)
      const localJob = get().activeJobs.find(j => j.id === jobId);
      
      // 2. Fetch current booking to get waste type if not in local store
      const { data: booking } = !localJob ? await supabase
        .from('bookings')
        .select('*')
        .eq('id', jobId)
        .single() : { data: localJob };

      // 3. Create Asset Record (So Weaver can see it)
      const wasteType = localJob?.material || booking?.waste_type || 'general';
      const materialType = wasteType;
      const estimatedValue = weightKg * 40; // Default B2B value placeholder

      const { error: assetError } = await supabase
        .from('assets')
        .insert({
          booking_id: jobId,
          verifier_id: userId,
          material_type: materialType,
          weight_kg: weightKg,
          estimated_value: estimatedValue,
          status: 'verified',
          grade: 'B'
        });

      if (assetError) console.warn('[CleanFlow Agent] Asset creation failed during completion:', assetError);

      // 4. Fetch current market rate from dynamic categories
      const categorySlug = wasteType.toLowerCase();
      const { data: category } = await supabase
        .from('waste_categories')
        .select('price_per_unit, unit')
        .eq('slug', categorySlug)
        .single();

      const rate = category?.price_per_unit || 20.00; // Fallback price per KG
      const baseFee = 100.00; // Base Logistics
      const totalFee = baseFee + (weightKg * rate);

      // 4. Update Booking via Secure RPC (Bypass RLS)
      console.log('[AssetStore] Triggering handover modal via Secure RPC...');
      const { error: updateError } = await supabase.rpc('complete_booking_secure', {
        p_booking_uuid: jobId,
        p_agent_uuid: userId,
        p_weight_kg: weightKg,
        p_final_fee: totalFee
      });

      if (updateError) throw updateError;
      console.log('[AgentStore] Secure Completion SUCCESS');

      console.log('[CleanFlow Agent] Job status updated and Asset created.');

      // Refresh Agent UI
      fetchActiveJobs();
      fetchEarnings();
    } catch (err) {
      console.error('[CleanFlow Agent] Completion error:', err);
      throw err;
    }
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
