import { useEffect } from 'react';
import { useFeedbackStore } from '@cleanflow/core';
import { Star, MessageSquare, Trash2, CalendarClock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFeedbackInbox() {
  const { feedbackList, deleteFeedback, clearAllFeedback, fetchFeedback, isLoading } = useFeedbackStore();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
    if (rating === 3) return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
    return 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold dark:text-white">App Reviews Inbox</h1>
            <div className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {feedbackList.length} Total
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage user feedback and bug reports</p>
        </div>
        {feedbackList.length > 0 && (
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to delete all feedback records?")) {
                clearAllFeedback();
                toast.success('Inbox Cleared');
              }
            }}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-rose-100 dark:border-rose-900 shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {feedbackList.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center mb-4">
             <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold dark:text-white">Inbox is empty</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">No user feedback has been submitted recently. All is quiet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {feedbackList.map((item) => (
            <div key={item.id} className="card p-5 relative overflow-hidden group border border-slate-200 dark:border-slate-800 hover:border-primary/40 transition-colors">
               
               {/* Header: Rating & Date */}
               <div className="flex justify-between items-start mb-4">
                 <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${getRatingColor(item.rating)}`}>
                   <Star className="w-3.5 h-3.5 fill-current" />
                   <span className="text-xs font-black">{item.rating}.0</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400">
                    <CalendarClock className="w-3 h-3" />
                    {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                 </div>
               </div>

               {/* Content */}
               <div className="space-y-3">
                 <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-2">
                      {item.category}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium">"{item.text}"</p>
                 </div>
               </div>

               {/* Footer: User Details */}
               <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold dark:text-slate-200">{item.name || 'Anonymous User'}</p>
                      <p className="text-[10px] text-slate-400 font-mono tracking-wider">{item.phone || 'No Phone Sync'}</p>
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => {
                     deleteFeedback(item.id);
                     toast.success('Review Deleted');
                   }}
                   className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
