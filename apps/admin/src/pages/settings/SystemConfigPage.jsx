import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Settings2, Phone, MessageCircle } from 'lucide-react';
import { useSystemStore } from '@cleanflow/core';
import { toast } from 'sonner';

export default function SystemConfigPage() {
  const navigate = useNavigate();
  const { supportPhone, whatsappNumber, updateSupportContacts } = useSystemStore();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    phone: supportPhone || '',
    whatsapp: whatsappNumber || ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600)); // Simulate save delay
      updateSupportContacts(form.phone, form.whatsapp);
      toast.success('System Configuration Updated', { description: 'Contact numbers have been updated globally.' });
      navigate('/settings');
    } catch (err) {
      toast.error('Failed to save', { description: 'Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-slide-up pb-20">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/settings')} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">System Configuration</h1>
      </header>

      <div className="space-y-6 max-w-xl">
        <div className="card p-5">
           <div className="flex items-center gap-3 mb-4 text-primary">
              <Settings2 className="w-5 h-5" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Global Support Contacts</h2>
           </div>
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
             Update the official support contact numbers. Changes made here will immediately reflect in the Client and Agent apps.
           </p>

           <form onSubmit={handleSave} className="space-y-5">
              <div>
                 <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Call/Toll Free
                 </label>
                 <input 
                   type="text" 
                   required 
                   value={form.phone} 
                   onChange={(e) => setForm({...form, phone: e.target.value})} 
                   placeholder="e.g. +254113787588" 
                   className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 text-base focus:ring-primary/50 text-sm font-mono tracking-wider" 
                 />
              </div>

              <div>
                 <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp Number
                 </label>
                 <input 
                   type="text" 
                   required 
                   value={form.whatsapp} 
                   onChange={(e) => setForm({...form, whatsapp: e.target.value})} 
                   placeholder="e.g. 254113787588" 
                   className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 text-base focus:ring-[#25D366]/50 text-sm font-mono tracking-wider" 
                 />
                 <p className="text-[10px] text-slate-400 mt-1.5">For WhatsApp, exclude the '+' sign. Just country code and number.</p>
              </div>

              <div className="pt-4">
                 <button type="submit" disabled={isLoading} className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-primary/20 cursor-pointer">
                   {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Global Configuration
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
