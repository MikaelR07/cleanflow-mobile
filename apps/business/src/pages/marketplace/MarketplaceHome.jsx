import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Grid, ShoppingBag, PlusCircle, ArrowRight, Brain, Sparkles, Mic, History, Loader2 } from 'lucide-react';
import { useMarketplaceStore, useAuthStore, ROLES } from '@cleanflow/core';

export default function MarketplaceHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, listings, fetchListings, isLoading } = useMarketplaceStore();
  const { role } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchListings(); }, []);

  const trendingListings = listings.slice(0, 4);

  const tabs = [
    { id: 'buy',      label: 'Buy',       icon: ShoppingBag, path: '/buy' },
    { id: 'sell',     label: 'Sell',      icon: PlusCircle,  path: '/sell' },
    { id: 'listings', label: 'Inventory', icon: History,     path: '/listings' },
  ];

  const handleTabClick = (tab) => navigate(tab.path);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search materials (Plastic, Metal...)" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 text-base focus:ring-primary/20 text-sm font-medium"
        />
      </div>

      {/* Main Action Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className="flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-primary/30 hover:text-primary group"
          >
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <tab.icon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" /> Trending Materials
          </h2>
          <button onClick={() => navigate('/buy')} className="text-xs font-bold text-primary flex items-center gap-1">
            See All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {trendingListings.map((item) => (
            <div 
              key={item.id}
              onClick={() => navigate('/buy')}
              className="card p-3 cursor-pointer relative group flex flex-col"
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative">
                <img src={item.photo} alt={item.material} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2">
                  <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur text-[9px] font-black text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                    {item.aiMatchScore}%
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1">{item.material}</h3>
                <p className="text-[10px] text-slate-500 font-medium mb-2">{item.location}</p>
                <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-sm font-black text-primary font-mono">KES {item.pricePerKg}</span>
                    <span className="text-[8px] text-slate-400 font-bold tracking-tighter">/KG</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HygeneX Marketplace Advisor Card */}
      <section 
        onClick={() => navigate('/hygenex')}
        className="relative group cursor-pointer"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-[2rem] opacity-20 group-hover:opacity-40 transition-opacity blur-sm" />
        <div className="relative flex items-center gap-4 p-5 rounded-[2rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
             <Brain className="w-8 h-8 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-2">
               HygeneX B2B Advisor <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">Market intelligence and pricing forecasts</p>
            <div className="flex items-center gap-3 mt-2">
               <span className="flex items-center gap-1 text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                 <Mic className="w-2.5 h-2.5" /> VOICE ADVICE
               </span>
               <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors flex items-center gap-1">
                 Ask now <ArrowRight className="w-2.5 h-2.5" />
               </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Grid className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Categories</h2>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSearchQuery(cat.name);
                navigate('/buy');
              }}
              className="flex flex-col items-center gap-3 p-4 card"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Business Promotion Callout */}
      {role !== ROLES.BUSINESS && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-primary to-emerald-700 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1">Are you a Business?</h3>
            <p className="text-white/80 text-xs mb-4 max-w-[200px]">Register as a business to start selling your recyclables and managing bulk orders.</p>
            <button 
              onClick={() => navigate('/business/register')}
              className="bg-white text-primary text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform"
            >
              Register Now
            </button>
          </div>
          <Building2 className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
        </div>
      )}

    </div>
  );
}

// Additional Icon for the card
function Building2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
