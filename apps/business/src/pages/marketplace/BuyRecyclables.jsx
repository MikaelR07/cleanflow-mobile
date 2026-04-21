import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, Search, ArrowLeft, MapPin, Tag, 
  ShoppingCart, Loader2, X, Package, BadgeCheck
} from 'lucide-react';
import { useMarketplaceStore, useAuthStore } from '@cleanflow/core';
import { toast } from 'sonner';

export default function BuyRecyclables() {
  const { listings, fetchListings, placeOrder, isLoading } = useMarketplaceStore();
  const { userId } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [orderModal, setOrderModal] = useState(null); // { listing }
  const [orderQty, setOrderQty] = useState('');
  const [orderMsg, setOrderMsg] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      const matchesSearch = item.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMaterial = selectedMaterial === 'All' || item.material === selectedMaterial;
      return matchesSearch && matchesMaterial;
    });
  }, [listings, searchQuery, selectedMaterial]);

  const handlePlaceOrder = async () => {
    if (!orderQty || Number(orderQty) <= 0) {
      toast.error('Invalid Quantity', { description: 'Please enter a valid quantity in KG.' });
      return;
    }
    if (Number(orderQty) > orderModal.quantity) {
      toast.error('Exceeds Available Stock', { description: `Only ${orderModal.quantity}kg available.` });
      return;
    }
    setIsOrdering(true);
    try {
      await placeOrder(orderModal, Number(orderQty), orderMsg);
      setOrderModal(null);
      setOrderQty('');
      setOrderMsg('');
    } catch (err) {
      toast.error('Order Failed', { description: err.message });
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">B2B Market</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredListings.length} active listings</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search material or seller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm shadow-sm dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl border transition-all ${showFilters ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Material Filter Pills */}
      {showFilters && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Material</p>
          <div className="flex flex-wrap gap-2">
            {['All', 'Plastic', 'Paper', 'Metal', 'Glass', 'Organic', 'E-Waste'].map(mat => (
              <button
                key={mat}
                onClick={() => setSelectedMaterial(mat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedMaterial === mat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Listings */}
      <div className="space-y-4">
        {isLoading && listings.length === 0 ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Loading marketplace...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          filteredListings.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/20 transition-all group">
              {/* Image */}
              <div className="relative aspect-[16/8] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={item.photo} alt={item.material} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black text-primary shadow-lg border border-primary/20">
                    {item.aiMatchScore}% MATCH
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-black/40 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {item.material}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">{item.material} Batch</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-0.5">
                      <MapPin className="w-3 h-3 text-primary" /> {item.location} 
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1">
                        {item.sellerName}
                        {item.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-primary block leading-none">KES {item.pricePerKg}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">per {item.unit}</span>
                  </div>
                </div>

                {item.grade && (
                  <div className="mb-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg inline-flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Grade</span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{item.grade}</span>
                  </div>
                )}

                {item.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.description}</p>
                )}

                <div className="flex items-center gap-4 py-3 border-y border-slate-100 dark:border-slate-800 my-3 text-center">
                  <div className="flex-1 border-r border-slate-100 dark:border-slate-800">
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Available</div>
                    <div className="text-sm font-black text-slate-800 dark:text-white">{item.quantity} {item.unit}</div>
                  </div>
                  <div className="flex-1 border-r border-slate-100 dark:border-slate-800">
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Min. MOQ</div>
                    <div className="text-sm font-black text-slate-800 dark:text-white">{item.moq} {item.unit}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Est. Value</div>
                    <div className="text-sm font-black text-slate-800 dark:text-white">KES {(item.quantity * item.pricePerKg).toLocaleString()}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (item.sellerId === userId) {
                      toast.info("That's your own listing!");
                      return;
                    }
                    setOrderModal(item);
                    setOrderQty('');
                    setOrderMsg('');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                >
                  <ShoppingCart className="w-4 h-4" /> Place Order
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-black text-slate-900 dark:text-white">No Listings Found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or check back later.</p>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">Place Order</h3>
                <p className="text-xs text-slate-500">{orderModal.material} ({orderModal.grade || 'Mix'}) • KES {orderModal.pricePerKg}/{orderModal.unit}</p>
              </div>
              <button onClick={() => setOrderModal(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Quantity (min {orderModal.moq} / max {orderModal.quantity} {orderModal.unit})
                </label>
                <input
                  type="number"
                  autoFocus
                  min={orderModal.moq}
                  max={orderModal.quantity}
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  placeholder={`Enter ${orderModal.unit}...`}
                  className="w-full py-3.5 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-slate-900 dark:text-white text-lg text-center focus:ring-4 text-base focus:ring-primary/10 focus:border-primary outline-none transition-all"
                />
              </div>

              {orderQty && Number(orderQty) > 0 && (
                <div className="flex justify-between items-center p-3 bg-primary/5 border border-primary/20 rounded-2xl">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Amount</span>
                  <span className="text-lg font-black text-primary">KES {(Number(orderQty) * orderModal.pricePerKg).toLocaleString()}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Message to Seller (optional)
                </label>
                <textarea
                  value={orderMsg}
                  onChange={(e) => setOrderMsg(e.target.value)}
                  placeholder="Delivery instructions, pickup preferences..."
                  rows={2}
                  className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-white outline-none resize-none focus:ring-4 text-base focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isOrdering || !orderQty}
                className="w-full py-4 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {isOrdering ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Order <ShoppingCart className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
