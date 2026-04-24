/**
 * Agent Home — Command Center for CleanFlow Founder Agents
 */
import { useEffect, useState } from 'react';
import { 
  Power, 
  TrendingUp, 
  Target, 
  Star, 
  ChevronRight, 
  Sparkles, 
  Bell, 
  MapPin, 
  Loader2, 
  Zap,
  Wallet,
  Truck,
  ArrowRight,
  ShieldCheck,
  History,
  Navigation,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useAgentStore, useNotificationStore, useAssetStore } from '@cleanflow/core';
import AIInsightCard from '@cleanflow/ui/components/AIInsightCard';
import { toast } from 'sonner';

export default function AgentHome() {
  const { profile, toggleOnline, withdrawRewards } = useAuthStore();
  const { 
    earnings, coachInsights, currentInsightIndex, nextInsight, 
    availableJobs, fetchAvailableJobs, fetchEarnings, broadcastLocation,
    jobHistory, subscribeToJobs, cleanupJobs
  } = useAgentStore();
  const { assets, fetchAssets } = useAssetStore();
  const { getUnreadCount } = useNotificationStore();
  const [isToggling, setIsToggling] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const navigate = useNavigate();

  const unreadCount = getUnreadCount();
  const currentInsight = coachInsights[currentInsightIndex];

  useEffect(() => {
    // ── STAGGERED FETCHING (SPEED OPTIMIZATION) ──
    // Load essential finance data immediately
    fetchEarnings();

    // Defer heavy data slightly to keep UI responsive
    const jobsTimer = setTimeout(() => fetchAvailableJobs(), 100);
    const assetsTimer = setTimeout(() => fetchAssets(), 300);

    return () => {
      clearTimeout(jobsTimer);
      clearTimeout(assetsTimer);
    };
  }, []);

  // ── REAL-TIME JOB LISTENER ──
  useEffect(() => {
    if (profile.isOnline) {
      subscribeToJobs();
    } else {
      cleanupJobs();
    }
    return () => cleanupJobs();
  }, [profile.isOnline, subscribeToJobs, cleanupJobs]);

  // ── REAL-TIME HEARTBEAT: Pulse location while online ──────────────
  useEffect(() => {
    if (!profile.isOnline) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        broadcastLocation(pos.coords.latitude, pos.coords.longitude, 'active');
      });
    }

    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          broadcastLocation(pos.coords.latitude, pos.coords.longitude, 'active');
        });
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [profile.isOnline, broadcastLocation]);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);

    try {
      const isGoingOnline = !profile.isOnline;
      let coords = null;

      if (isGoingOnline) {
        const getCoords = () => new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => reject(err),
            { timeout: 10000 }
          );
        });

        try {
          coords = await toast.promise(getCoords(), {
            loading: '📡 Acquiring GPS signal...',
            success: 'Location synced! You are now live.',
            error: 'GPS error. Using last known location.',
          });
        } catch (err) {
          coords = null; 
        }
      }

      await toggleOnline(coords);
      
      if (isGoingOnline) {
        fetchAvailableJobs();
        toast.success('You are now Online! 👋', { description: 'Ready to receive missions.' });
      } else {
        toast.info('You are now Offline');
      }
    } catch (err) {
      toast.error('Toggle failed', { description: err.message });
    } finally {
      setIsToggling(false);
    }
  };

  const handleWithdraw = async () => {
    const balance = earnings.total || earnings.today || 0;
    if (balance < 100) {
      toast.warning("Minimum Withdrawal: KSh 100", {
        description: `You need KSh ${100 - balance} more to withdraw to M-Pesa.`,
      });
      return;
    }

    setIsWithdrawing(true);
    try {
      await withdrawRewards(balance);
      toast.success("M-Pesa Withdrawal Success! 💸", { 
        description: `KSh ${balance.toLocaleString()} has been sent to your registered phone.` 
      });
    } catch (err) {
      toast.error("Withdrawal Failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Hello, {profile.name.split(' ')[0]}! 👋</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
              <MapPin className="w-3 h-3" /> {profile.location?.estate || profile.estate || 'Nairobi Sector'}
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/settings/notifications')}
          className="relative w-12 h-12 rounded-2xl bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 group"
        >
          <Bell className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-50 dark:ring-slate-950 shadow-md animate-in zoom-in">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ── AGENT HERO CARD ── */}
      <div className="relative group perspective-1000">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-primary rounded-[2.5rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div className="relative bg-slate-100/30 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 p-5 sm:p-6 shadow-xl overflow-hidden backdrop-blur-xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col gap-5 relative z-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Wallet className="w-3 h-3" /> Payout Balance
                </p>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  KSh {earnings.total?.toLocaleString() || earnings.today?.toLocaleString() || 0}
                </h2>
              </div>
              <button 
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="bg-primary text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isWithdrawing ? 'Syncing...' : 'Withdraw'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="text-center">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Pickups Done</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none flex items-center justify-center gap-1">
                  <Truck className="w-4 h-4 text-blue-500" /> {earnings.completedToday || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Total Pickups</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{assets.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">My Rating</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {profile.rating ? profile.rating.toFixed(1) : '5.0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── AGENT ONLINE STATUS TOGGLE ── */}
      <div
        className={`w-full p-5 rounded-[2rem] bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-all`}
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${
            profile.isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200/50 dark:bg-slate-700 text-slate-400'
          }`}>
            {isToggling ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Power className={`w-5 h-5`} />
            )}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-80">Agent Online Status</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {profile.isOnline ? 'Ready for Missions' : 'System Offline'}
            </p>
          </div>
        </div>

        <button 
          onClick={handleToggle}
          disabled={isToggling}
          className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
            profile.isOnline ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${
            profile.isOnline ? 'left-7' : 'left-1'
          }`} />
        </button>
      </div>

      {/* ── ROUTE OPTIMIZER CTA (MOVED UP) ── */}
      <button
        onClick={() => navigate('/routes')}
        className="w-full bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-5 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] group"
      >
        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
          <Navigation className="w-6 h-6 text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Route Optimizer</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Plan Fastest Multi-Pickup Trip</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Smart Navigator Live</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </button>

      {/* ── QUICK ACTION MATRIX ── */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/jobs')}
          className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[2rem] p-5 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Work Board</p>
            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">Find Jobs</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/earnings')}
          className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[2rem] p-5 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 bg-amber-100/50 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Finance</p>
            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">My Earnings</p>
          </div>
        </button>
      </div>

      {/* ── HYGENEX AGENT COACH ── */}
      {currentInsight && (
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Agent Insights</span>
              <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Earning Optimizer</p>
            </div>
            <h3 className="text-xl font-black mb-1">{currentInsight.title}</h3>
            <p className="text-xs font-medium text-white/80 leading-relaxed mb-6">
              {currentInsight.message || "High demand detected in your sector. Stay online for bonus multipliers."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/jobs')}
                className="flex-1 py-4 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all"
              >
                Go to Hotspot
              </button>
              <button 
                onClick={nextInsight}
                className="px-6 py-4 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 active:scale-[0.98] transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MISSION HISTORY ── */}
      <div className="bg-slate-100/30 dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/50 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Mission History</h3>
          <History className="w-4 h-4 text-slate-300" />
        </div>
        
        <div className="space-y-6">
          {jobHistory.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between group px-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-lg">
                  {item.wasteType === 'general' ? '🗑️' : '♻️'}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white capitalize">{item.location || 'Local'} Pickup</p>
                  <p className="text-[10px] font-bold text-slate-400">{item.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-black font-mono ${item.status === 'completed' ? 'text-primary' : 'text-red-500'}`}>
                  {item.status === 'completed' ? `+KSh ${item.price.toFixed(0)}` : 'Cancelled'}
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.status}</p>
              </div>
            </div>
          ))}
          
          {jobHistory.length === 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Past Missions Yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
