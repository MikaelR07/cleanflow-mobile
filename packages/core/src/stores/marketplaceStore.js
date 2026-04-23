/**
 * marketplaceStore.js — CleanFlow KE B2B Marketplace (Supabase)
 * Handles listings, orders, and real-time updates.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient.js';
import { useAuthStore } from './authStore.js';

export const CATEGORIES = [
  { id: 'plastic', name: 'Plastic',  icon: '🥤', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 'paper',   name: 'Paper',    icon: '📄', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: 'metal',   name: 'Metal',    icon: '🥫', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  { id: 'glass',   name: 'Glass',    icon: '🍾', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { id: 'organic', name: 'Organic',  icon: '🍎', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  { id: 'ewaste',  name: 'E-Waste',  icon: '💻', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
];

const MATERIAL_EMOJIS = {
  Plastic: '🥤', Paper: '📄', Metal: '🥫',
  Glass: '🍾', Organic: '🍎', 'E-Waste': '💻',
};

export const useMarketplaceStore = create(
  persist(
    (set, get) => ({
      listings:   [],
      myListings: [],
      myOrders:   [],
      categories: CATEGORIES,
      isLoading:  false,

      // ── FETCH ALL ACTIVE LISTINGS (with seller name) ─────────────
      fetchListings: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select(`
            *,
            seller:profiles!seller_id (name, location, is_verified)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Marketplace] Fetch failed:', error);
          set({ isLoading: false });
          return;
        }

        const mapped = data.map(l => ({
          id:           l.id,
          material:     l.material,
          quantity:     l.quantity,
          pricePerKg:   l.price_per_kg,
          location:     l.seller?.location?.estate || l.location || 'Nairobi',
          sellerId:     l.seller_id,
          sellerName:   l.seller?.name || 'Unknown Seller',
          isVerified:   l.seller?.is_verified || false,
          status:       l.status,
          photo:        l.photo_url,
          description:  l.description,
          grade:        l.grade,
          unit:         l.unit || 'KG',
          moq:          l.moq || 1,
          aiMatchScore: l.ai_match_score,
          views:        l.views || 0,
          offers:       l.offers || 0,
          createdAt:    l.created_at,
        }));

        set({ listings: mapped, isLoading: false });
      },

      // ── FETCH MY LISTINGS + MY ORDERS ────────────────────────────
      fetchMyActivity: async () => {
        const { userId } = useAuthStore.getState();
        if (!userId) return;
        set({ isLoading: true });

        const [{ data: listings }, { data: orders }] = await Promise.all([
          supabase
            .from('marketplace_listings')
            .select('*')
            .eq('seller_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('marketplace_orders')
            .select(`
              *,
              listing:marketplace_listings!listing_id (
                material, photo_url,
                seller:profiles!seller_id (name)
              ),
              booking:bookings!booking_id (id, status, agent_id)
            `)
            .eq('buyer_id', userId)
            .order('created_at', { ascending: false }),
        ]);

        const mappedListings = (listings || []).map(l => ({
          id:           l.id,
          material:     l.material,
          quantity:     l.quantity,
          pricePerKg:   l.price_per_kg,
          location:     l.location,
          status:       l.status,
          photo:        l.photo_url,
          grade:        l.grade,
          unit:         l.unit || 'KG',
          moq:          l.moq || 1,
          views:        l.views || 0,
          offers:       l.offers || 0,
          createdAt:    l.created_at,
        }));

        const mappedOrders = (orders || []).map(o => ({
          id:          o.id,
          listingId:   o.listing_id,
          material:    o.material || o.listing?.material || 'Recyclable',
          photo:       o.listing?.photo_url,
          sellerName:  o.listing?.seller?.name || 'Unknown Seller',
          quantity:    o.quantity,
          unitPrice:   o.unit_price,
          totalPrice:  o.total_price,
          status:      o.status,
          message:     o.message,
          bookingId:   o.booking_id,
          logisticsStatus: o.booking?.status || null,
          createdAt:   o.created_at,
          emoji:       MATERIAL_EMOJIS[o.material] || '♻️',
        }));

        set({ myListings: mappedListings, myOrders: mappedOrders, isLoading: false });
      },

      // ── POST A NEW LISTING ────────────────────────────────────────
      postListing: async (listingData) => {
        const { userId } = useAuthStore.getState();
        if (!userId) throw new Error('Not authenticated');
        set({ isLoading: true });

        const { data, error } = await supabase
          .from('marketplace_listings')
          .insert({
            seller_id:     userId,
            material:      listingData.material,
            quantity:      listingData.quantity,
            price_per_kg:  listingData.pricePerKg,
            description:   listingData.description,
            location:      listingData.location,
            photo_url:     listingData.photo || null,
            grade:         listingData.grade || null,
            unit:          listingData.unit || 'KG',
            moq:           listingData.moq || 1,
            ai_match_score: Math.floor(Math.random() * 15) + 85,
          })
          .select()
          .single();

        if (error) {
          set({ isLoading: false });
          throw new Error(error.message);
        }

        const newListing = {
          id: data.id, material: data.material, quantity: data.quantity,
          pricePerKg: data.price_per_kg, location: data.location,
          status: data.status, photo: data.photo_url,
          views: 0, offers: 0, createdAt: data.created_at,
        };

        set(state => ({
          listings:   [newListing, ...state.listings],
          myListings: [newListing, ...state.myListings],
          isLoading:  false,
        }));

        toast.success('Listing Posted 🎉', {
          description: 'Your recyclable waste is now live on the marketplace.',
        });
      },

      // ── UPDATE LISTING STATUS ─────────────────────────────────────
      updateListingStatus: async (id, status) => {
        const { error } = await supabase
          .from('marketplace_listings')
          .update({ status })
          .eq('id', id);

        if (!error) {
          set(state => ({
            listings:   state.listings.map(l   => l.id === id ? { ...l, status } : l),
            myListings: state.myListings.map(l => l.id === id ? { ...l, status } : l),
          }));
          toast.success(`Listing marked as ${status}`);
        }
      },

      // ── PLACE AN ORDER ────────────────────────────────────────────
      placeOrder: async (listing, quantity, message = '') => {
        const { userId } = useAuthStore.getState();
        if (!userId) throw new Error('Not authenticated');
        if (userId === listing.sellerId) throw new Error('You cannot buy your own listing.');
        if (Number(quantity) < (listing.moq || 1)) {
          throw new Error(`Minimum order quantity for this listing is ${listing.moq}${listing.unit}.`);
        }
        set({ isLoading: true });

        const totalPrice = Number(quantity) * listing.pricePerKg;

        const { data, error } = await supabase
          .from('marketplace_orders')
          .insert({
            listing_id:  listing.id,
            buyer_id:    userId,
            material:    listing.material,
            quantity:    Number(quantity),
            unit_price:  listing.pricePerKg,
            total_price: totalPrice,
            status:      'held_in_escrow', // Auto-initiate escrow
            message:     message || null,
          })
          .select()
          .single();

        if (error) {
          set({ isLoading: false });
          throw new Error(error.message);
        }

        const newOrder = {
          id:         data.id,
          listingId:  data.listing_id,
          material:   data.material,
          sellerName: listing.sellerName,
          quantity:   data.quantity,
          unitPrice:  data.unit_price,
          totalPrice: data.total_price,
          status:     data.status,
          createdAt:  data.created_at,
          emoji:      MATERIAL_EMOJIS[data.material] || '♻️',
        };

        set(state => ({
          myOrders:  [newOrder, ...state.myOrders],
          isLoading: false,
        }));

        toast.success('Order Placed! 🚀', {
          description: `${quantity}kg of ${listing.material} — KES ${totalPrice.toLocaleString()} committed.`,
        });
      },

      // ── CANCEL AN ORDER ───────────────────────────────────────────
      cancelOrder: async (orderId) => {
        const { error } = await supabase
          .from('marketplace_orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);

        if (!error) {
          set(state => ({
            myOrders: state.myOrders.map(o =>
              o.id === orderId ? { ...o, status: 'cancelled' } : o
            ),
          }));
          toast.success('Order Cancelled');
        }
      },

      // ── DISPUTE AN ORDER ──────────────────────────────────────────
      disputeOrder: async (orderId, reason) => {
        set({ isLoading: true });
        try {
          const { error } = await supabase
            .from('marketplace_orders')
            .update({ 
              status: 'disputed',
              message: `DISPUTE: ${reason}` 
            })
            .eq('id', orderId);

          if (error) throw error;

          set(state => ({
            myOrders: state.myOrders.map(o =>
              o.id === orderId ? { ...o, status: 'disputed' } : o
            ),
          }));

          toast.warning('Order Disputed', {
            description: 'Platform admins have been notified to mediate this trade.'
          });
        } catch (err) {
          toast.error('Failed to initiate dispute.');
        } finally {
          set({ isLoading: false });
        }
      },

      // ── GET FINANCIAL SUMMARY ─────────────────────────────────────
      getFinancialSummary: async () => {
        const { userId } = useAuthStore.getState();
        if (!userId) return null;

        const { data, error } = await supabase
          .from('marketplace_orders')
          .select('total_price, status')
          .eq('status', 'funds_released')
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

        if (error) return null;

        const totalVolume = data.reduce((sum, o) => sum + o.total_price, 0);
        const totalFees = totalVolume * 0.10;
        
        return {
          totalVolume,
          totalFees,
          netEarnings: totalVolume - totalFees
        };
      },
      
      // ── REQUEST TRANSPORT (Logistics Integration) ───────────────
      requestTransport: async (order) => {
        const { createBooking } = (await import('./bookingStore.js')).useBookingStore.getState();
        set({ isLoading: true });
        
        try {
          // 1. Create the booking
          const newBooking = await createBooking({
            wasteType: order.material,
            estate: 'Nairobi', // Default for now, could be dynamic
            bags: 1,
            amount: 500, // Standard B2B Freight fee placeholder
            notes: `B2B Transport for Order #${order.id.slice(0, 8)}`,
          });
          
          // 2. Link booking to order
          const { error } = await supabase
            .from('marketplace_orders')
            .update({ booking_id: newBooking.id })
            .eq('id', order.id);
            
          if (error) throw error;
          
          // 3. Update local state
          set(state => ({
            myOrders: state.myOrders.map(o => 
              o.id === order.id ? { ...o, bookingId: newBooking.id, logisticsStatus: 'pending' } : o
            )
          }));
          
          toast.success('Transport Requested! 🚛', {
            description: 'Our Green Agent network has been notified.'
          });
        } catch (err) {
          console.error('[Marketplace] Transport Request Failed:', err);
          toast.error('Failed to request transport.');
        } finally {
          set({ isLoading: false });
        }
      },

      // ── ESCROW RELEASE (AUTOMATED COMMISSION SPLIT) ──────────────
      releaseEscrow: async (order) => {
        set({ isLoading: true });
        
        try {
          // Update Order Status — The Database Trigger handles the 90/10 payout
          const { error } = await supabase
            .from('marketplace_orders')
            .update({ status: 'funds_released' })
            .eq('id', order.id);

          if (error) throw error;

          // Update local state
          set(state => ({
            myOrders: state.myOrders.map(o => 
              o.id === order.id ? { ...o, status: 'funds_released' } : o
            )
          }));

          toast.success('Funds Released! 💸', {
            description: `Payment has been successfully transferred to the seller.`
          });
        } catch (err) {
          console.error('[Escrow] Release Failed:', err);
          toast.error('Failed to release escrow funds.');
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    { name: 'cf_marketplace_v3' }
  )
);
