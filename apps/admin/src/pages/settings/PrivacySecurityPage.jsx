import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Shield, Lock, Trash2 } from 'lucide-react';
import { useAuthStore } from '@cleanflow/core';
import { toast } from 'sonner';

export default function PrivacySecurityPage() {
  const { logout, changePin } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [authStage, setAuthStage] = useState('view'); // 'view', 'pin'

  const [pins, setPins] = useState({ current: '', new: '', confirm: '' });

  const handleChangePin = async (e) => {
    e.preventDefault();
    if (pins.new !== pins.confirm) {
      toast.error('Password Mismatch', { description: 'Your new passwords do not match.' });
      return;
    }
    setIsLoading(true);
    try {
      await changePin(pins.current, pins.new);
      toast.success('Password Updated', { description: 'Your security password was successfully changed.' });
      setAuthStage('view');
      setPins({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error('Failed to update', { description: err.message || 'Incorrect current password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = () => {
    const confirmed = window.confirm("Are you sure you want to continuously delete your CleanFlow account? This action cannot be reversed.");
    if (confirmed) {
      toast.error('Account Terminated', { description: 'Your account has been deleted.' });
      logout();
    }
  };

  return (
    <div className="animate-slide-up pb-20">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => { authStage === 'pin' ? setAuthStage('view') : navigate('/settings') }} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">Privacy & Security</h1>
      </header>

      {authStage === 'view' ? (
        <div className="space-y-6">
          
          <div className="card p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
             <button onClick={() => setAuthStage('pin')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                     <Lock className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="text-sm font-bold text-slate-800 dark:text-white">Change Security Password</div>
                     <div className="text-xs text-slate-500">Update your alphanumeric access code</div>
                   </div>
                </div>
             </button>
          </div>



          <div className="pt-8">
             <button onClick={handleDeactivate} className="w-full py-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-rose-100 dark:border-rose-900/50">
                <Trash2 className="w-4 h-4" /> Deactivate Account
             </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleChangePin} className="card p-5 space-y-5 animate-slide-up border-t-4 border-t-blue-500">
           <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Current Password</label>
              <input type="password" required minLength={8} value={pins.current} onChange={(e) => setPins({...pins, current: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 tracking-widest text-sm" />
           </div>
           <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">New Password</label>
              <input type="password" required minLength={8} value={pins.new} onChange={(e) => setPins({...pins, new: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 tracking-widest text-sm" />
           </div>
           <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
              <input type="password" required minLength={8} value={pins.confirm} onChange={(e) => setPins({...pins, confirm: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 tracking-widest text-sm" />
           </div>

           <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-2">
             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />} Update Security
           </button>
        </form>
      )}

    </div>
  );
}
