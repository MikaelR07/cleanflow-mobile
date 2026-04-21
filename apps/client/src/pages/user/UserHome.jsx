/**
 * User Home — Impact cards, AI pickup suggestions, quick booking CTA
 */
import { useEffect, useState } from 'react';
import { 
  Bell, 
  MapPin, 
  Zap, 
  Wallet, 
  Clock, 
  Trash2, 
  Trash, 
  Plus, 
  Sparkles, 
  Lightbulb, 
  History, 
  Leaf, 
  TrendingUp,
  Truck,
  Recycle,
  ArrowRight,
  Mic,
  Star,
  TrendingDown,
  Navigation,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore, useAuthStore, useIotStore, useAdminStore, useNotificationStore } from '@cleanflow/core';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import { SkeletonCard } from '@cleanflow/ui/components/Skeletons';
import { RatingModal } from '@cleanflow/ui';
import { toast } from 'sonner';

export default function UserHome() {
  const { profile, withdrawRewards, role, subscribeToProfileChanges } = useAuthStore();
  const { 
    bookings, 
    fetchBookings, 
    aiSuggestions, 
    isLoadingAI, 
    refreshAISuggestions, 
    openVoiceModal, 
    liveAgents, 
    fetchNearbyAgents,
    subscribeToAgents,
    fetchNotifications,
    submitAgentRating,
    clearBookingHistory
  } = useBookingStore();
  const { smartBins, initDevices } = useIotStore();
  const { openNemaModal } = useAdminStore();
  const { getUnreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const unreadCount = getUnreadCount();

  const getGFPMetrics = () => {
    const points = profile?.rewardPoints || 0;
    const threshold = 500;
    const progress = (points % threshold) / threshold * 100;
    const tier = points < 500 ? 'Seedling' : points < 1500 ? 'Sapling' : 'Evergreen';
    const nextTier = points < 500 ? 'Sapling' : 'Evergreen';
    const icon = points < 500 ? '🌱' : points < 1500 ? '🌿' : '🌳';
    return { points, threshold, progress, tier, nextTier, icon };
  };

  useEffect(() => {
    fetchBookings();
    initDevices();
    fetchNearbyAgents();
    subscribeToAgents();
    
    if (profile?.id) {
      const { fetchNotifications: fetchNots } = useNotificationStore.getState();
      fetchNots(profile.id, role);
      subscribeToProfileChanges(profile.id);

      window.onCleanFlowProfileUpdate = (data) => {
        toast.success("Sync Success! 🌿", { 
          description: "Sustainability rewards received and reflected." 
        });
      };
    }

    return () => {
      window.onCleanFlowProfileUpdate = null;
    };
  }, [profile?.id, role, subscribeToProfileChanges]);

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [dismissedRatingIds, setDismissedRatingIds] = useState([]);

  useEffect(() => {
    if (bookings.length > 0) {
      const now = new Date();
      const unrated = bookings.find(b => {
        if (b.status !== 'completed' || b.agent_rating || b.agentRating) return false;
        if (dismissedRatingIds.includes(b.id)) return false; 
        
        const completeTime = new Date(b.updated_at || b.date);
        const diffMins = (now - completeTime) / 60000;
        return diffMins < 30;
      });
      
      if (unrated) {
        setRatingBooking(unrated);
      }
    }
  }, [bookings, dismissedRatingIds]);

  // Metrics derived from profile rewards (never affected by history clearing)
  const kgRecovered = Math.floor((profile?.rewardPoints || 0) / 5); // 5 GFP per kg
  const co2Saved = (kgRecovered * 0.0054).toFixed(3); // ~5.4g CO₂ per kg recycled
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalPickups = completedBookings.length;

  const topSuggestions = aiSuggestions.filter((s) => s.isAI).slice(0, 4);
  const recentBookings = [...bookings]
    .sort((a, b) => {
      const timeA = new Date(a.lastUpdated || a.date).getTime();
      const timeB = new Date(b.lastUpdated || b.date).getTime();
      return timeB - timeA;
    })
    .slice(0, 3);

  const handleWithdraw = async () => {
    const balance = profile?.walletBalance || 0;
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
        description: `KSh ${balance.toLocaleString()} has been sent to ${profile?.phone}.` 
      });
    } catch (err) {
      toast.error("Withdrawal Failed", { description: "Please check your network." });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearBookingHistory('all');
      toast.success("History Cleared", { description: "Your completed and cancelled bookings are now hidden." });
    } catch (err) {
      toast.error("Failed to clear history");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Hello, {profile?.name?.split(' ')[0]}! 👋</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 text-[10px] text-primary font-black uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
              <MapPin className="w-2.5 h-2.5" /> {profile?.location?.estate || 'Nairobi Sector'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/impact-hub')}
            className="flex flex-col items-end group"
          >
            <div className={`flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-amber-200 dark:shadow-none active:scale-95 transition-all
              ${profile?.rewardPoints > 0 ? 'animate-pulse-soft border-2 border-white/50' : ''}`}>
              <Leaf className="w-3.5 h-3.5 fill-white" />
              <span className="text-xs font-black uppercase tracking-tighter mr-0.5">GFP</span>
              <span className="text-sm font-black tracking-tight">{profile?.rewardPoints || 0}</span>
            </div>
          </button>

          <button 
            onClick={() => navigate('/settings/notifications')}
            className="relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm active:scale-95 transition-all group"
          >
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm animate-in zoom-in">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
 
      {/* Recycling Wallet */}
      <div className="card bg-slate-50 dark:bg-slate-800/50 p-4 flex items-center justify-between border-dashed border-2 border-slate-200 dark:border-slate-700 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Recycling Wallet</p>
            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">KSh {profile?.walletBalance?.toLocaleString() || 0}</p>
          </div>
        </div>
        <button 
          onClick={handleWithdraw}
          disabled={isWithdrawing}
          className="bg-primary text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isWithdrawing ? 'Processing...' : 'Withdraw'}
        </button>
      </div>

      {/* Mission Upgrade Banner (Impact-First nudge) */}
      <button 
        onClick={() => navigate('/settings/subscriptions')}
        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] relative overflow-hidden group ${
          profile?.subscriptionTier === 'premium' 
            ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' 
            : 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30'
        }`}
      >
        <div className="flex items-center gap-3 relative z-10">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
            profile?.subscriptionTier === 'premium' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-amber-100 dark:bg-amber-900/30'
          }`}>
            <Star className={`w-5 h-5 ${profile?.subscriptionTier === 'premium' ? 'text-slate-600 dark:text-slate-400' : 'text-amber-600'}`} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-none mb-1">
              {profile?.subscriptionTier === 'lite' || !profile?.subscriptionTier ? 'Mission Upgrade' : 'Impact Level'}
            </p>
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {profile?.subscriptionTier === 'lite' || !profile?.subscriptionTier 
                ? 'Join Community Impact & Earn 2x Rewards' 
                : profile?.subscriptionTier === 'standard' 
                ? 'Become an Environmental Leader' 
                : 'Share your Zero-Waste progress'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">View</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
        </div>
        
        {/* Subtle decorative background pulse */}
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-200/20 dark:bg-amber-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      </button>

      {/* Quick Action */}
      <button
        id="piga-pickup"
        onClick={() => navigate('/book-pickup')}
        className="w-full bg-gradient-to-r from-primary to-emerald-700 text-white rounded-2xl p-4 flex items-center justify-between group transition-all hover:shadow-xl hover:shadow-primary/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
            <Truck className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-extrabold text-lg">Call for Pickup</p>
            <p className="text-[11px] text-white/80 font-medium tracking-tight">Book waste collection in 60s</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Impact Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card flex flex-col items-center justify-center p-3 active:scale-95 transition-transform cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
            <Leaf className="w-4 h-4 text-primary" />
          </div>
          <p className="text-lg font-black dark:text-white">{kgRecovered}</p>
          <p className="text-[8px] uppercase tracking-tighter font-bold text-slate-400">Kg Recovered</p>
        </div>
        <div className="card flex flex-col items-center justify-center p-3 active:scale-95 transition-transform cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-1.5">
            <Recycle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg font-black dark:text-white">{totalPickups}</p>
          <p className="text-[8px] uppercase tracking-tighter font-bold text-slate-400">Pickups</p>
        </div>
        <div className="card flex flex-col items-center justify-center p-3 active:scale-95 transition-transform cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center mb-1.5">
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black dark:text-white">{co2Saved}</p>
          <p className="text-[8px] uppercase tracking-tighter font-bold text-slate-400 font-mono">t CO₂ Saved</p>
        </div>
      </div>

      {/* AI Smart Pickup Scheduler */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Smart Pickup Scheduler</h2>
          </div>
          <button
            onClick={() => refreshAISuggestions(smartBins)}
            className="text-xs text-primary font-bold hover:underline"
          >
            Refresh
          </button>
        </div>

        {isLoadingAI ? (
          <div className="space-y-3">
            <SkeletonCard />
          </div>
        ) : (
          <div className="space-y-3">
            {topSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => navigate('/book-pickup')}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-left hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{s.time}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
                      s.type === 'urgency' ? 'bg-rose-100 text-rose-600' :
                      s.type === 'traffic' ? 'bg-amber-100 text-amber-600' :
                      s.type === 'cluster' ? 'bg-blue-100 text-blue-600' :
                      'bg-primary/10 text-primary'
                    }`}>
                      <Sparkles className="w-2.5 h-2.5" /> 
                      {s.type === 'urgency' ? 'URGENT PICKUP' : 
                       s.type === 'traffic' ? 'TRAFFIC OPTIMIZED' :
                       s.type === 'cluster' ? 'COMMUNITY CLUSTER' : 'AI RECOMMENDED'}
                    </span>
                    {s.isUrgent && (
                      <span className="text-[8px] font-bold text-rose-500 flex items-center gap-0.5 uppercase tracking-tighter animate-pulse text-right">
                        <TrendingDown className="w-2 h-2 rotate-180" /> Action Required
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">{s.reason}</p>
                
                <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{s.discount}% Save</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{s.co2Saved}kg CO₂ Offset</span>
                  </div>
                  {s.groupingCount > 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Recycle className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] font-bold text-blue-600">+{s.groupingCount} Neighbors</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Voice Booking CTA */}
      <button
        id="voice-booking-btn"
        onClick={openVoiceModal}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-4 flex items-center gap-3 hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 shadow-lg shadow-blue-500/10"
      >
        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center animate-pulse-soft shadow-inner">
          <Mic className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="font-extrabold text-base">Speak to Book Pickup</p>
          <p className="text-[11px] text-white/80 font-medium tracking-tight">Sema kwa Kiswahili au English</p>
        </div>
      </button>


      {/* 🗺️ Interactive Sector Map (Moved to Bottom) */}
      <div className="relative h-44 w-full rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl z-0 animate-slide-up">
        {profile?.location?.latitude ? (
          <MapContainer 
            center={[profile.location.latitude, profile.location.longitude]} 
            zoom={15} 
            zoomControl={false}
            attributionControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* User Domicile */}
            <Marker 
              position={[profile.location.latitude, profile.location.longitude]} 
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="w-8 h-8 bg-primary rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white">👤</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })}
            />

            {/* Live Agents Tracking */}
            {liveAgents.map((agent) => (
              agent.location?.latitude && (
                <Marker 
                  key={agent.id}
                  position={[agent.location.latitude, agent.location.longitude]} 
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="w-6 h-6 bg-blue-600 rounded-xl border-2 border-white shadow-md flex items-center justify-center text-[10px] animate-bounce">⚡</div>`,
                    iconSize: [24, 24]
                  })}
                >
                  <Popup className="rounded-xl overflow-hidden">
                    <div className="p-2 min-w-[120px]">
                      <p className="font-bold text-xs text-slate-900">{agent.name}</p>
                      <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">Online Agent</p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 gap-2">
            <MapPin className="w-8 h-8 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">Map Signal Offline</p>
          </div>
        )}

        {/* Map Overlay Removed as requested */}

        <button 
          onClick={() => navigate('/book-pickup')}
          className="absolute bottom-4 right-4 z-[400] bg-primary text-white p-3 rounded-2xl shadow-xl active:scale-95 transition-all outline-none"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* Recent Activity */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Recent Activity</h3>
          {recentBookings.some(b => b.status === 'completed' || b.status === 'cancelled') && (
            <button 
              onClick={handleClearHistory}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear History
            </button>
          )}
        </div>
        <div className="space-y-3">
          {recentBookings.map((item, i) => {
            const statusColor = 
              item.status === 'completed' ? 'text-green-600' :
              item.status === 'cancelled' ? 'text-rose-600' :
              item.status === 'in-progress' ? 'text-blue-600' : 'text-amber-600';
            
            return (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium capitalize">{item.wasteType} pickup</p>
                  <p className="text-xs text-slate-400 font-medium">{item.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  {(item.status === 'completed' && !item.agent_rating && !item.agentRating) && (
                    <button 
                      onClick={() => setRatingBooking(item)}
                      className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20"
                    >
                      Rate Agent 🌟
                    </button>
                  )}
                  <span className={`text-xs font-bold ${statusColor} capitalize`}>
                    {item.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
          {recentBookings.length === 0 && (
            <div className="text-center py-6 px-4">
              <p className="text-xs text-slate-400 font-medium mb-2">No bookings found yet.</p>
              <p className="text-[10px] text-slate-300">Your sustainable waste journey starts with your first pickup booking!</p>
            </div>
          )}
        </div>
      </div>

      {/* Agent Rating Modal */}
      <RatingModal
        isOpen={!!ratingBooking}
        onClose={() => setRatingBooking(null)}
        agentName={ratingBooking?.agentName || 'your agent'}
        onSubmit={async (val, comment) => {
          try {
            await submitAgentRating(ratingBooking.id, val, comment);
            toast.success('Thank you! 💖', { description: 'Your rating has been submitted.' });
          } catch (e) {
            console.error('Rating error:', e);
            toast.error('Could not save rating');
          }
        } }
        onSkip={() => {
          if (ratingBooking) {
            setDismissedRatingIds(prev => [...prev, ratingBooking.id]);
          }
          setRatingBooking(null);
        } } 
      />
    </div>
  );
}
