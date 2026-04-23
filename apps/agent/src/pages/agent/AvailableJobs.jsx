/**
 * Available Jobs Page — Job cards with AI recommendations, accept/reject
 */
import { useEffect, useState } from 'react';
import { Sparkles, MapPin, Clock, Package, CheckCircle, XCircle, RefreshCw, Loader2, Navigation, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAgentStore, useAuthStore, useServiceStore } from '@cleanflow/core';
import EmptyState from '@cleanflow/ui/components/EmptyState';
import { SkeletonCard } from '@cleanflow/ui/components/Skeletons';

export default function AvailableJobs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'available'); // Respect navigation hints
  const [weighingJob, setWeighingJob] = useState(null);
  const [weightValue, setWeightValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    availableJobs, 
    activeJobs, 
    acceptJob, 
    rejectJob, 
    completeJob,
    fetchAvailableJobs, 
    fetchActiveJobs,
    subscribeToJobs,
    cleanupJobs,
    isLoadingJobs,
    arrivedJobIds
  } = useAgentStore();
  const { userId, profile } = useAuthStore();
  const { categories, fetchCategories } = useServiceStore();

  useEffect(() => {
    fetchAvailableJobs();
    fetchActiveJobs();
    fetchCategories();
    
    // Subscribe to real-time job updates if online
    if (profile?.isOnline) {
      subscribeToJobs();
    }
    
    return () => cleanupJobs();
  }, [profile?.isOnline, subscribeToJobs, cleanupJobs]);

  const handleAccept = async (job) => {
    try {
      const success = await acceptJob(job.id);
      
      if (success) {
        setActiveTab('active'); // Switch to active tab so user sees the job move
        toast.success(`Job accepted! 🚀`, {
          description: `${job.location} — KSh ${job.pay.toLocaleString()}`,
        });
      } else {
        toast.error("Could not claim job", {
          description: "This mission might have been claimed by another agent or is no longer available."
        });
        // Refresh to get latest list
        fetchAvailableJobs();
      }
    } catch (err) {
      console.error('[handleAccept] Error:', err);
      toast.error("Failed to accept job");
    }
  };

  const handleReject = async (job) => {
    await rejectJob(job);
    toast.info(`Job declined and broadcasted`);
  };

  const handleComplete = (job) => {
    setWeighingJob(job);
    setWeightValue('');
  };

  const submitCompletion = async () => {
    if (!weightValue || isNaN(weightValue)) {
      toast.error("Please enter a valid weight");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeJob(weighingJob.id, parseFloat(weightValue));
      toast.success("Weight Recorded! ⚖️", {
        description: `Request for KSh ${(100 + parseFloat(weightValue)*20).toLocaleString()} sent to resident.`,
      });
      setWeighingJob(null);
      fetchActiveJobs();
    } catch (err) {
      toast.error("Failed to record weight");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentJobs = activeTab === 'available' ? availableJobs : activeJobs;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Job Dispatcher</h1>
          <button
            onClick={() => { fetchAvailableJobs(); fetchActiveJobs(); }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingJobs ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'available' 
                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Available ({availableJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active' 
                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Active Missions ({activeJobs.length})
          </button>
        </div>
      </div>

      {isLoadingJobs ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : currentJobs.length === 0 ? (
        <EmptyState
          icon={activeTab === 'available' ? Package : CheckCircle}
          title={activeTab === 'available' ? "No jobs available" : "No active missions"}
          subtitle={activeTab === 'available' ? "Check back soon or expand your service area" : "Accept a job to get started"}
          action={activeTab === 'available' ? "Refresh Jobs" : "Find Jobs"}
          onAction={activeTab === 'available' ? fetchAvailableJobs : () => setActiveTab('available')}
        />
      ) : (
        <div className="space-y-4">
          {currentJobs.map((job) => {
            const waste = categories.find((w) => w.slug === job.material) || 
                          categories.find((w) => w.id === job.material);
            return (
              <div
                key={job.id}
                className={`glass p-5 rounded-3xl border transition-all ${
                  job.isAI && activeTab === 'available' 
                    ? 'border-emerald-500/30 bg-emerald-500/5' 
                    : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40'
                }`}
              >
                {/* Priority Badge */}
                {job.agent_id === userId && activeTab === 'available' && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase tracking-widest shadow-sm">
                      <Zap className="w-3 h-3 fill-white" /> Priority Mission
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Direct client request</span>
                  </div>
                )}

                {/* AI Badge (only for available and not priority) */}
                {job.isAI && activeTab === 'available' && job.agent_id !== userId && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 uppercase tracking-widest">
                      <Sparkles className="w-3 h-3 fill-white" /> HygeneX Choice
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{job.aiReason}</span>
                  </div>
                )}

                {/* Job Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-2xl shadow-sm">
                      {waste?.icon || '🗑️'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{waste?.label || job.material}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{job.id} · {job.customer || 'Client'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary">KSh {job.pay.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Your Pay (85%) · Founder Rate</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>{job.time}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {activeTab === 'available' ? (
                    <>
                      <button
                        onClick={() => handleReject(job)}
                        className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleAccept(job)}
                        className="flex-[2] py-3 rounded-2xl bg-primary text-white font-black text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Accept Job
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/jobs/navigate/${job.id}`)}
                        className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" /> Go to Map
                      </button>
                      <button
                        disabled={job.paymentStatus === 'authorized' || !arrivedJobIds.includes(job.id)}
                        onClick={() => handleComplete(job)}
                        className={`flex-[1.5] py-4 rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                          job.paymentStatus === 'authorized'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : !arrivedJobIds.includes(job.id)
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                              : 'bg-emerald-500 text-white shadow-emerald-500/20 animate-pulse-soft'
                        }`}
                      >
                        {job.paymentStatus === 'authorized' ? (
                          <>Awaiting Payment...</>
                        ) : !arrivedJobIds.includes(job.id) ? (
                          <>Arrive at location first</>
                        ) : (
                          <><CheckCircle className="w-4 h-4" /> Mark Complete</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weight Entry Modal */}
      {weighingJob && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <Navigation className="w-8 h-8 text-emerald-600 rotate-45" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Vehicle Scale Entry</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">Enter the final measured weight for this pickup.</p>
              
              <div className="w-full relative mb-8">
                <input 
                  type="number"
                  autoFocus
                  placeholder="0.0"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-5 px-6 text-3xl font-black text-center focus:border-primary outline-none transition-all placeholder:opacity-20"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black tracking-widest text-sm pointer-events-none">KG</span>
              </div>

              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setWeighingJob(null)}
                  className="flex-1 py-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitCompletion}
                  disabled={isSubmitting}
                  className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Confirm & Complete</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
