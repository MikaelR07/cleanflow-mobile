import { create } from 'zustand';
import { supabase } from '../index';

export const usePriceStore = create((set, get) => ({
  prices: [],
  isLoading: false,

  fetchPrices: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('material_prices')
        .select('*')
        .order('material_name');

      if (error) throw error;
      set({ prices: data });
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updatePrice: async (id, newPrice) => {
    try {
      const { data, error } = await supabase
        .from('material_prices')
        .update({ 
          price_per_kg: newPrice, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Update failed: Material record not found in database.');
      }
      
      // Update local state
      set(state => ({
        prices: state.prices.map(p => p.id === id ? { ...p, price_per_kg: newPrice } : p)
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating price:', error);
      return { success: false, error };
    }
  },

  getPriceForMaterial: (materialName) => {
    const { prices } = get();
    // Try exact match or fuzzy match
    const priceObj = prices.find(p => 
      p.material_name.toLowerCase().includes(materialName.toLowerCase()) ||
      materialName.toLowerCase().includes(p.material_name.toLowerCase())
    );
    return priceObj ? priceObj.price_per_kg : 10; // Default KSh 10
  }
}));
