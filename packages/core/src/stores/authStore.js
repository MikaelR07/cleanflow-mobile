/**
 * authStore.js — CleanFlow KE Supabase Authentication & Profile State
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@cleanflow/supabase';
import { ROLES } from '@cleanflow/constants';
import { useNotificationStore, NOTIFICATION_TYPES } from './notificationStore.js';

// ── Normalize phone for email mapping ─────────────────
// Supabase Auth requires email by default. Since we don't have Twilio SMS setup,
// we map phone numbers to a dummy email for secure backend authentication.
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

function defaultNotifPrefs() {
  return {
    pickupReminders: true,
    aiInsights: true,
    rewardAlerts: true,
    emergencyAlerts: true,
    agentJobAlerts: true,
    systemAlerts: true,
    feedbackAlerts: true,
    dailyKpi: false,
    staffAlerts: true,
    channel: 'push',
  };
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      role: ROLES.USER,
      profile: null,
      rewardPoints: 0, // Aliased as GFP in UI
      walletBalance: 0,
      userId: null,
      notificationPrefs: defaultNotifPrefs(),
      profileSubscription: null,

      // ── INIT ─────────────────────────────────────────────────────────
      // Not strongly needed since zustand persist re-hydrates the token, 
      // but if Supabase session expires, we could handle it here.

      // ── REGISTRATION ─────────────────────────────────────────────────
      checkAvailability: async (phone) => {
        const normalized = normalizePhone(phone);
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', normalized)
          .maybeSingle(); // maybeSingle returns null without error code PGRST116

        if (error) {
          console.error('[CleanFlow Auth] Availability Check Error:', error);
          
          // 42501 = Permission Denied (RLS)
          // 500 = Internal Error (usually RLS recursion or schema mismatch)
          // In these cases, we shouldn't block the user with "Already Registered" message.
          if (error.code === '42501' || error.message.includes('500') || error.status === 500) {
            console.warn('[CleanFlow Auth] Server error during check. Proceeding as if available.');
            return true; 
          }
          return false;
        }
        
        return data === null; // If data is null, the number is available
      },

      register: async (userData) => {
        const { phone, pin, name, role, location, idNumber, vehicle } = userData;
        const assignedRole = role || ROLES.USER;
        const normalized = normalizePhone(phone);
        const email = phoneToEmail(normalized);

        // Security Constraint
        if (pin.length < 8) {
          throw new Error('Security passcode must be at least 8 characters long.');
        }

        const formattedName = name
          .trim()
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        // 1. Create secure Supabase Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: pin,
        });

        // Handle case where user already exists in Auth but not in Profiles
        if (authError) {
          if (authError.message.includes('already registered')) {
            throw new Error('This phone number is already part of the CleanFlow network. Please try logging in or using a different number.');
          }
          throw new Error(authError.message);
        }

        const user = authData.user;
        if (!user) throw new Error('Failed to provision secure account');

        const avatar = assignedRole === ROLES.AGENT ? '⚡' : '👤';

        // 2. Insert into Profiles
        const profilePayload = {
          id: user.id,
          name: formattedName,
          phone: normalized,
          role: assignedRole,
          location: location || { estate: 'Nairobi' },
          avatar,
          id_number: idNumber || null,
          vehicle: vehicle || null,
        };

        const { error: profileError } = await supabase.from('profiles').insert(profilePayload);
        if (profileError) {
          console.error('[CleanFlow Auth] Profile Insertion Failed:', profileError);
          // Attempt to keep Auth in sync? No, we'll let the user troubleshoot.
          throw new Error(`Account created but profile setup failed: ${profileError.message}`);
        }

        // 3. Update local state
        set({
          isAuthenticated: true,
          token: authData.session?.access_token,
          role: assignedRole,
          userId: user.id,
          profile: profilePayload,
        });
      },

      // ── LOGIN ─────────────────────────────────────────────────────────
      login: async (phone, pin, forcedRole) => {
        const email = phoneToEmail(phone);
        
        // 1. Authenticate with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password: pin
        });

        if (authError) throw new Error('Invalid credentials. Please check your phone and passcode.');

        const user = authData.user;

        // 2. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profileData) throw new Error('Could not retrieve profile data.');

        // Format to camelCase for UI compatibility
        const uiProfile = {
          ...profileData,
          idNumber: profileData.id_number,
          walletBalance: Number(profileData.wallet_balance || 0),
          rewardPoints: Number(profileData.reward_points || 0),
          subscriptionTier: profileData.subscription_tier,
          isOnline: profileData.is_online,
          notificationPrefs: profileData.notification_prefs || defaultNotifPrefs(),
          completedClearedAt: profileData.completed_cleared_at,
          cancelledClearedAt: profileData.cancelled_cleared_at,
          isVerified: profileData.is_verified,
          businessType: profileData.business_type,
          nemaLicense: profileData.nema_license,
        };

        if (forcedRole && uiProfile.role !== forcedRole) {
          await supabase.auth.signOut();
          throw new Error('Access Denied. Ensure you are logging into the correct portal.');
        }

        set({
          isAuthenticated: true,
          token: authData.session?.access_token,
          userId: user.id,
          role: uiProfile.role,
          profile: uiProfile,
          rewardPoints: uiProfile.rewardPoints,
          walletBalance: uiProfile.walletBalance,
          notificationPrefs: uiProfile.notificationPrefs
        });

        // Start real-time sync for this user
        get().subscribeToProfileChanges(user.id);
      },

      subscribeToProfileChanges: (uid) => {
        const id = uid || get().userId;
        if (!id) {
          console.warn('[CleanFlow Sync] Cannot subscribe: No User ID found.');
          return;
        }

        // Prevent duplicate subscriptions to the same profile
        if (get().profileSubscription) {
          console.log('[CleanFlow Sync] Already subscribed to profile updates.');
          return;
        }

        console.log(`[CleanFlow Sync] 📡 Opening Live Connection for User ID: ${id}`);
        
        const sub = supabase
          .channel(`profile-${id}`)
          .on(
            'postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${id}` },
            (payload) => {
              const updated = payload.new;
              console.log('[CleanFlow Sync] 🎁 LIVE UPDATE RECEIVED:', updated);
              console.table({
                Wallet: updated.wallet_balance,
                Points: updated.reward_points,
                XP: Number(updated.reward_points || 0)
              });
              
              set({
                profile: {
                  ...get().profile,
                  ...updated,
                  idNumber: updated.id_number,
                  walletBalance: Number(updated.wallet_balance || 0),
                  rewardPoints: Number(updated.reward_points || 0),
                  subscriptionTier: updated.subscription_tier,
                  isOnline: updated.is_online,
                  notificationPrefs: updated.notification_prefs || get().notificationPrefs,
                  completedClearedAt: updated.completed_cleared_at,
                  cancelledClearedAt: updated.cancelled_cleared_at,
                  isVerified: updated.is_verified,
                  businessType: updated.business_type,
                  nemaLicense: updated.nema_license,
                },
                rewardPoints: Number(updated.reward_points || 0),
                walletBalance: Number(updated.wallet_balance || 0)
              });
              
              // Event relay for UI toasts
              if (window.onCleanFlowProfileUpdate) {
                window.onCleanFlowProfileUpdate(updated);
              }
            }
          )
          .subscribe((status) => {
             console.log(`[CleanFlow Sync] 🔌 Connection Status: ${status}`);
          });

        set({ profileSubscription: sub });
      },

      // ── LOGOUT ────────────────────────────────────────────────────────
      logout: async () => {
        const { profileSubscription } = get();
        if (profileSubscription) {
          supabase.removeChannel(profileSubscription);
        }
        await supabase.auth.signOut();
        set({ isAuthenticated: false, token: null, role: ROLES.USER, profile: null, userId: null, profileSubscription: null });
      },

      // ── UPDATE PROFILE ────────────────────────────────────────────────
      getGFPMetrics: () => {
        const points = get().profile?.rewardPoints || 0;
        if (points <= 500) return { 
          tier: 'Seedling', 
          icon: '🌱', 
          nextTier: 'Sprout', 
          threshold: 500, 
          progress: (points / 500) * 100,
          color: '#22c55e'
        };
        if (points <= 2000) return { 
          tier: 'Sprout', 
          icon: '🌿', 
          nextTier: 'Oak', 
          threshold: 2000, 
          progress: ((points - 500) / 1500) * 100,
          color: '#16a34a'
        };
        return { 
          tier: 'Oak', 
          icon: '🌳', 
          nextTier: 'Maximum', 
          threshold: 5000, 
          progress: Math.min(((points - 2000) / 3000) * 100, 100),
          color: '#15803d'
        };
      },

      updateProfile: async (newData) => {
        const { userId, profile } = get();
        if (!userId) throw new Error("Not authenticated");

        // Map camelCase to snake_case for Supabase
        const dbPayload = { ...newData };
        if (dbPayload.idNumber !== undefined) {
          dbPayload.id_number = dbPayload.idNumber;
          delete dbPayload.idNumber;
        }
        if (dbPayload.completedClearedAt !== undefined) {
          dbPayload.completed_cleared_at = dbPayload.completedClearedAt;
          delete dbPayload.completedClearedAt;
        }
        if (dbPayload.cancelledClearedAt !== undefined) {
          dbPayload.cancelled_cleared_at = dbPayload.cancelledClearedAt;
          delete dbPayload.cancelledClearedAt;
        }
        if (dbPayload.isVerified !== undefined) {
          dbPayload.is_verified = dbPayload.isVerified;
          delete dbPayload.isVerified;
        }
        if (dbPayload.businessType !== undefined) {
          dbPayload.business_type = dbPayload.businessType;
          delete dbPayload.businessType;
        }
        if (dbPayload.nemaLicense !== undefined) {
          dbPayload.nema_license = dbPayload.nemaLicense;
          delete dbPayload.nemaLicense;
        }

        const { error } = await supabase.from('profiles').update(dbPayload).eq('id', userId);
        if (error) throw new Error(error.message);

        set({ profile: { ...profile, ...newData } });
      },

      // ── SECURITY ──────────────────────────────────────────────────────
      changePin: async (currentPin, newPin) => {
        const { profile } = get();
        if (!profile) throw new Error('Not authenticated');

        // Verify current pin indirectly by attempting to log in again
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: phoneToEmail(profile.phone),
          password: currentPin
        });

        if (verifyError) throw new Error('Current security password is incorrect');

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({ password: newPin });
        if (updateError) throw new Error(updateError.message);

        return true;
      },

      deleteAccount: async () => {
        const { userId, logout } = get();
        if (!userId) return;

        try {
          // Call Secure RPC to delete from auth.users (Cascades)
          const { error } = await supabase.rpc('delete_own_user');
          if (error) throw error;

          // Cleanup local state
          await logout();
          return true;
        } catch (error) {
          console.error('[CleanFlow Auth] Deactivation Failed:', error);
          throw new Error('Could not complete deactivation. Please try again or contact support.');
        }
      },

      // ── SUBSCRIPTIONS & REWARDS ───────────────────────────────────────
      updateSubscription: async (tier) => {
        const { userId, profile } = get();
        if(!userId) return;

        await supabase.from('profiles').update({ subscription_tier: tier }).eq('id', userId);
        set({ profile: { ...profile, subscriptionTier: tier } });
      },

      addReward: async (cashback, points) => {
        const { userId, profile } = get();
        if(!userId) return;

        // Note: Main reward logic is now handled by the 'credit_user_rewards' SQL trigger
        // for better consistency and security definer privileges. Use this for mock/fallback.
        const newBalance = (profile.walletBalance || 0) + cashback;
        const newPoints = (profile.rewardPoints || 0) + points;

        await supabase.from('profiles').update({ 
          wallet_balance: newBalance,
          reward_points: newPoints
        }).eq('id', userId);

        useNotificationStore.getState().addNotification(
          'Rewards Earned! 🌿',
          `You just earned KSh ${cashback} and ${points} XP for your environmental impact.`,
          NOTIFICATION_TYPES.REWARD,
          'user',
          userId
        );

        set({ profile: { ...profile, walletBalance: newBalance, rewardPoints: newPoints } });
      },

      withdrawRewards: async (amount) => {
        const { userId, profile } = get();
        if(!userId) return;

        const newBalance = (profile.walletBalance || 0) - amount;

        await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId);
        set({ profile: { ...profile, walletBalance: newBalance } });
      },

      // ── ONLINE STATUS Toggle ─────────────────────────────────────────
      toggleOnline: async (coords) => {
        const { userId, profile } = get();
        if (!userId) return;

        const newStatus = !profile.isOnline;
        
        // Defensive: Parse current location. If it's a legacy string, convert to object.
        let baseLocation = typeof profile.location === 'object' && profile.location !== null 
          ? profile.location 
          : { estate: typeof profile.location === 'string' ? profile.location : 'Nairobi' };

        // Merge coordinates into the location object if provided
        const updatedLocation = {
          ...baseLocation,
          ...(coords || {})
        };

        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_online: newStatus,
            location: updatedLocation 
          })
          .eq('id', userId);

        if (error) {
          console.error('[CleanFlow Auth] Toggle Online Error Details:', {
            code: error.code,
            message: error.message,
            hint: error.hint,
            details: error.details
          });
          throw new Error(`DB Error ${error.code}: ${error.message}`);
        }

        set({ 
          profile: { 
            ...profile, 
            isOnline: newStatus, 
            location: updatedLocation 
          } 
        });
      },

      // ── UPDATE NOTIFICATION PREFS ─────────────────────────────────────
      updateNotificationPrefs: async (newPrefs) => {
        const { profile, notificationPrefs } = get();
        const merged = { ...notificationPrefs, ...newPrefs };
        set({ notificationPrefs: merged });
        // Optional: Save to profiles table if you add a notification_prefs jsonb column
      },

      // ── MISC ──────────────────────────────────────────────────────────
      // No-op retained for API compatibility with app-level router guards
      checkAppRole: (currentApp) => {
        console.log(`[CleanFlow] Session active for: ${currentApp}`);
      },
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
