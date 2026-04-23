import { useState, useEffect } from 'react';
import { 
  Settings, Plus, Save, Trash2, Edit2, 
  ChevronRight, ArrowLeft, Zap, Sparkles,
  Package, Truck, Coins, Info
} from 'lucide-react';
import { useServiceStore, useSettingsStore } from '@cleanflow/core';
import { toast } from 'sonner';

export default function ServiceManager() {
  const { categories, fetchCategories, updateCategory, addCategory, isLoading } = useServiceStore();
  const { settings, fetchSettings, updateSetting } = useSettingsStore();
  const [selectedParent, setSelectedParent] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', slug: '', price_per_unit: '', unit: 'kg', icon: '📦' });

  useEffect(() => {
    fetchCategories();
    fetchSettings();
  }, []);

  const topLevel = categories.filter(c => !c.parent_id);
  const subItems = categories.filter(c => c.parent_id === selectedParent?.id);

  const handleSavePrice = async (item, newPrice) => {
    const val = parseFloat(newPrice);
    if (isNaN(val)) return toast.error("Invalid price");
    
    const res = await updateCategory(item.id, { price_per_unit: val });
    if (res.success) toast.success(`${item.label} price updated`);
  };

  const handleAddNew = async () => {
    if (!newItem.label || !newItem.price_per_unit) return toast.error("Please fill all fields");
    
    const res = await addCategory({
      ...newItem,
      slug: `${newItem.label.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`,
      parent_id: selectedParent?.id || null,
      price_per_unit: parseFloat(newItem.price_per_unit)
    });

    if (res.success) {
      toast.success("New service item added");
      setIsAdding(false);
      setNewItem({ label: '', slug: '', price_per_unit: '', unit: 'kg', icon: '📦' });
    } else {
      console.error("[ServiceManager] Save Failed:", res.error);
      toast.error("Could not save item", { 
        description: res.error?.message || "Check if this name already exists." 
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        {selectedParent && (
          <button onClick={() => setSelectedParent(null)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-black">{selectedParent ? selectedParent.label : 'Service Pricing Manager'}</h1>
          <p className="text-sm text-slate-500">Manage what the company charges residents and define items.</p>
        </div>
      </div>

      {/* Global Revenue Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="card p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-xl shadow-indigo-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-black text-lg">Revenue Split</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Agent Payout</span>
                  <span className="text-2xl font-black">{Math.round((settings.agent_commission_rate || 0.7) * 100)}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={(settings.agent_commission_rate || 0.7) * 100}
                  onChange={(e) => updateSetting('agent_commission_rate', parseFloat(e.target.value) / 100)}
                  className="w-full accent-emerald-400 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <div className="flex gap-3">
                  <Info className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-indigo-100 leading-relaxed">
                    This rate determines how much of the resident's fee goes directly to the agent. CleanFlow retains the remaining {Math.round((1 - (settings.agent_commission_rate || 0.7)) * 100)}%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-center border-dashed">
           <div className="text-center">
             <Coins className="w-8 h-8 text-slate-300 mx-auto mb-3" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Network Liquidity: Stable</p>
           </div>
        </div>
      </div>

      {!selectedParent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topLevel.map(cat => (
            <div key={cat.id} className="glass p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-primary transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="text-3xl">{cat.icon}</div>
                <button 
                  onClick={() => setSelectedParent(cat)}
                  className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-black mb-1">{cat.label}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-primary">KSh {cat.price_per_unit}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">per {cat.unit}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-4 uppercase tracking-widest">
                {categories.filter(c => c.parent_id === cat.id).length} Sub-items defined
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/50 p-4 rounded-3xl">
             <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Zap className="w-4 h-4" />
                Base Rate: KSh {selectedParent.price_per_unit}/{selectedParent.unit}
             </div>
             <button 
               onClick={() => setIsAdding(true)}
               className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
             >
                <Plus className="w-4 h-4" /> Add Sub-Item
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subItems.map(item => (
              <div key={item.id} className="card p-5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <p className="font-bold">{item.label}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{item.unit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400">KSh</span>
                    <input 
                      type="number" 
                      defaultValue={item.price_per_unit}
                      onBlur={(e) => handleSavePrice(item, e.target.value)}
                      className="w-16 bg-transparent border-none focus:ring-0 font-black text-sm p-0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isAdding && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
                <h3 className="text-xl font-black mb-6">Add New {selectedParent.label} Item</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Item Label</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Washing Machine"
                      value={newItem.label}
                      onChange={e => setNewItem({...newItem, label: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">KSh Price</label>
                      <input 
                        type="number" 
                        placeholder="1000"
                        value={newItem.price_per_unit}
                        onChange={e => setNewItem({...newItem, price_per_unit: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Unit</label>
                      <select 
                        value={newItem.unit}
                        onChange={e => setNewItem({...newItem, unit: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold"
                      >
                        <option value="item">Item</option>
                        <option value="kg">KG</option>
                        <option value="bag">Bag</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-4 text-xs font-bold text-slate-400"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddNew}
                      className="flex-[2] py-4 rounded-2xl bg-primary text-white font-black text-xs shadow-lg shadow-primary/20"
                    >
                      Create Service Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Card */}
      <div className="bg-primary/5 border border-primary/20 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
           <Info className="w-6 h-6" />
        </div>
        <div>
           <h4 className="text-sm font-black text-primary uppercase tracking-widest">Pricing Consistency Mode</h4>
           <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
             Setting these prices ensures the company remains profitable while residents receive a fair, predictable rate. 
             Base rates for General/Organic waste should be updated weekly based on disposal costs at your facility.
           </p>
        </div>
      </div>
    </div>
  );
}
