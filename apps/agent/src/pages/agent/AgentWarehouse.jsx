import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, TrendingUp, Tag, PlusCircle, Activity, ShoppingBag, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentWarehouse() {
  const navigate = useNavigate();
  const [isListing, setIsListing] = useState(false);

  // Mock data for the warehouse inventory
  const inventory = [
    { id: 1, type: 'Plastics (PET)', weight: 120, estimatedPricePerKg: 35, color: 'emerald' },
    { id: 2, type: 'Mixed Metals', weight: 45, estimatedPricePerKg: 80, color: 'slate' },
    { id: 3, type: 'E-Waste', weight: 12, estimatedPricePerKg: 150, color: 'indigo' },
    { id: 4, type: 'Cardboard', weight: 300, estimatedPricePerKg: 15, color: 'amber' },
  ];

  const totalEstimatedValue = inventory.reduce((acc, item) => acc + (item.weight * item.estimatedPricePerKg), 0);

  const handleListMarketplace = () => {
    setIsListing(true);
    setTimeout(() => {
      setIsListing(false);
      toast.success('Materials Listed!', {
        description: 'Your inventory is now visible to Weavers on the Marketplace.'
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24 min-h-screen p-4 pt-6">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">My Warehouse</h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">Current Stockpile</p>
          </div>
        </div>
      </div>

      {/* ── ESTIMATED VALUE HERO ── */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/30 to-indigo-500/30 rounded-[2.5rem] blur opacity-40"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <TrendingUp className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Estimated Portfolio Value
            </p>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-8">
              KSh {totalEstimatedValue.toLocaleString()}
            </h2>
            
            <button 
              onClick={handleListMarketplace}
              disabled={isListing}
              className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-wait group"
            >
              {isListing ? (
                <span className="flex items-center gap-2 animate-pulse">Processing...</span>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  List on Marketplace
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── INVENTORY GRID ── */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Stocked Materials</h3>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase">Live Prices</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {inventory.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors shadow-sm">
              <div className={`w-10 h-10 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500 mb-4`}>
                <Package className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1">{item.type}</h4>
              <p className="text-2xl font-black text-primary mb-3">{item.weight}<span className="text-sm text-slate-400">kg</span></p>
              
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Rate</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">KSh {item.estimatedPricePerKg}/kg</span>
              </div>
            </div>
          ))}

          {/* Add Material Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
            <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 mb-3 group-hover:scale-110 transition-transform group-hover:text-primary">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h4 className="font-black text-slate-500 text-xs uppercase tracking-widest">Log Manual<br/>Weight</h4>
          </div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-slate-400" />
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Recent Warehouse Activity</h3>
        </div>

        <div className="space-y-4">
          {[
            { msg: 'Added 12kg of Plastics (PET)', time: '2 hours ago', type: 'in' },
            { msg: 'Added 5kg of E-Waste', time: '5 hours ago', type: 'in' },
            { msg: 'Sold 50kg Cardboard to Weaver X', time: '1 day ago', type: 'out' }
          ].map((log, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${log.type === 'in' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.msg}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
