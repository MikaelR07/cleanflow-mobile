import { useState } from 'react';
import { useBookingStore } from '@cleanflow/core';
import { CheckCircle, Truck, Star, X, Wallet, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function ReleaseFundsModal() {
  const { activeReleaseBooking, confirmPayment, clearActiveRelease, submitAgentRating } = useBookingStore();
  const [step, setStep] = useState('release'); // 'release' | 'rate' | 'done'
  const [rating, setRating] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!activeReleaseBooking) return null;

  const handleRelease = async () => {
    setIsProcessing(true);
    try {
      await confirmPayment(activeReleaseBooking.id);
      toast.success('Funds Released! 💸', {
        description: 'Payment has been transferred to the agent.'
      });
      setStep('rate');
    } catch (err) {
      toast.error('Payment Failed', { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRate = async () => {
    try {
      await submitAgentRating(activeReleaseBooking.id, rating);
      setStep('done');
      setTimeout(() => {
        clearActiveRelease();
        setStep('release');
        setRating(0);
      }, 2000);
    } catch (err) {
      toast.error('Rating failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={clearActiveRelease} />
      
      <div className="relative w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="p-6 pb-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escrow Protection</span>
          </div>
          {step === 'release' && (
             <button onClick={clearActiveRelease} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
               <X className="w-4 h-4 text-slate-400" />
             </button>
          )}
        </div>

        <div className="p-8 text-center">
          {step === 'release' && (
            <div className="space-y-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg ring-4 ring-white dark:ring-slate-900">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">Pickup Verified</h3>
                <p className="text-xs text-slate-400 mt-2 font-bold px-2 leading-relaxed">
                  The agent has confirmed <span className="text-indigo-600 font-black">{activeReleaseBooking.weight_kg || 0}kg</span> of {activeReleaseBooking.waste_type || 'Recyclables'}.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-5 border border-slate-100 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Fee</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">KSh {(activeReleaseBooking.totalPrice || activeReleaseBooking.fee || 0).toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-200/50 dark:bg-white/5" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Total Payable</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono">KSh {(activeReleaseBooking.totalPrice || activeReleaseBooking.fee || 0).toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleRelease}
                disabled={isProcessing}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-indigo-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isProcessing ? 'Processing...' : (
                  <>Authorize Release <Wallet className="w-4 h-4" /></>
                )}
              </button>
              
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60">Held in Secure Sustainomics Escrow</p>
            </div>
          )}

          {step === 'rate' && (
            <div className="space-y-6 py-4">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-10 h-10 text-amber-500 animate-pulse" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Rate your Agent</h3>
                <p className="text-xs text-slate-400 mt-2 font-bold">How was your pickup experience today?</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-90"
                  >
                    <Star className={`w-8 h-8 ${rating >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-700'}`} />
                  </button>
                ))}
              </div>

              <button 
                onClick={handleRate}
                disabled={rating === 0}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                Submit Rating
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-6 py-10 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">All Set!</h3>
                <p className="text-xs text-slate-400 mt-2 font-bold">Thank you for helping keep Kenya clean.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
