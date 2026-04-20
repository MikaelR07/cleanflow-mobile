/**
 * systemStore.js — CleanFlow KE Global System Config (Supabase)
 * Reads/writes to `system_config` table (single row: id='global_settings')
 */
import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient.js';

export const useSystemStore = create((set, get) => ({
  supportPhone: '+254113787588',
  whatsappNumber: '254113787588',
  minPickupFee: 100,
  kgPrice: 20,
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
        whatsappNumber: data.whatsapp_number.replace(/[^0-9]/g, ''),
        minPickupFee: Number(data.min_pickup_fee),
        kgPrice: Number(data.kg_price),
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

  updatePricing: async (minFee, kgPrice) => {
    const { error } = await supabase
      .from('system_config')
      .update({ min_pickup_fee: minFee, kg_price: kgPrice })
      .eq('id', 'global_settings');

    if (error) throw new Error(error.message);
    set({ minPickupFee: minFee, kgPrice });
  },
}));
