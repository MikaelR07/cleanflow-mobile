import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient.js';

const DEFAULT_CATEGORIES = [
  { id: 'general', label: 'General Waste', icon: '🗑️', description: 'Regular household trash', is_active: true },
  { id: 'recyclable', label: 'Recyclable', icon: '♻️', description: 'Plastics, Paper, Cardboard', is_active: true },
  { id: 'organic', label: 'Organic / Food', icon: '🍎', description: 'Food scraps and greens', is_active: true },
  { id: 'metal', label: 'Metal', icon: '⛓️', description: 'Scrap metal, cans, tins', is_active: true },
  { id: 'ewaste', label: 'E-Waste', icon: '💻', description: 'Electronics, batteries', is_active: true },
  { id: 'bulky', label: 'Bulky Item', icon: '🛋️', description: 'Furniture, mattresses', is_active: true },
  { id: 'appliances', label: 'Large Appliances', icon: '🧊', description: 'Fridges, Washers, Cookers', is_active: true },
  { id: 'hazardous', label: 'Hazardous', icon: '⚠️', description: 'Chemicals, paints, oils', is_active: true },
];

export const useServiceStore = create((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  allCategories: [],  // For admin view (includes inactive)
  materialPrices: [],
  isLoading: false,

  // Client-facing: only active categories
  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('waste_categories')
        .select('*')
        .eq('is_active', true)
        .order('label');

      if (!error && data && data.length > 0) {
        set({ categories: data });
      } else {
        set({ categories: DEFAULT_CATEGORIES });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ categories: DEFAULT_CATEGORIES });
    } finally {
      set({ isLoading: false });
    }
  },

  // Admin-facing: all categories including inactive
  fetchAllCategories: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('waste_categories')
        .select('*')
        .order('label');

      if (!error && data) {
        set({ allCategories: data });
      }
    } catch (error) {
      console.error('Error fetching all categories:', error);
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
      
      // Update both local lists
      const updater = (c) => c.id === id ? { ...c, ...updates } : c;
      set(state => ({
        categories: state.categories.map(updater),
        allCategories: state.allCategories.map(updater)
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error };
    }
  },

  toggleCategory: async (id, isActive) => {
    return get().updateCategory(id, { is_active: isActive });
  },

  addCategory: async (category) => {
    try {
      const slug = (category.label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { data, error } = await supabase
        .from('waste_categories')
        .insert({ ...category, slug, is_active: true, price_per_unit: category.price_per_unit || 0 })
        .select()
        .single();

      if (error) throw error;
      
      set(state => ({
        categories: [...state.categories, data],
        allCategories: [...state.allCategories, data]
      }));
      
      return { success: true, data };
    } catch (error) {
      console.error('Error adding category:', error);
      return { success: false, error };
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase
        .from('waste_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set(state => ({
        categories: state.categories.filter(c => c.id !== id),
        allCategories: state.allCategories.filter(c => c.id !== id)
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error };
    }
  }
}));

