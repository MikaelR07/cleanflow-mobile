/**
 * Marketplace Home — Industrial Trading Terminal for CleanFlow Weavers
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  Grid, 
  ShoppingBag, 
  PlusCircle, 
  ArrowRight, 
  Brain, 
  Sparkles, 
  Mic, 
  History, 
  Loader2,
  Package,
  Activity,
  ArrowUpRight,
  ChevronRight,
  Database,
  Truck,
  Layers,
  Tag,
  Building2,
  MapPin,
  Zap,
  Clock,
  Scale
} from 'lucide-react';
import { useMarketplaceStore, useAuthStore, ROLES, useAssetStore, usePriceStore } from '@cleanflow/core';
import { toast } from 'sonner';
import { AssetBadge, TopUpModal } from '@cleanflow/ui';

export default function MarketplaceHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, listings, fetchListings, isLoading } = useMarketplaceStore();
  const { liveFeed, fetchLiveFeed, claimAsset } = useAssetStore();
  const { role, profile, topUpBalance } = useAuthStore();
  const { getPriceForMaterial, fetchPrices } = usePriceStore();
  const navigate = useNavigate();
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const isWeaver = profile?.business_type === 'weaver';
  const mySpecializations = profile?.specializations || [];

  useEffect(() => { 
    fetchListings(); 
    fetchPrices();
    if (isWeaver) fetchLiveFeed();
  }, [isWeaver]);

  const handleClaim = async (asset) => {
    const pricePerKg = getPriceForMaterial(asset.material_type || '');
    const cost = (asset.weight_kg || 0) * pricePerKg;
    try {
      await claimAsset(asset.id);
      toast.success('Asset Claimed! 🚛', {
        description: `${asset.weight_kg}kg of ${asset.material_type} acquired.`
      });
    } catch (err) {
      toast.error('Claim Failed', { description: err.message });
    }
  };

  const handleConfirmReplenish = async (amount) => {
    setIsToppingUp(true);
    try {
      const success = await topUpBalance(amount);
      if (success) {
        toast.success("Budget Replenished! 💸", {
          description: `KSh ${Number(amount).toLocaleString()} added to your weaver terminal.`
        });
      }
    } catch (err) {
      toast.error("Top Up Failed");
    } finally {
      setIsToppingUp(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* ── INDUSTRIAL HEADER ── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            {profile?.business_name || 'Industrial Terminal'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 text-[9px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              <Database className="w-3 h-3" /> Weaver ID: CF-{profile?.id?.slice(0, 4).toUpperCase()}
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Node</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Acquisition Budget</p>
            <p className="text-lg font-black text-indigo-600 font-mono leading-none">
              KSh {(profile?.balance || 0).toLocaleString()}
            </p>
          </div>
          <button 
            onClick={() => setShowReplenishModal(true)}
            disabled={isToppingUp}
            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 dark:border-indigo-500/20 active:scale-95 transition-all"
          >
            {isToppingUp ? 'Pushing...' : 'Replenish'}
          </button>
        </div>
      </div>

      {/* ── WEAVER COMMAND CENTER ── */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-[2.5rem] blur opacity-10"></div>
        <div className="relative bg-slate-900 rounded-[2.5rem] p-7 shadow-2xl overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Package className="w-40 h-40 text-white" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => navigate('/buy')} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 group">
                <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Buy</span>
              </button>
              <button onClick={() => navigate('/sell')} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 group">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Sell</span>
              </button>
              <button onClick={() => navigate('/listings')} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 group">
                <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <Tag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Listings</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/warehouse')} 
                className="w-full h-12 bg-white text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 px-2"
              >
                <Layers className="w-4 h-4 text-indigo-600 shrink-0" /> <span>My Yard</span>
              </button>
              <button 
                onClick={() => navigate('/hygenex')} 
                className="w-full h-12 bg-indigo-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10 px-2"
              >
                <Brain className="w-4 h-4 text-white shrink-0" /> <span className="leading-tight">HygeneX B2B Advisor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIVE SUPPLY TERMINAL ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Supply Feed</h2>
          </div>
          <button onClick={() => navigate('/arrivals')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-500">
            <Zap className="w-32 h-32 text-indigo-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Supply Terminal</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Arrivals Channel</p>
              </div>
            </div>

            {/* TWO LATEST CARDS */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(isWeaver ? liveFeed : listings)
                .filter((item, index, self) => index === self.findIndex((t) => (
                  t.id === item.id || (t.booking_id && t.booking_id === item.booking_id)
                )))
                .slice(0, 2)
                .map((item) => (
                <div 
                  key={item.id}
                  onClick={() => navigate('/arrivals')}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 space-y-2 active:scale-95 transition-all relative overflow-hidden"
                >
                  {/* Photo Background Backdrop */}
                  {item.photo_url && (
                    <div className="absolute inset-0 opacity-10">
                      <img src={item.photo_url} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">New</span>
                      {item.photo_url ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                    <h4 className="font-black text-slate-900 dark:text-white text-[11px] truncate uppercase">{item.material_type || item.material}</h4>
                    <div className="flex items-center gap-1 text-emerald-500">
                      <Scale className="w-3 h-3" />
                      <span className="text-[10px] font-black">{item.weight_kg}kg</span>
                    </div>
                  </div>
                </div>
              ))}
              {(isWeaver ? liveFeed : listings).length === 0 && (
                <div className="col-span-2 py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Waiting for arrivals...</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => navigate('/arrivals')}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              Enter Terminal <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── B2B MARKET POSTINGS ── */}
      <section className="space-y-6">
        <div className="flex flex-col items-center text-center px-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Building2 className="w-4 h-4" /> B2B Market Postings
          </h2>
          <p className="text-[10px] text-slate-400 font-bold mt-2 opacity-80 max-w-[250px]">Trending materials and high-volume trades from the community.</p>
          <button 
            onClick={() => navigate('/buy')} 
            className="mt-4 px-6 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-500/20 active:scale-95 transition-all"
          >
            View Full Market
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {listings.slice(0, 5).map((listing) => (
            <div 
              key={listing.id}
              onClick={() => navigate('/buy')}
              className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-[0.99] group flex gap-4"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                <img src={listing.photo} alt={listing.material} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-black text-slate-900 dark:text-white text-base truncate">{listing.material}</h3>
                  <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
                    <ArrowUpRight className="w-3 h-3" /> {listing.aiMatchScore}% Match
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
                  <MapPin className="w-3 h-3" /> {listing.location}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-indigo-600 font-mono">KSh {listing.pricePerKg}</span>
                    <span className="text-[9px] text-slate-400 font-black uppercase">/KG</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <TopUpModal 
        isOpen={showReplenishModal} 
        onClose={() => setShowReplenishModal(false)}
        onConfirm={handleConfirmReplenish}
        title="Replenish Budget"
        balance={profile?.balance || 0}
      />
    </div>
  );
}
