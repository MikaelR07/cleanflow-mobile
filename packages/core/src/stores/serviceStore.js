import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient.js';

export const useServiceStore = create((set, get) => ({
  categories: [],
  materialPrices: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('waste_categories')
        .select('*')
        .order('label');

      if (error) throw error;
      set({ categories: data });
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMaterialPrices: async () => {
    try {
      const { data, error } = await supabase
        .from('material_prices')
        .select('*');

      if (!error && data) {
        set({ materialPrices: data });
      }
    } catch (error) {
      console.error('Error fetching material prices:', error);
    }
  },

  updateCategory: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('waste_categories')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      set(state => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error };
    }
  },

  addCategory: async (category) => {
    try {
      const { data, error } = await supabase
        .from('waste_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      
      set(state => ({
        categories: [...state.categories, data]
      }));
      
      return { success: true, data };
    } catch (error) {
      console.error('Error adding category:', error);
      return { success: false, error };
    }
  }
}));
