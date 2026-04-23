import { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowLeft, 
  Package, 
  MapPin, 
  Scale, 
  Zap, 
  Building2, 
  Truck,
  Clock,
  Search,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceStore, useAuthStore, useAssetStore, supabase } from '@cleanflow/core';
import { toast } from 'sonner';

export default function SupplyTerminal() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { listings, fetchListings } = useMarketplaceStore();
  const { liveFeed, fetchLiveFeed, claimAsset } = useAssetStore();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState('');

  // Determine user context
  const isWeaver = profile?.business_type === 'weaver';
  
  useEffect(() => {
    // Weavers only care about fresh agent arrivals
    if (isWeaver) {
      fetchLiveFeed();
    } else {
      // Industrial users only care about weaver bulk sales
      fetchListings();
    }
    
    const channel = supabase.channel('terminal-exclusive-sync');
    
    if (isWeaver) {
      // Listen for new assets (Agent pickups)
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assets' }, () => fetchLiveFeed());
    } else {
      // Listen for new marketplace listings (Weaver bulk sales)
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'marketplace_listings' }, () => fetchListings());
    }

    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isWeaver]);

  // SOURCE SELECTION: 
  // 1. Weavers see "Fresh Pickups" (liveFeed)
  // 2. Industrial see "Bulk Bales" (listings > 50kg or from weavers)
  const terminalArrivals = isWeaver 
    ? liveFeed.map(item => ({ 
        ...item, 
        sourceType: 'agent', 
        typeLabel: 'Fresh Pickup',
        displayTitle: item.material_type 
      }))
    : listings
        .filter(item => item.weight_kg >= 50) // Only "Bulk" for the terminal
        .map(item => ({ 
          ...item, 
          sourceType: 'weaver', 
          typeLabel: 'Bulk Bale',
          displayTitle: item.material || item.material_type
        }));

  const filteredArrivals = terminalArrivals
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter(item => (item.displayTitle || '').toLowerCase().includes(search.toLowerCase()))
    // DEDUPLICATION: Ensure unique IDs and unique bookings only
    .filter((item, index, self) => 
      index === self.findIndex((t) => (
        t.id === item.id || (t.booking_id && t.booking_id === item.booking_id)
      ))
    );

  const handleAcquire = async (item) => {
    try {
      if (item.sourceType === 'agent') {
        await claimAsset(item.id);
      } else {
        // Logic for industrial user buying from weaver
        const { error } = await supabase.rpc('weaver_claim_asset', {
          p_listing_id: item.id,
          p_weaver_id: profile.id
        });
        if (error) throw error;
      }
      toast.success("Load Acquired!", { description: "Item added to your tracking." });
      setSelectedItem(null);
      if (isWeaver) fetchLiveFeed(); else fetchListings();
    } catch (err) {
      toast.error("Acquisition Failed", { description: err.message });
    }
  };

  const getMaterialColor = (type) => {
    const t = type?.toLowerCase();
    if (t?.includes('plastic')) return 'from-blue-400 to-blue-600';
    if (t?.includes('metal')) return 'from-slate-400 to-slate-600';
    if (t?.includes('paper')) return 'from-amber-400 to-amber-600';
    return 'from-emerald-400 to-emerald-600';
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-24">
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black uppercase tracking-[0.2em]">{isWeaver ? 'Weaver' : 'Industrial'} Terminal</h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live Arrivals</p>
            </div>
          </div>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4">
        {/* ── SEARCH ── */}
        <div className="mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Filter ${isWeaver ? 'pickups' : 'bulk bales'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm outline-none"
            />
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="grid grid-cols-2 gap-4">
          {filteredArrivals.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95 transition-all"
            >
              <div className={`h-32 relative flex items-center justify-center overflow-hidden`}>
                {item.photo_url ? (
                  <img src={item.photo_url} alt="Verified Material" className="w-full h-full object-cover" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${getMaterialColor(item.displayTitle)} opacity-90`} />
                )}
                
                {/* Fallback Icon Overlay */}
                {!item.photo_url && (
                  <div className="relative z-10">
                    {item.sourceType === 'weaver' ? <Building2 className="w-10 h-10 text-white/40" /> : <Truck className="w-10 h-10 text-white/40" />}
                  </div>
                )}

                <div className="absolute top-2 left-2 bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/20 z-10">
                  {item.typeLabel}
                </div>
                
                {item.photo_url && (
                  <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-md p-1 rounded-lg z-10">
                    <Activity className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="p-3 space-y-1">
                <h3 className="font-black text-slate-900 dark:text-white text-sm truncate uppercase tracking-tight">
                  {item.displayTitle}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-emerald-500">
                    <Scale className="w-3 h-3" />
                    <span className="text-xs font-black">{item.weight_kg}kg</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3 h-3" />
                    <span className="text-[9px] font-bold">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArrivals.length === 0 && (
          <div className="py-20 text-center opacity-40">
            <Activity className="w-10 h-10 mx-auto mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">No Arrivals Tracked</p>
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Material Photo Header */}
            <div className="h-40 -mx-6 -mt-6 mb-6 relative overflow-hidden">
               {selectedItem.photo_url ? (
                 <img src={selectedItem.photo_url} alt="Material Proof" className="w-full h-full object-cover" />
               ) : (
                 <div className={`w-full h-full bg-gradient-to-br ${getMaterialColor(selectedItem.displayTitle)} flex items-center justify-center`}>
                    <Package className="w-12 h-12 text-white/30" />
                 </div>
               )}
               <div className="absolute top-4 right-4">
                  <button onClick={() => setSelectedItem(null)} className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full transition-colors border border-white/20">
                    <X className="w-4 h-4 text-white" />
                  </button>
               </div>
               <div className="absolute bottom-4 left-6">
                  <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg shadow-lg">Verified Arrival</span>
               </div>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 block">{selectedItem.typeLabel}</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">{selectedItem.displayTitle}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</span>
                </div>
                <span className="text-lg font-black text-slate-900 dark:text-white">{selectedItem.weight_kg} KG</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate ml-4 text-right">
                  {selectedItem.location || selectedItem.booking?.estate || 'Central Hub'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrived</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {new Date(selectedItem.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <button 
              onClick={() => handleAcquire(selectedItem)}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              Acquire Load <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
