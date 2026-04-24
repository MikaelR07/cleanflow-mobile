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
  Plus, 
  Sparkles, 
  History, 
  Leaf, 
  TrendingUp,
  Truck,
  Recycle,
  ArrowRight,
  Mic,
  Star,
  ChevronRight,
  Trophy,
  Scan,
  CalendarDays
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore, useAuthStore, useIotStore, useAdminStore, useNotificationStore, supabase } from '@cleanflow/core';
import { SkeletonCard } from '@cleanflow/ui/components/Skeletons';
import { RatingModal, TopUpModal } from '@cleanflow/ui';
import ReleaseFundsModal from '../../components/user/ReleaseFundsModal';
import { toast } from 'sonner';

export default function UserHome() {
  const { 
    profile, 
    withdrawRewards, 
    role, 
    clientType,
    toggleClientType,
    subscribeToProfileChanges,
    topUpBalance 
  } = useAuthStore();
  
  const { 
    bookings, 
    fetchBookings, 
    aiSuggestions, 
    isLoadingAI, 
    refreshAISuggestions, 
    openVoiceModal, 
    submitAgentRating,
    clearBookingHistory,
    subscribeToBookings,
    cleanupBookings,
    setActiveReleaseBooking,
    confirmPayment
  } = useBookingStore();

  const { subscribeToRealtime, cleanup: cleanupNotifications } = useNotificationStore();
  const { initDevices } = useIotStore();
  const { getUnreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const unreadCount = getUnreadCount();
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const pendingPayment = bookings.find(b => b.paymentStatus === 'authorized');

  useEffect(() => {
    fetchBookings();
    initDevices();
    
    if (profile?.id) {
      const { fetchNotifications: fetchNots } = useNotificationStore.getState();
      fetchNots(profile.id, role);
      subscribeToProfileChanges(profile.id);
      subscribeToBookings(profile.id);
      subscribeToRealtime(profile.id, role);

      window.onCleanFlowProfileUpdate = (data) => {
        toast.success("Sync Success! 🌿", { 
          description: "Sustainability rewards received and reflected." 
        });
      };
    }

    return () => {
      window.onCleanFlowProfileUpdate = null;
      cleanupBookings();
      cleanupNotifications();
    };
  }, [profile?.id, role, subscribeToProfileChanges, subscribeToBookings, cleanupBookings, subscribeToRealtime, cleanupNotifications]);

  useEffect(() => {
    // GHOST HUNTER: Find only RECENT pickups (last 24 hours)
    const now = new Date();
    const existingAuth = bookings.find(b => {
      const isPending = (b.paymentStatus === 'authorized' || b.payment_status === 'authorized') && b.status === 'picked_up';
      if (!isPending) return false;

      // Only show if it happened in the last 24 hours to avoid ghosting old jobs
      const updateTime = new Date(b.updated_at || b.date);
      const hoursSinceUpdate = (now - updateTime) / (1000 * 60 * 60);
      return hoursSinceUpdate < 24;
    });
    
    if (existingAuth) {
      console.log('[GhostHunter] Found active handover:', existingAuth.id, 'Status:', existingAuth.status);
      // Map back to DB format for the modal
      setActiveReleaseBooking({
        id: existingAuth.id,
        waste_type: existingAuth.wasteType || existingAuth.waste_type,
        weight_kg: existingAuth.actualWeightKg || existingAuth.actual_weight_kg || 0,
        fee: existingAuth.fee,
        totalPrice: existingAuth.totalPrice || existingAuth.total_price
      });
    }
  }, [bookings, setActiveReleaseBooking]);

  const [ratingBooking, setRatingBooking] = useState(null);
  const [dismissedRatingIds, setDismissedRatingIds] = useState([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

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

  const handleClearHistory = async () => {
    if (!profile?.id) return;
    
    try {
      console.log('[Clearance] Attempting to clear history for:', profile.id);
      const { data, error } = await supabase
        .from('profiles')
        .update({ completedClearedAt: new Date().toISOString() })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('[Clearance] DATABASE ERROR:', error);
        throw error;
      }
      
      toast.success("History cleared! 🧹");
    } catch (err) {
      console.error('[Clearance] CATCH ERROR:', err);
      toast.error("Failed to clear history");
    }
  };

  const kgRecovered = Math.floor((profile?.rewardPoints || 0) / 5);
  const co2Saved = (kgRecovered * 0.0054).toFixed(3);
  const totalPickups = bookings.filter(b => b.status === 'completed').length;

  const topSuggestion = aiSuggestions.find((s) => s.isAI);
  const recentBookings = [...bookings]
    .filter(b => {
      if (b.status === 'completed' && profile?.completedClearedAt) {
        return new Date(b.createdAt || b.date) > new Date(profile.completedClearedAt);
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
      toast.error("Withdrawal Failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleConfirmTopUp = async (amount) => {
    setIsToppingUp(true);
    try {
      const success = await topUpBalance(amount);
      if (success) {
        toast.success("STK Push Success! 💸", {
          description: `KSh ${Number(amount).toLocaleString()} added to your wallet.`
        });
      }
    } catch (err) {
      toast.error("Top Up Failed");
    } finally {
      setIsToppingUp(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Hello, {profile?.name?.split(' ')[0]}! 👋</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
              <MapPin className="w-3 h-3" /> {profile?.location?.estate || 'Nairobi Sector'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Persona Toggle Badge */}
          <button 
            onClick={toggleClientType}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition-all active:scale-95 shadow-sm
              ${clientType === 'seller' 
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/20' 
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${clientType === 'seller' ? 'bg-white' : 'bg-primary'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {clientType === 'seller' ? 'Seller' : 'Resident'}
            </span>
            <ArrowRight className={`w-3 h-3 opacity-50 ${clientType === 'seller' ? 'rotate-180' : ''} transition-transform`} />
          </button>

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
      </div>

      {/* ── IMPACT HERO CARD ── */}
      <div className="relative group perspective-1000">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-slate-100/30 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 p-8 shadow-xl overflow-hidden backdrop-blur-xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Wallet className="w-3 h-3" /> Recycling Wallet
                </p>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  KSh {(profile?.balance || profile?.walletBalance || 0).toLocaleString()}
                </h2>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    <Leaf className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span className="text-xs font-black text-amber-700 dark:text-amber-500">{profile?.rewardPoints || 0} GFP</span>
                  </div>
                  <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Assets</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setShowTopUpModal(true)}
                  disabled={isToppingUp}
                  className="bg-white/50 dark:bg-white/10 text-slate-900 dark:text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isToppingUp ? 'Pushing...' : 'Top Up'}
                </button>
                <button 
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="bg-primary text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isWithdrawing ? 'Syncing...' : 'Withdraw'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="text-center">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Pickups</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none flex items-center justify-center gap-1">
                  <Truck className="w-4 h-4 text-blue-500" /> {totalPickups}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Recovered</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{kgRecovered}kg</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Nature Saved</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{co2Saved}t</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MISSION UPGRADE BANNER (RESIDENT ONLY) ── */}
      {clientType === 'resident' && (
        <button 
          onClick={() => navigate('/settings/subscriptions')}
          className="w-full p-5 rounded-[2rem] bg-amber-100/30 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 flex items-center justify-between group transition-all active:scale-[0.98] overflow-hidden relative"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-11 h-11 bg-amber-100/50 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center shadow-inner">
              <Star className="w-6 h-6 text-amber-600 dark:text-amber-500 fill-amber-500" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-none mb-1">Impact Level</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Join community impact to earn 2X rewards
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* ── QUICK ACTIONS (PERSONA-DRIVEN) ── */}
      <div className="grid grid-cols-2 gap-4">
        {clientType === 'resident' ? (
          <>
            <button
              onClick={() => navigate('/book-pickup?mode=service')}
              className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[2rem] p-4 flex flex-col items-center gap-3 hover:shadow-lg transition-all active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <Trash2 className="w-16 h-16" />
              </div>
              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-0.5">Service</p>
                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">Order Clean-up</p>
              </div>
            </button>

            <button
              onClick={() => toast.info('HygeneX AI launching...', { description: 'Identify your waste and its value.' })}
              className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[2rem] p-4 flex flex-col items-center gap-3 hover:shadow-lg transition-all active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <Scan className="w-16 h-16" />
              </div>
              <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Scan className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Education</p>
                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">Scan with AI</p>
              </div>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/book-pickup?mode=sell')}
              className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[2rem] p-4 flex flex-col items-center gap-3 hover:shadow-lg transition-all active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <Recycle className="w-16 h-16" />
              </div>
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Recycle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">Deposit</p>
                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">Sell Waste</p>
              </div>
            </button>

            <button
              onClick={() => toast.info('Market Intelligence Hub...', { description: 'Analyzing live material value.' })}
              className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[2rem] p-4 flex flex-col items-center gap-3 hover:shadow-lg transition-all active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <TrendingUp className="w-16 h-16" />
              </div>
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-0.5">Intelligence</p>
                <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">Analyze & Value</p>
              </div>
            </button>
          </>
        )}
      </div>

      {/* ── HYGENEX SMART WINDOW ── */}
      {topSuggestion && (
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">HygeneX Suggestion</span>
              <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Profit Optimized</p>
            </div>
            <h3 className="text-xl font-black mb-1">Next Best Pickup: {topSuggestion.time}</h3>
            <p className="text-xs font-medium text-white/80 leading-relaxed mb-6">
              Book this slot to earn **{topSuggestion.discount}% more rewards** due to high neighborhood demand.
            </p>
            <button 
              onClick={() => navigate('/book-pickup')}
              className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
            >
              Secure This Slot <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── VOICE BOOKING CTA (RESIDENT ONLY) ── */}
      {clientType === 'resident' && (
        <button
          onClick={openVoiceModal}
          className="w-full bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-5 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] group"
        >
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Voice Command</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">"Book my plastic pickup for tomorrow"</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Sema kwa Kiswahili au English</p>
          </div>
        </button>
      )}

      {/* ── COMMUNITY & RANKING (RESIDENT ONLY) ── */}
      {clientType === 'resident' && (
        <div className="bg-slate-100/50 dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Estate Ranking</p>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{profile?.location?.estate || 'South B'} is #2</p>
            </div>
          </div>
          <button onClick={() => navigate('/impact-hub')} className="p-2 bg-slate-200/50 dark:bg-slate-800 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      )}

      {/* ── RECENT ACTIVITY ── */}
      <div className="bg-slate-100/30 dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/50 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 px-1">Recent Activity</h3>
          <div className="flex items-center gap-3">
            {recentBookings.length > 0 && (
              <button 
                onClick={handleClearHistory}
                className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            )}
            <History className="w-4 h-4 text-slate-300" />
          </div>
        </div>
        
        <div className="space-y-6">
          {recentBookings.map((item, i) => (
            <div key={i} className="flex items-center justify-between group px-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center text-lg">
                  {item.wasteType === 'general' ? '🗑️' : item.wasteType === 'recyclable' ? '♻️' : '🥬'}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white capitalize">{item.wasteType} Pickup</p>
                  <p className="text-[10px] font-bold text-slate-400">{item.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[10px] font-black uppercase tracking-widest ${
                  item.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {item.status}
                </p>
                {item.status === 'completed' && (
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">Verified</p>
                )}
              </div>
            </div>
          ))}
          
          {recentBookings.length === 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Activity Yet</p>
            </div>
          )}
        </div>
      </div>

      <RatingModal
        isOpen={!!ratingBooking}
        onClose={() => setRatingBooking(null)}
        agentName={ratingBooking?.agentName || 'your agent'}
        onSubmit={async (val, comment) => {
          try {
            await submitAgentRating(ratingBooking.id, val, comment);
            toast.success('Thank you! 💖', { description: 'Your rating has been submitted.' });
          } catch (e) {
            toast.error('Could not save rating');
          }
        } }
        onSkip={() => setRatingBooking(null)} 
      />

      <ReleaseFundsModal />

      <TopUpModal 
        isOpen={showTopUpModal} 
        onClose={() => setShowTopUpModal(false)}
        onConfirm={handleConfirmTopUp}
        balance={profile?.walletBalance || 0}
      />
    </div>
  );
}
