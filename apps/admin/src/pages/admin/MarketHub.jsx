import { useState, useEffect } from 'react';
import { 
  Coins, TrendingUp, TrendingDown, RefreshCcw, 
  Save, AlertCircle, Sparkles, ArrowRight, Plus, X, Trash2, ToggleLeft, ToggleRight, Edit2,
  ShieldCheck, Activity, Brain, Truck, Wallet, Zap, Package
} from 'lucide-react';
import { usePriceStore, useAuthStore, useSystemStore, useServiceStore } from '@cleanflow/core';
import { toast } from 'sonner';

export default function MarketHub() {
  const { prices, fetchPrices, updatePrice, isLoading: pricesLoading } = usePriceStore();
  const { config, fetchConfig, updateConfig, isLoading: configLoading } = useSystemStore();
  const { profile } = useAuthStore();
  const { 
    allCategories, fetchAllCategories, addCategory, 
    updateCategory, toggleCategory, deleteCategory 
  } = useServiceStore();
  
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  const [editingFeeKey, setEditingFeeKey] = useState(null);
  const [editFeeValue, setEditFeeValue] = useState('');

  // Category management state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCat, setNewCat] = useState({ label: '', icon: '📦', description: '' });
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatData, setEditCatData] = useState({});

  useEffect(() => {
    fetchPrices();
    fetchConfig();
    fetchAllCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCat.label.trim()) return toast.error('Category name required');
    const result = await addCategory(newCat);
    if (result.success) {
      toast.success('Category Added');
      setShowAddCategory(false);
      setNewCat({ label: '', icon: '📦', description: '' });
      await fetchAllCategories();
    } else {
      toast.error('Failed to add category');
    }
  };

  const handleUpdateCategory = async (id) => {
    const result = await updateCategory(id, editCatData);
    if (result.success) {
      toast.success('Category Updated');
      setEditingCatId(null);
      await fetchAllCategories();
    }
  };

  const handleToggleCategory = async (id, currentState) => {
    const result = await toggleCategory(id, !currentState);
    if (result.success) {
      toast.success(currentState ? 'Category Disabled' : 'Category Enabled');
      await fetchAllCategories();
    }
  };

  const handleDeleteCategory = async (id, label) => {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    const result = await deleteCategory(id);
    if (result.success) {
      toast.success('Category Deleted');
      await fetchAllCategories();
    }
  };

  const handleSavePrice = async (id) => {
    if (!id) return toast.error('System Error', { description: 'Missing material ID.' });
    const numValue = parseFloat(editValue);
    if (isNaN(numValue) || numValue <= 0) return toast.error('Invalid Price');

    const result = await updatePrice(id, numValue);
    if (result.success) {
      toast.success('Market Rate Updated');
      setEditingId(null);
      await fetchPrices();
    }
  };

  const handleSaveFee = async (key) => {
    const numValue = parseFloat(editFeeValue);
    if (isNaN(numValue) || numValue < 0) return toast.error('Invalid Fee');

    const result = await updateConfig(key, numValue);
    if (result.success) {
      toast.success('System Fee Updated');
      setEditingFeeKey(null);
    }
  };

  const systemFees = Object.values(config);

  // Group prices by category
  const groupedPrices = prices.reduce((acc, price) => {
    const cat = price.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(price);
    return acc;
  }, {});

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      
      {/* 🔮 HUB HEADER */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 text-white p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
               <Coins className="w-6 h-6 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Network Command</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight">Market Hub</h1>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              The central nervous system of CleanFlow's economy. Manage sourcing rates, system fees, and network liquidity.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Market Cap</p>
                <p className="text-3xl font-black text-white">4.2M</p>
             </div>
             <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Flow Rate</p>
                <p className="text-3xl font-black text-primary">82%</p>
             </div>
          </div>
        </div>
      </div>

      {/* ⚙️ SYSTEM FEES SECTION */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-4">
           <Zap className="w-5 h-5 text-amber-500" />
           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Global System Fees</h2>
           <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>
        <p className="text-xs text-slate-400 font-medium px-4 -mt-4">
          Configure core platform economics, including service fees, logistics costs, and minimum withdrawal thresholds.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {systemFees.map((fee, index) => {
             const icons = {
               'fee_pickup': Truck,
               'fee_logistics': Activity,
               'fee_min_payout': Wallet,
               'fee_min_pickup': ShieldCheck
             };
             const Icon = icons[fee.key] || Activity;

             return (
               <div key={fee.key || index} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                     </div>
                     <button 
                       onClick={() => {
                         if (editingFeeKey === fee.key) {
                           handleSaveFee(fee.key);
                         } else {
                           setEditingFeeKey(fee.key);
                           setEditFeeValue((fee.value ?? 0).toString());
                         }
                       }}
                       className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline"
                     >
                       {editingFeeKey === fee.key ? 'Save Change' : 'Edit Fee'}
                     </button>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{fee.label}</p>
                  <div className="flex items-baseline gap-2">
                     {editingFeeKey === fee.key ? (
                       <input 
                         autoFocus
                         type="number"
                         value={editFeeValue}
                         onChange={(e) => setEditFeeValue(e.target.value)}
                         className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-2xl font-black text-amber-600 outline-none border border-amber-200"
                       />
                     ) : (
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white">{fee.value}</h3>
                     )}
                     <span className="text-xs font-black text-slate-500 uppercase">{fee.unit}</span>
                  </div>
               </div>
             );
           })}
        </div>
      </section>

      {/* 📦 PICKUP CATEGORIES SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Package className="w-5 h-5 text-indigo-500" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Pickup Categories</h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
          <button 
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
        <p className="text-xs text-slate-400 font-medium px-4">These categories appear in the Client app's "Book Pickup" flow. Toggle to enable/disable.</p>

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="mx-4 p-6 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">New Category</h3>
              <button onClick={() => setShowAddCategory(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input 
                placeholder="Icon (emoji)" 
                value={newCat.icon} 
                onChange={(e) => setNewCat({...newCat, icon: e.target.value})} 
                className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-2xl outline-none"
              />
              <input 
                placeholder="Category Name" 
                value={newCat.label} 
                onChange={(e) => setNewCat({...newCat, label: e.target.value})} 
                className="col-span-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none"
              />
            </div>
            <input 
              placeholder="Short description (e.g. 'Plastics, Paper, Cardboard')" 
              value={newCat.description} 
              onChange={(e) => setNewCat({...newCat, description: e.target.value})} 
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
            />
            <button 
              onClick={handleAddCategory}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors"
            >
              Save Category
            </button>
          </div>
        )}

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {allCategories.map((cat, index) => (
            <div key={cat.id || index} className={`p-5 rounded-[2rem] border shadow-sm transition-all ${
              cat.is_active 
                ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' 
                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50'
            }`}>
              {editingCatId === cat.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <input 
                      value={editCatData.icon || ''} 
                      onChange={(e) => setEditCatData({...editCatData, icon: e.target.value})} 
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-xl outline-none"
                    />
                    <input 
                      value={editCatData.label || ''} 
                      onChange={(e) => setEditCatData({...editCatData, label: e.target.value})} 
                      className="col-span-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none"
                    />
                  </div>
                  <input 
                    value={editCatData.description || ''} 
                    onChange={(e) => setEditCatData({...editCatData, description: e.target.value})} 
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateCategory(cat.id)} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Save</button>
                    <button onClick={() => setEditingCatId(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                    {cat.icon || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{cat.label}</h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => { setEditingCatId(cat.id); setEditCatData({ label: cat.label, icon: cat.icon, description: cat.description }); }}
                      className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleToggleCategory(cat.id, cat.is_active)}
                      className={`p-2 transition-colors ${cat.is_active ? 'text-emerald-500' : 'text-slate-300'}`}
                    >
                      {cat.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id, cat.label)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {allCategories.length === 0 && (
            <div className="col-span-full py-12 text-center opacity-40">
              <Package className="w-8 h-8 mx-auto mb-3" />
              <p className="text-xs font-black uppercase tracking-widest">No categories found. Add one above.</p>
            </div>
          )}
        </div>
      </section>

      {/* 💹 CATEGORIZED PRICE GRID */}
      <div className="space-y-12">
        <div className="flex items-center gap-4 px-4">
           <Activity className="w-5 h-5 text-emerald-500" />
           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Acquisition Rates</h2>
           <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>
        <p className="text-xs text-slate-400 font-medium px-4 -mt-10">
          Set the purchase prices CleanFlow pays to users and businesses per KG. These rates determine the wallet earnings and reward values for all collected materials.
        </p>

        {Object.entries(groupedPrices).map(([category, items]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-4 px-4">
              <h3 className="text-lg font-black text-slate-700 dark:text-slate-300 tracking-tight">{category}</h3>
              <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{items.length} Materials</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              {items.map((item, index) => (
                <div key={item.id || index} className="glass p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Coins className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-emerald-500">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-[10px] font-black tracking-tighter uppercase">STABLE</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Market Rate</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">{item.material_name}</h3>
                  
                  <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
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
