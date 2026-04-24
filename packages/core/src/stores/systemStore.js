import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export const useSystemStore = create((set, get) => ({
  config: {},
  isLoading: false,

  // Helpers to get dynamic values from config
  get supportPhone() {
    return this.config['support_number']?.value || '+254 700 000 000';
  },
  get whatsappNumber() {
    return this.config['whatsapp_number']?.value || '254700000000';
  },

  operatingHours: {
    monday: { active: true, start: '08:00', end: '18:00' },
    tuesday: { active: true, start: '08:00', end: '18:00' },
    wednesday: { active: true, start: '08:00', end: '18:00' },
    thursday: { active: true, start: '08:00', end: '18:00' },
    friday: { active: true, start: '08:00', end: '18:00' },
    saturday: { active: true, start: '09:00', end: '16:00' },
    sunday: { active: false, start: '09:00', end: '13:00' }
  },

  fetchConfig: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('system_config').select('*');
      if (error) throw error;
      
      const configMap = data.reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
      }, {});

      set({ config: configMap });
    } catch (err) {
      console.error('Error fetching system config:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateConfig: async (key, newValue) => {
    try {
      const { error } = await supabase
        .from('system_config')
        .update({ value: newValue, updated_at: new Date().toISOString() })
        .eq('key', key);
      if (error) throw error;
      
      const { config } = get();
      set({ config: { ...config, [key]: { ...config[key], value: newValue } } });
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  // Legacy Compatibility Helpers
  updateOperatingHours: async (hours) => {
    set({ operatingHours: hours });
    return { success: true };
  },

  getConfigValue: (key, defaultValue = 0) => {
    const { config } = get();
    return config[key] ? config[key].value : defaultValue;
  }
}));
