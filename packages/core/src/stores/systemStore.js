/**
 * systemStore.js — CleanFlow KE Global System Config (Supabase)
 * Reads/writes to `system_config` table (single row: id='global_settings')
 */
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient.js';

const DEFAULT_HOURS = {
  monday: { active: true, start: "08:00", end: "18:00" },
  tuesday: { active: true, start: "08:00", end: "18:00" },
  wednesday: { active: true, start: "08:00", end: "18:00" },
  thursday: { active: true, start: "08:00", end: "18:00" },
  friday: { active: true, start: "08:00", end: "18:00" },
  saturday: { active: true, start: "09:00", end: "13:00" },
  sunday: { active: false, start: "09:00", end: "12:00" }
};

export const useSystemStore = create((set, get) => ({
  supportPhone: '+254113787588',
  whatsappNumber: '254113787588',
  minPickupFee: 100,
  kgPrice: 20,
  operatingHours: DEFAULT_HOURS,
  isLoaded: false,

  // Fetch config from Supabase on app boot
  fetchConfig: async () => {
    if (get().isLoaded) return;
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('id', 'global_settings')
      .single();

    if (!error && data) {
      set({
        supportPhone: data.support_number,
        whatsappNumber: (data.whatsapp_number || '').replace(/[^0-9]/g, ''),
        minPickupFee: Number(data.min_pickup_fee),
        kgPrice: Number(data.kg_price),
        operatingHours: data.operating_hours || DEFAULT_HOURS,
        isLoaded: true,
      });
    }
  },

  // Admin: update the global config
  updateSupportContacts: async (phone, whatsapp) => {
    const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
    const { error } = await supabase
      .from('system_config')
      .update({ support_number: phone, whatsapp_number: cleanWhatsapp })
      .eq('id', 'global_settings');

    if (error) throw new Error(error.message);
    set({ supportPhone: phone, whatsappNumber: cleanWhatsapp });
  },

  updateOperatingHours: async (hours) => {
    const { error } = await supabase
      .from('system_config')
      .update({ operating_hours: hours })
      .eq('id', 'global_settings');

    if (error) throw new Error(error.message);
    set({ operatingHours: hours });
  },

  updatePricing: async (minFee, kgPrice) => {
    const { error } = await supabase
      .from('system_config')
      .update({ min_pickup_fee: minFee, kg_price: kgPrice })
      .eq('id', 'global_settings');

    if (error) throw new Error(error.message);
    set({ minPickupFee: minFee, kgPrice });
  },
}));
