/**
 * Agent Home — Go Online toggle, AI Performance Coach, today's earnings
 */
import { useEffect, useState } from 'react';
import { Power, TrendingUp, Target, Star, ChevronRight, Sparkles, Bell, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useAgentStore, useNotificationStore } from '@cleanflow/core';
import AIInsightCard from '@cleanflow/ui/components/AIInsightCard';
import { toast } from 'sonner';

export default function AgentHome() {
  const { profile, toggleOnline } = useAuthStore();
  const { 
    earnings, coachInsights, currentInsightIndex, nextInsight, 
    availableJobs, fetchAvailableJobs, fetchEarnings, broadcastLocation 
  } = useAgentStore();
  const { getUnreadCount } = useNotificationStore();
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();

  const unreadCount = getUnreadCount();
  const currentInsight = coachInsights[currentInsightIndex];
  const progressPercent = Math.min((earnings.today / (earnings.todayGoal || 1)) * 100, 100);

  useEffect(() => {
    fetchAvailableJobs();
    fetchEarnings();
  }, []);

  // ── REAL-TIME HEARTBEAT: Pulse location while online ──────────────
  useEffect(() => {
    if (!profile.isOnline) return;

    // 1. Initial pulse on mount/online
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        broadcastLocation(pos.coords.latitude, pos.coords.longitude, 'active');
      });
    }

    // 2. Set 2-minute heartbeat
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
        // Wrap geolocation in a promise for toast and async handling
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
          console.warn('[AgentHome] Geolocation fallback used:', err);
          coords = null; 
        }
      }

      await toggleOnline(coords);
      
      if (isGoingOnline) {
        fetchAvailableJobs(); // Refresh count
        toast.success('You have gone online! 🚀');
      } else {
        toast.info('You are now offline');
      }
    } catch (err) {
      console.error('[AgentHome] Toggle Error:', err);
      toast.error('Toggle failed', { description: err.message });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-white transition-colors duration-500">
      
      {/* Header / Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hello, {profile.name.split(' ')[0]}! 👋</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
              <MapPin className="w-2.5 h-2.5" /> {profile.location?.estate || profile.estate || 'Nairobi Sector'}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-yellow-600 font-black uppercase tracking-widest bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/20 shadow-sm">
              <Star className={`w-3 h-3 ${profile.rating ? 'fill-yellow-500' : ''} text-yellow-500`} /> 
              {profile.rating ? profile.rating.toFixed(1) : 'New Agent'}
            </div>
          </div>
        </div>
        
        {/* Notification Bell */}
        <button 
          onClick={() => navigate('/settings/notifications')}
          className="relative w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 group"
        >
          <Bell className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-50 dark:ring-slate-950 shadow-md animate-in zoom-in">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Go Online Toggle */}
      <button
        id="go-online-toggle"
        onClick={handleToggle}
        disabled={isToggling}
        className={`w-full rounded-[2rem] p-6 flex items-center justify-between transition-all duration-300 border ${
          profile.isOnline
            ? 'bg-gradient-to-r from-emerald-600 to-green-600 border-transparent shadow-xl shadow-emerald-500/20 text-white'
            : 'bg-white/80 dark:bg-slate-800/60 backdrop-blur-md border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 shadow-lg shadow-slate-200/40 dark:shadow-none hover:border-primary/30'
        } ${isToggling ? 'opacity-80 scale-[0.98]' : ''}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${profile.isOnline ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700/50'}`}>
            {isToggling ? (
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            ) : (
              <Power className={`w-7 h-7 transition-colors ${profile.isOnline ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
            )}
          </div>
          <div className="text-left">
            <p className="font-extrabold text-xl tracking-tight">{profile.isOnline ? 'Active & Ready' : 'Go Online'}</p>
            <p className={`text-sm font-medium ${profile.isOnline ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
              {profile.isOnline ? `${availableJobs.length} potential pickups found` : 'Toggle to receive requests'}
            </p>
          </div>
        </div>
        <div className={`w-16 h-9 rounded-full relative transition-colors duration-300 shadow-inner ${profile.isOnline ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
          <div className={`w-7 h-7 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md ${profile.isOnline ? 'left-8' : 'left-1'}`} />
        </div>
      </button>

      {/* Today's Earnings Goal */}
      <div className="glass p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-800/60 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 dark:bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            <h2 className="font-bold text-xs tracking-widest text-slate-400 dark:text-slate-500 uppercase">Mission Status</h2>
          </div>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{earnings.completedToday} pickups done</span>
        </div>
        <div className="flex items-end justify-between mb-5 relative z-10">
          <div>
            <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">KSh {earnings.today.toLocaleString()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-wide">Daily Earning Goal</p>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl">{progressPercent.toFixed(0)}%</span>
          </div>
        </div>
        <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded-2xl overflow-hidden relative z-10 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 background-animate rounded-xl transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* HygeneX Performance Coach Card */}
      {currentInsight && (
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-black text-[10px] flex items-center gap-2 text-primary uppercase tracking-[0.2em] leading-none">
              <span className="w-3.5 h-3.5"><Sparkles className="w-full h-full" /></span> HygeneX Coach
            </h3>
            <button onClick={nextInsight} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-primary transition-all">Next Insight →</button>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <AIInsightCard
                insight={{...currentInsight, title: `HygeneX: ${currentInsight.title}`}}
                onAction={() => toast.info('Action noted', { description: 'This feature is fully live soon!' })}
                onDismiss={nextInsight}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: TrendingUp, value: `KSh ${(earnings.thisWeek / 1000).toFixed(1)}k`, label: 'This Week', color: 'text-primary' },
          { 
            icon: Star, 
            value: profile?.rating ? profile.rating.toFixed(1) : 'New', 
            label: 'Rating', 
            color: 'text-yellow-500', 
            fill: !!profile?.rating, 
            highlight: true, 
            path: '/reviews' 
          },
          { icon: Target, value: earnings.totalJobs || 0, label: 'Success', color: 'text-secondary' }
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => stat.path && navigate(stat.path)}
            className={`glass flex flex-col items-center justify-center p-5 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm hover:border-primary/20 transition-all ${stat.path ? 'cursor-pointer active:scale-95' : ''}`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color} ${stat.fill ? 'fill-current' : ''} mb-2`} />
            <p className={`${stat.highlight ? 'text-2xl' : 'text-lg'} font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none`}>{stat.value}</p>
            <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* View Jobs CTA - Premium Redesign */}
      <button
        onClick={() => navigate('/jobs')}
        className="relative w-full group overflow-hidden rounded-[2.5rem] transition-all active:scale-[0.98] shadow-2xl shadow-emerald-500/10"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-500 dark:to-teal-600 transition-all duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_70%)] group-hover:animate-pulse" />
        
        <div className="relative p-7 flex items-center justify-between text-white">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Dispatcher Live</p>
            </div>
            <p className="font-black text-2xl tracking-tighter">HygeneX Dispatcher</p>
            <p className="text-xs font-bold text-white/70 mt-1 uppercase tracking-widest">Tap to start browsing {availableJobs.length} pickups</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600 transition-all shadow-xl">
            <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </button>
    </div>
  );
}
