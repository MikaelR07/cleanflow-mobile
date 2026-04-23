import { useState, useEffect } from 'react';
import { 
  Coins, TrendingUp, TrendingDown, RefreshCcw, 
  Save, AlertCircle, Sparkles, ArrowRight,
  ShieldCheck, Activity, Brain
} from 'lucide-react';
import { usePriceStore, useAuthStore } from '@cleanflow/core';
import { toast } from 'sonner';

export default function PriceOracle() {
  const { prices, fetchPrices, updatePrice, isLoading } = usePriceStore();
  const { profile } = useAuthStore();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleSave = async (id) => {
    if (!id) return toast.error('System Error', { description: 'Missing material ID.' });
    
    const numValue = parseFloat(editValue);
    if (isNaN(numValue) || numValue <= 0) {
      return toast.error('Invalid Price', { description: 'Please enter a valid positive number.' });
    }

    const result = await updatePrice(id, numValue);
    
    if (result.success) {
      toast.success('Price Updated', { description: 'The new sourcing rate is now live across the network.' });
      setEditingId(null);
      // Force a fresh fetch to verify the DB actually persisted the change
      await fetchPrices();
    } else {
      toast.error('Update Failed', { description: result.error?.message || 'Database rejected update. Check permissions.' });
    }
  };

  // Group prices by category
  const groupedPrices = prices.reduce((acc, price) => {
    const cat = price.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(price);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* 🔮 ORACLE HEADER */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
               <Brain className="w-5 h-5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sustainomics Engine</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Market Price Oracle</h1>
            <p className="text-slate-400 text-sm max-w-md">
              Control the network's liquidity by setting the official acquisition rates for raw materials.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Active Nodes</p>
                <p className="text-2xl font-black">128</p>
             </div>
             <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Network Vol.</p>
                <p className="text-2xl font-black text-primary">4.2T</p>
             </div>
          </div>
        </div>
      </div>

      {/* 💹 CATEGORIZED PRICE GRID */}
      <div className="space-y-12">
        {Object.entries(groupedPrices).map(([category, items]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{category}</h2>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{items.length} Materials</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="glass p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Coins className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-emerald-500">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-[10px] font-black tracking-tighter uppercase">STABLE</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Acquisition Rate</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">{item.material_name}</h3>
                  
                  <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {editingId === item.id ? (
                      <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm font-black text-slate-400">KES</span>
                          <input 
                            autoFocus
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-xl font-black text-primary"
                          />
                      </div>
                    ) : (
                      <div className="flex-1">
                          <p className="text-2xl font-black text-slate-900 dark:text-white">
                            KSh {item.price_per_kg.toLocaleString()}
                          </p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">PER KG / SOURCING</p>
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        if (editingId === item.id) {
                          handleSave(item.id);
                        } else {
                          setEditingId(item.id);
                          setEditValue(item.price_per_kg.toString());
                        }
                      }}
                      className={`p-3 rounded-xl transition-all ${
                        editingId === item.id 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-primary'
                      }`}
                    >
                      {editingId === item.id ? <Save className="w-5 h-5" /> : <RefreshCcw className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 🛡️ SECURITY FOOTER */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
           <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
           <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Network Authority Active</h4>
           <p className="text-xs text-emerald-700/70 dark:text-emerald-500/60 mt-1 max-w-2xl leading-relaxed">
             Any changes made to these prices will immediately update the 'Live Feed' for all Agents and Weavers. 
             This ensures that your business model remains synchronized across the entire network.
           </p>
        </div>
      </div>

    </div>
  );
}
