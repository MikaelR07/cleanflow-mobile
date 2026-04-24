/**
 * authStore.js — CleanFlow KE Supabase Authentication & Profile State
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@cleanflow/supabase';
import { ROLES } from '@cleanflow/constants';
import { useNotificationStore, NOTIFICATION_TYPES } from './notificationStore.js';

// ── Normalize phone for email mapping ─────────────────
export const normalizePhone = (num) => {
  const clean = (num || '').replace(/\D/g, ''); 
  if (clean.length === 10 && clean.startsWith('0')) {
    return '+254' + clean.slice(1);
  }
  if (clean.length >= 12 && clean.includes('254')) {
    return '+' + clean.replace('+', '');
  }
  return clean;
};

export const phoneToEmail = (phone) => `${normalizePhone(phone).replace('+', '')}@cleanflow.ke`;

export const getBusinessLabel = (type, mode = 'id') => {
  const labels = {
    weaver: { 
      id: 'Weaver ID', terminal: 'Weaver Terminal', role: 'Weaver',
      sourceA: 'From Agents', sourceB: 'From Peers', actionAdd: 'Add Private Collection'
    },
    recycler: { 
      id: 'Recycler ID', terminal: 'Processing Hub', role: 'Recycler',
      sourceA: 'From Weavers', sourceB: 'Market Buys', actionAdd: 'Log Bulk Purchase'
    },
    manufacturer: { 
      id: 'Partner ID', terminal: 'Industrial Terminal', role: 'Manufacturer',
      sourceA: 'Sourced from Recyclers', sourceB: 'Direct Procurement', actionAdd: 'Register Intake'
    },
    retailer: { 
      id: 'Merchant ID', terminal: 'Supply Terminal', role: 'Retailer',
      sourceA: 'Stock Sourcing', sourceB: 'B2B Procurement', actionAdd: 'Add Inventory'
    },
    ngo: { 
      id: 'Organization ID', terminal: 'Logistics Hub', role: 'NGO',
      sourceA: 'Field Sourcing', sourceB: 'Hub Transfers', actionAdd: 'Log Collection'
    },
    other: { 
      id: 'Business ID', terminal: 'Terminal', role: 'Business',
      sourceA: 'Sourcing', sourceB: 'Market', actionAdd: 'Add Records'
    }
  };
  const config = labels[type] || labels.other;
  return config[mode] || config.id;
};

function defaultNotifPrefs() {
  return {
    pickupReminders: true, aiInsights: true, rewardAlerts: true,
    emergencyAlerts: true, agentJobAlerts: true, systemAlerts: true,
    feedbackAlerts: true, dailyKpi: false, staffAlerts: true, channel: 'push',
  };
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      role: ROLES.USER,
      profile: null,
      rewardPoints: 0, 
      walletBalance: 0,
      userId: null,
      clientType: 'resident', // 'resident' | 'seller'
      notificationPrefs: defaultNotifPrefs(),
      profileSubscription: null,
      isInitializing: true,

      initializeAuth: async () => {
        // Prevent concurrent initialization calls which cause Supabase lock timeouts
        if (!get().isInitializing && get().isAuthenticated) return;
        
        set({ isInitializing: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileData) {
              const uiProfile = get()._mapProfile(profileData);
              set({ 
                isAuthenticated: true, 
                userId: session.user.id, 
                profile: uiProfile,
                role: uiProfile.role,
                clientType: uiProfile.clientType || 'resident'
              });
              get().subscribeToProfileChanges(session.user.id);
            }
          }
        } catch (err) {
          console.error('[CleanFlow Auth] Initialization failed:', err);
        } finally {
          set({ isInitializing: false });
        }
      },

      _mapProfile: (profileData) => ({
        ...profileData,
        idNumber: profileData.id_number,
        walletBalance: Number(profileData.wallet_balance || 0),
        rewardPoints: Number(profileData.reward_points || 0),
        subscriptionTier: profileData.subscription_tier,
        isOnline: profileData.is_online,
        isStaff: profileData.is_staff === true, // Strict boolean
        fleetId: profileData.fleet_id,
        notificationPrefs: profileData.notification_prefs || defaultNotifPrefs(),
        completedClearedAt: profileData.completed_cleared_at,
        cancelledClearedAt: profileData.cancelled_cleared_at,
        isVerified: profileData.is_verified,
        businessType: profileData.business_type,
        clientType: profileData.client_type || 'resident',
        specializations: profileData.specializations || [],
        nemaLicense: profileData.nema_license,
        notes: profileData.notes || '',
      }),

      subscribeToProfileChanges: (uid) => {
        const id = uid || get().userId;
        if (!id) return;
        
        // Clean up existing subscription if any to avoid the "after subscribe" error
        if (get().profileSubscription) {
          supabase.removeChannel(get().profileSubscription);
          set({ profileSubscription: null });
        }

        const channel = supabase.channel(`profile-${id}`);
        
        channel.on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles', 
          filter: `id=eq.${id}` 
        }, (payload) => {
          const updated = payload.new;
          console.log('[AuthStore] LIVE PROFILE UPDATE RECEIVED:', updated);
          
          set({
            profile: {
              ...get().profile,
              ...updated,
              idNumber: updated.id_number !== undefined ? updated.id_number : get().profile?.idNumber,
              isStaff: updated.is_staff !== undefined ? (updated.is_staff === true) : get().profile?.isStaff,
              fleetId: updated.fleet_id !== undefined ? updated.fleet_id : get().profile?.fleetId,
              notes: updated.notes !== undefined ? updated.notes : get().profile?.notes,
              walletBalance: Number(updated.wallet_balance !== undefined ? updated.wallet_balance : get().profile?.walletBalance || 0),
              rewardPoints: Number(updated.reward_points !== undefined ? updated.reward_points : get().profile?.rewardPoints || 0),
              clientType: updated.client_type || get().profile?.clientType || 'resident',
              notificationPrefs: updated.notification_prefs || get().notificationPrefs,
            },
            rewardPoints: Number(updated.reward_points !== undefined ? updated.reward_points : get().profile?.rewardPoints || 0),
            walletBalance: Number(updated.wallet_balance !== undefined ? updated.wallet_balance : get().profile?.walletBalance || 0),
            clientType: updated.client_type || get().clientType
          });
        });

        channel.subscribe();
        set({ profileSubscription: channel });
      },

      topUpBalance: async (amount) => {
    const { userId, profile } = get();
    if (!userId) return;

    console.log(`[AuthStore] Simulating STK Push for KSh ${amount}...`);
    const newBalance = (profile?.balance || 0) + Number(amount);

    const { data, error } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId)
      .select()
      .single();

    if (!error && data) {
      set({ profile: data });
      return true;
    }
    return false;
  },

  logout: async () => {
        const { profileSubscription } = get();
        if (profileSubscription) supabase.removeChannel(profileSubscription);
        await supabase.auth.signOut();
        set({ isAuthenticated: false, token: null, role: ROLES.USER, profile: null, userId: null, profileSubscription: null });
      },

      updateProfile: async (newData) => {
        const { userId, profile } = get();
        if (!userId) throw new Error("Not authenticated");
        const dbPayload = { ...newData };
        const VALID_COLUMNS = [
          'name', 'location', 'estate', 'avatar_url', 'id_number', 
          'vehicle', 'business_type', 'business_name', 'specializations', 
          'nema_license', 'is_verified', 'is_online', 'is_staff', 'notification_prefs', 'notes',
          'client_type'
        ];
        const sanitizedPayload = {};
        Object.entries(dbPayload).forEach(([key, value]) => {
          let dbKey = key;
          if (key === 'idNumber') dbKey = 'id_number';
          if (key === 'isStaff') dbKey = 'is_staff';
          if (key === 'nemaLicense') dbKey = 'nema_license';
          if (key === 'businessType') dbKey = 'business_type';
          if (key === 'clientType') dbKey = 'client_type';
          if (VALID_COLUMNS.includes(dbKey)) sanitizedPayload[dbKey] = value;
        });
        const { error } = await supabase.from('profiles').update(sanitizedPayload).eq('id', userId);
        if (error) throw new Error(error.message);
        set({ profile: { ...profile, ...newData } });
      },

      toggleOnline: async (coords = null) => {
        const { userId, profile } = get();
        if (!userId) throw new Error("Not authenticated");
        
        const isGoingOnline = !profile.isOnline;
        const updatePayload = {
          is_online: isGoingOnline
        };

        if (isGoingOnline && coords) {
          updatePayload.location = {
            ...profile.location,
            latitude: coords.latitude,
            longitude: coords.longitude,
            status: 'active',
            last_pulse: new Date().toISOString()
          };
        }

        const { error } = await supabase.from('profiles').update(updatePayload).eq('id', userId);
        if (error) throw new Error(error.message);
        
        set({ 
          profile: { 
            ...profile, 
            isOnline: isGoingOnline,
            location: updatePayload.location || profile.location
          } 
        });
      },

      withdrawRewards: async (amount) => {
        const { userId, walletBalance } = get();
        if (!userId) throw new Error("Not authenticated");
        if (amount > walletBalance) throw new Error("Insufficient funds");

        // Subtract from local wallet balance immediately for UI responsiveness
        const newBalance = walletBalance - amount;
        
        const { error } = await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', userId);
          
        if (error) throw new Error(error.message);

        set({ 
          walletBalance: newBalance,
          profile: { ...get().profile, walletBalance: newBalance }
        });
      },
      checkAvailability: async (phone) => {
        const email = phoneToEmail(phone);
        const { data } = await supabase.from('profiles').select('id').eq('email', email);
        return data?.length === 0;
      },

      sendOtp: async (phone) => {
        // In a real production environment, this would call a serverless function 
        // to send a real SMS via Africa's Talking. For this stage, we use Supabase OTP.
        const email = phoneToEmail(phone);
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        return true;
      },

      verifyOtp: async (phone, token) => {
        const email = phoneToEmail(phone);
        const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'magiclink' });
        if (error) throw error;
        return data;
      },

      register: async (userData) => {
        const { name, phone, pin, location, clientType } = userData;
        const email = phoneToEmail(phone);
        
        // 1. Sign up the user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: pin,
          options: { data: { full_name: name, phone } }
        });

        if (authError) throw authError;
        const user = authData.user;

        // 2. Create the profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email,
            name,
            phone,
            location,
            estate: location?.estate,
            role: ROLES.USER,
            client_type: clientType || 'resident',
            wallet_balance: 0,
            reward_points: 0,
            is_verified: true
          }]);

        if (profileError) throw profileError;

        // 3. Update local state
        const profile = { 
          id: user.id, name, phone, email, location, 
          role: ROLES.USER, clientType: clientType || 'resident',
          walletBalance: 0, rewardPoints: 0 
        };
        
        set({ 
          isAuthenticated: true, 
          userId: user.id, 
          profile, 
          role: ROLES.USER,
          clientType: clientType || 'resident'
        });
        
        get().subscribeToProfileChanges(user.id);
        return true;
      },
      
      login: async (phone, pin, forcedRole) => {
        const email = phoneToEmail(phone);
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pin });
        if (authError) throw new Error('Invalid credentials.');
        const user = authData.user;
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileError || !profileData) throw new Error('Retreival failed.');
        const uiProfile = get()._mapProfile(profileData);
        if (forcedRole && uiProfile.role !== forcedRole) {
          await supabase.auth.signOut();
          throw new Error('Access Denied.');
        }
        set({ 
          isAuthenticated: true, 
          token: authData.session?.access_token, 
          userId: user.id, 
          role: uiProfile.role, 
          profile: uiProfile, 
          rewardPoints: uiProfile.rewardPoints, 
          walletBalance: uiProfile.walletBalance, 
          clientType: uiProfile.clientType || 'resident',
          notificationPrefs: uiProfile.notificationPrefs 
        });
        get().subscribeToProfileChanges(user.id);
      },

      toggleClientType: async () => {
        const { clientType, updateProfile } = get();
        const nextType = clientType === 'resident' ? 'seller' : 'resident';
        set({ clientType: nextType });
        try {
          await updateProfile({ clientType: nextType });
        } catch (err) {
          console.error('[AuthStore] Failed to sync client type:', err);
        }
      },

      checkAppRole: (currentApp) => { console.log(`[CleanFlow] Role check: ${currentApp}`); },
    }),
    {
      name: 'cf_auth_session',
      partialize: (state) => {
        const { profileSubscription, ...rest } = state;
        return rest;
      }
    }
  )
);
