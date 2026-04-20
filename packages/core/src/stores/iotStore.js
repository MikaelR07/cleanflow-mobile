/**
 * iotStore.js — CleanFlow KE IoT Infrastructure (Supabase)
 * Real-time monitoring for Smart Bins, Air Quality, and Wastewater.
 */
import { create } from 'zustand';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient.js';
import { useAuthStore } from './authStore.js';
import { useNotificationStore, NOTIFICATION_TYPES } from './notificationStore.js';

const INITIAL_STATE = {
  smartBins: [],
  airQuality: [],
  wastewater: [],
  isLoading: true,
  realtimeChannel: null,
};

function odourFromAqi(aqi) {
  if (aqi > 160) return 'Gas Leak Detected';
  if (aqi > 110) return 'Strong';
  if (aqi > 70) return 'Mild';
  return 'None';
}

export const useIotStore = create((set, get) => ({
  ...INITIAL_STATE,

  // ── INIT: fetch from Supabase + subscribe to realtime ──────────
  initDevices: async () => {
    // 1. Cleanup existing to prevent race conditions
    const existingChannel = get().realtimeChannel;
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    set({ isLoading: true });

    // 2. Initial Fetch — Only fetch devices owned by the user
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    const { data: devices, error } = await supabase
      .from('iot_devices')
      .select('*')
      .eq('owner_id', userId)
      .order('name', { ascending: true });

    if (!error && devices) {
      const bins = devices.filter(d => d.type === 'smart-bin').map(d => ({
        id: d.id,
        name: d.name,
        fillLevel: d.fill_level,
        visibility: d.visibility,
        lastUpdated: d.last_pulse,
        aiRecommended: d.fill_level > 85
      }));

      const air = devices.filter(d => d.type === 'air-quality').map(d => ({
        id: d.id,
        name: d.name,
        aqi: d.aqi,
        odourLevel: d.odour_level || odourFromAqi(d.aqi),
        trend: [], 
        lastUpdated: d.last_pulse
      }));

      const water = devices.filter(d => d.type === 'wastewater').map(d => ({
        id: d.id,
        name: d.name,
        efficiency: d.efficiency,
        lastUpdated: d.last_pulse
      }));

      set({ smartBins: bins, airQuality: air, wastewater: water });
    }

    // 3. Realtime Subscription (New Channel)
    const channel = supabase
      .channel(`iot_realtime_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'iot_devices' },
        (payload) => {
          const device = payload.new;
          if (!device) return;
          
          console.log('[CleanFlow IoT] Realtime Event Received:', payload.eventType, device);

          set((state) => {
            // Find which array the device belongs to if type is missing in payload
            let type = device.type;
            if (!type) {
              const inBins = state.smartBins.find(b => b.id === device.id);
              const inAir = state.airQuality.find(a => a.id === device.id);
              const inWater = state.wastewater.find(w => w.id === device.id);
              type = inBins ? 'smart-bin' : inAir ? 'air-quality' : inWater ? 'wastewater' : null;
            }

            if (type === 'smart-bin') {
              const updatedBins = state.smartBins.map(b => 
                b.id === device.id ? { 
                  ...b, 
                  fillLevel: device.fill_level ?? b.fillLevel, 
                  lastUpdated: device.last_pulse || b.lastUpdated, 
                  aiRecommended: (device.fill_level ?? b.fillLevel) > 85 
                } : b
              );
              if (device.fill_level >= 85) {
                toast.warning(`IoT Alert: ${device.name || 'Smart Bin'} is ${device.fill_level}% full.`, { icon: '🗑️' });
              }
              return { smartBins: updatedBins };
            }
            if (type === 'air-quality') {
              return {
                airQuality: state.airQuality.map(a => 
                  a.id === device.id ? { 
                    ...a, 
                    aqi: device.aqi ?? a.aqi, 
                    odourLevel: odourFromAqi(device.aqi ?? a.aqi), 
                    lastUpdated: device.last_pulse || a.lastUpdated 
                  } : a
                )
              };
            }
            if (type === 'wastewater') {
              return {
                wastewater: state.wastewater.map(w =>
                  w.id === device.id ? { 
                    ...w, 
                    efficiency: device.efficiency ?? w.efficiency, 
                    lastUpdated: device.last_pulse || w.lastUpdated 
                  } : w
                )
              };
            }
            return state;
          });
        }
      )
      .subscribe();

    set({ realtimeChannel: channel, isLoading: false });
  },

  stopDevices: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  },

  // ── UPDATE: Simulating IoT Pulse (usually called by Hardware) ──
  pulseDevice: async (id, updates) => {
    // CamelCase to SnakeCase for the JSONB payload
    const payload = {};
    if (updates.fillLevel !== undefined) payload.fill_level = updates.fillLevel;
    if (updates.aqi !== undefined) payload.aqi = updates.aqi;
    if (updates.efficiency !== undefined) payload.efficiency = updates.efficiency;

    console.log('[CleanFlow IoT] Simulating Pulse via RPC for:', id, payload);
    
    // Use RPC to bypass RLS UPDATE restrictions for regular users
    const { error } = await supabase.rpc('pulse_iot_device', {
      p_device_id: id,
      p_updates: payload
    });

    if (error) {
      console.error('[CleanFlow IoT] RPC Pulse Error:', error);
      toast.error('Cloud Sync Failed');
    } else {
      toast.info('Pulse Broadcasted... 📡');
    }
  },

  disposeAtBin: async (binId) => {
    await supabase.from('iot_devices').update({ 
      fill_level: 0, 
      last_pulse: new Date().toISOString() 
    }).eq('id', binId);
  },

  // ── LINK DEVICE: Claim an unclaimed device by serial ────────────
  linkDevice: async (serial) => {
    const { userId } = useAuthStore.getState();
    if (!userId) return { success: false, message: 'Auth Required' };

    try {
      // Use the RPC function for atomic claiming
      const { data, error } = await supabase.rpc('link_iot_device', {
        p_serial: serial,
        p_owner_id: userId
      });

      if (error) throw error;
      
      if (data.success) {
        // Refresh local state
        await get().initDevices();
        return { success: true, message: `Successfully linked ${data.name}` };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('[CleanFlow IoT] Link Error:', err);
      return { success: false, message: 'Failed to link device. Check serial number.' };
    }
  }
}));
