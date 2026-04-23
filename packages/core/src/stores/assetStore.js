/**
 * assetStore.js — CleanFlow KE Waste-as-Asset Management
 * Handles verified assets, grading logic, and weaver matching.
 */
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient.js';
import { useAuthStore } from './authStore.js';
import { useNotificationStore, NOTIFICATION_TYPES } from './notificationStore.js';

export const ASSET_GRADES = {
  A: { label: 'Grade A', description: 'Clean, sorted, industrial quality', multiplier: 1.2 },
  B: { label: 'Grade B', description: 'Mixed, minimal contamination', multiplier: 1.0 },
  C: { label: 'Grade C', description: 'Highly contaminated, needs heavy cleaning', multiplier: 0.7 },
};

export const MATERIAL_TYPES = {
  PET: { name: 'PET Plastic', basePrice: 45 },
  HDPE: { name: 'HDPE Plastic', basePrice: 55 },
  PAPER: { name: 'Mixed Paper', basePrice: 20 },
  CARDBOARD: { name: 'Cardboard', basePrice: 25 },
  METAL: { name: 'Scrap Metal', basePrice: 80 },
  EWASTE: { name: 'E-Waste', basePrice: 150 },
  GLASS: { name: 'Glass', basePrice: 15 },
};

export const ASSET_SOURCES = {
  VERIFIED: 'verified',    // From Agent pickup
  SELF: 'self_declared',   // Side collection
};

export const useAssetStore = create((set, get) => ({
  assets: [],
  liveFeed: [],
  isLoading: false,

  // ── FETCH ASSETS ───────────────────────────────────────────
  fetchAssets: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('assets')
      .select(`
        *,
        booking:bookings (waste_type, estate, user_id),
        verifier:profiles!verifier_id (name),
        weaver:profiles!weaver_id (name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      set({ assets: data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  // ── LIVE FEED (Realtime ready) ─────────────────────────────
  fetchLiveFeed: async () => {
    console.log('[AssetStore] Fetching Live Feed...');
    const { data, error } = await supabase
      .from('assets')
      .select('*, booking:bookings(estate, waste_type)')
      .eq('status', 'verified')
      .limit(10)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AssetStore] Live Feed Fetch ERROR:', error);
      return;
    }

    if (data) {
      console.log('[AssetStore] Live Feed Data Received:', data.length, 'items');
      set({ liveFeed: data });
    }
  },

  // ── VERIFY ASSET (CALLED BY AGENT) ──────────────────────────
  verifyAsset: async (bookingId, verificationData) => {
    const { userId } = useAuthStore.getState();
    if (!userId) throw new Error('Not authenticated');

    console.log('[AssetStore] Starting verification for booking:', bookingId);
    console.log('[AssetStore] Verification Payload:', verificationData);

    set({ isLoading: true });

    try {
      // 0. Check for existing asset to prevent duplicates
      const { data: existing } = await supabase
        .from('assets')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();
      
      if (existing) {
        console.log('[AssetStore] Asset already exists for this booking:', existing.id);
        set({ isLoading: false });
        return existing;
      }

      // 1. Calculate Value
      const material = MATERIAL_TYPES[verificationData.materialType] || { basePrice: 10 };
      const grade = ASSET_GRADES[verificationData.grade] || ASSET_GRADES.B;
      const estimatedValue = verificationData.weightKg * material.basePrice * grade.multiplier;

      // 2. Create Asset Record
      console.log('[AssetStore] Inserting into assets table...');
      const { data: asset, error: assetError } = await supabase
        .from('assets')
        .insert({
          booking_id: bookingId,
          verifier_id: userId,
          material_type: verificationData.materialType,
          grade: verificationData.grade,
          weight_kg: verificationData.weightKg,
          estimated_value: estimatedValue,
          purity_score: verificationData.purityScore || 85,
          photo_url: verificationData.photoUrl || null,
          status: 'verified'
        })
        .select()
        .single();

      if (assetError) {
        console.error('[AssetStore] Asset INSERT ERROR:', assetError);
        throw assetError;
      }

      console.log('[AssetStore] Asset created successfully:', asset.id);

      // 3. Update Booking via Secure RPC (Bypass RLS)
      console.log('[AssetStore] Triggering handover modal via Secure RPC...');
      const { error: bookingError } = await supabase.rpc('complete_booking_secure', {
        p_booking_uuid: bookingId,
        p_agent_uuid: userId,
        p_weight_kg: verificationData.weightKg,
        p_final_fee: estimatedValue
      });

      if (bookingError) {
        console.error('[AssetStore] Booking UPDATE ERROR:', bookingError);
        throw bookingError;
      }
      console.log('[AssetStore] Secure Completion SUCCESS');

      // 4. Notify User
      await useNotificationStore.getState().addNotification(
        'Asset Verified! 💎',
        `Your waste has been graded as ${verificationData.grade} ${verificationData.materialType}. Value: KSh ${estimatedValue.toLocaleString()}.`,
        NOTIFICATION_TYPES.SUCCESS,
        'user',
        verificationData.ownerId
      );

      set(state => ({ assets: [asset, ...state.assets], isLoading: false }));
      return asset;
    } catch (err) {
      console.error('[AssetStore] Verification CRASH:', err);
      set({ isLoading: false });
      throw err;
    }
  },

  // ── CLAIM ASSET (CALLED BY WEAVER) — Escrow-backed acquisition ──────────────────────────
  claimAsset: async (assetId) => {
    const { userId } = useAuthStore.getState();
    if (!userId) throw new Error('Not authenticated');

    set({ isLoading: true });

    try {
      console.log('[AssetStore] Claiming asset via Secure RPC...', assetId);
      const { error } = await supabase.rpc('weaver_claim_asset', {
        p_asset_id: assetId,
        p_weaver_id: userId
      });

      if (error) throw error;

      // Update local state
      set(state => ({
        liveFeed: state.liveFeed.filter(a => a.id !== assetId),
        isLoading: false
      }));

      console.log('[AssetStore] Asset claimed successfully!');
      return true;
    } catch (err) {
      console.error('[AssetStore] Claim Failed:', err);
      set({ isLoading: false });
      throw err;
    }
  },

  // ── ADD SIDE COLLECTION (WEAVER SELF-DECLARE) ────────────────
  addSideCollection: async (data) => {
    const { userId } = useAuthStore.getState();
    set({ isLoading: true });

    try {
      const material = MATERIAL_TYPES[data.materialType] || { basePrice: 10 };
      const estimatedValue = data.weightKg * material.basePrice;

      const { data: asset, error } = await supabase
        .from('assets')
        .insert({
          weaver_id: userId,
          material_type: data.materialType,
          weight_kg: data.weightKg,
          estimated_value: estimatedValue,
          status: 'matched', // Weavers own their side collection immediately
          source: ASSET_SOURCES.SELF,
          grade: 'B', // Default for self-declared
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      set(state => ({ assets: [asset, ...state.assets], isLoading: false }));
      return asset;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  }
}));
