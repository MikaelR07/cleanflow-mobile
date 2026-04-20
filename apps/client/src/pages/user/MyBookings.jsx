/**
 * My Bookings Page — list of user's bookings with status badges
 */
import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, Truck, Star, XCircle, CalendarClock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '@cleanflow/core';
import { WASTE_TYPES } from '@cleanflow/core/src/data/mockData';
import EmptyState from '@cleanflow/ui/components/EmptyState';
import { toast } from 'sonner';

const statusConfig = {
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Truck },
  'pending': { label: 'Pending', color: 'bg-orange-100 text-orange-700', icon: Clock },
  'confirmed': { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: Clock },
  'scheduled': { label: 'Scheduled', color: 'bg-orange-100 text-orange-700', icon: Clock },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const TABS = ['Upcoming', 'Completed', 'Cancelled'];

const BookingCounter = ({ count, active }) => (
  <span className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-black rounded-full transition-all ${
    active 
      ? 'bg-primary text-white scale-110 shadow-sm shadow-primary/30' 
      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
  }`}>
    {count}
  </span>
);

export default function MyBookings() {
  const navigate = useNavigate();
  const { bookings, fetchBookings, cancelBooking, rescheduleBooking, clearBookingHistory } = useBookingStore();
  const [activeTab, setActiveTab] = useState('Upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'Upcoming') return b.status === 'pending' || b.status === 'confirmed' || b.status === 'scheduled';
    if (activeTab === 'Completed') return b.status === 'completed';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  const handleCancel = (id) => {
    cancelBooking(id);
    setActiveTab('Cancelled');
    toast.success('Booking Cancelled', { 
      description: `Pickup ${id} has been moved to history.` 
    });
  };

  const handleReschedule = (id) => {
    toast.info('Opening Schedule', { 
      description: 'Redirecting you to select a new pickup time...',
      icon: <CalendarClock className="w-4 h-4" />
    });
    // We navigate to BookPickup and pass the ID we want to reschedule
    navigate('/book-pickup', { state: { rescheduleId: id } });
  };

  const handleClearHistory = async (type) => {
    try {
      await clearBookingHistory(type);
      const label = type === 'completed' ? 'Completed' : 'Cancelled';
      toast.success(`${label} History Cleared ✨`, { 
        description: 'Past reports have been hidden from your view.' 
      });
    } catch (err) {
      toast.error('Clear failed');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold dark:text-white">My Bookings</h1>
        <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
          <p className="text-[10px] font-black text-primary uppercase tracking-wider">All Pickups: {bookings.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
        {TABS.map(tab => {
          const tabCount = bookings.filter(b => {
             if (tab === 'Upcoming') return b.status === 'pending' || b.status === 'confirmed' || b.status === 'scheduled';
             if (tab === 'Completed') return b.status === 'completed';
             if (tab === 'Cancelled') return b.status === 'cancelled';
             return false;
          }).length;
          
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center ${
                activeTab === tab 
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-primary dark:text-primary-light' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {tab}
              <BookingCounter count={tabCount} active={activeTab === tab} />
            </button>
          );
        })}
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState 
          icon={Package} 
          title={`No ${activeTab.toLowerCase()} bookings`} 
          subtitle={
            activeTab === 'Upcoming' ? "Book your first pickup to get started!" : 
            activeTab === 'Completed' ? "No completed bookings made yet." : 
            "Your cancelled history will appear here."
          } 
        />
      ) : (
        <div className="space-y-3">
          {(activeTab === 'Cancelled' || activeTab === 'Completed') && (
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => handleClearHistory(activeTab.toLowerCase())}
                className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline px-4 py-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg flex items-center gap-2"
              >
                Clear {activeTab} History
              </button>
            </div>
          )}
          {filteredBookings.map((b) => {
            const waste = WASTE_TYPES.find((w) => w.id === b.wasteType);
            const status = statusConfig[b.status];
            return (
              <div key={b.id} className="card p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-100 dark:border-slate-700">
                      {waste?.icon || '📦'}
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white leading-tight">{waste?.label || 'General Waste'}</p>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{b.id} · {b.date}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full shadow-sm ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex flex-col gap-2 py-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                      <span className="flex items-center gap-1">📍 {b.estate}</span>
                      {b.status === 'completed' && (
                        <div className="flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm">
                          <Zap className="w-2.5 h-2.5 fill-amber-500" /> +{Math.floor((b.weightKg || (b.bags || 1) * 5) * 5)} GFP
                        </div>
                      )}
                      <span className="flex items-center gap-1">🕐 {b.time}</span>
                    </div>
                    <span className="text-lg font-black text-primary dark:text-primary-light font-mono">KSh {(b.fee || 0).toLocaleString()}</span>
                  </div>
                  {b.phone && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg w-fit">
                      <span className="uppercase tracking-tighter">Payment M-Pesa:</span>
                      <span className="text-slate-700 dark:text-slate-300 ml-1">{b.phone}</span>
                    </div>
                  )}
                </div>
                
                {/* Agent details */}
                {b.agent && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Agent: <span className="text-slate-800 dark:text-slate-200">{b.agent}</span></div>
                    {b.rating && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/10 rounded-full">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-black text-[10px] text-yellow-600 dark:text-yellow-500">{b.rating}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions for Upcoming Bookings */}
                {activeTab === 'Upcoming' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => handleCancel(b.id)}
                      className="flex-1 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button 
                      onClick={() => handleReschedule(b.id)}
                      className="flex-1 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <CalendarClock className="w-3.5 h-3.5" /> Reschedule
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
