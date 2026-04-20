import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Crown, Zap, Shield, Sparkles, Star } from 'lucide-react';
import { useAuthStore } from '@cleanflow/core';
import { SUBSCRIPTION_TIERS } from '@cleanflow/core/src/data/mockData';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { profile, updateSubscription } = useAuthStore();
  
  const currentTier = profile?.subscriptionTier || 'lite';

  const handleUpgrade = async (tierId) => {
    try {
      if (tierId === currentTier) return;
      
      await updateSubscription(tierId);
      toast.success(`Mission level: ${SUBSCRIPTION_TIERS[tierId].label}! 🎉`, {
        description: `You are now an ${SUBSCRIPTION_TIERS[tierId].impactTag}.`
      });
      navigate('/');
    } catch (error) {
      toast.error('Failed to update mission level');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Your Impact Level</h1>
      </div>

      {/* Hero Card (Value Back Focus) */}
      <div className="bg-gradient-to-br from-primary to-green-700 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Environmental Hero</p>
          <h2 className="text-2xl font-black mb-4">Offset Your Costs Through Recycling</h2>
          <div className="flex items-center gap-2 text-[10px] font-black bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/30 uppercase tracking-widest">
            <Zap className="w-3 h-3 fill-amber-300 text-amber-300" /> Most members earn back their fee in rewards
          </div>
        </div>
        <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 rotate-12" />
      </div>

      {/* Impact Levels List */}
      <div className="space-y-4">
        {Object.values(SUBSCRIPTION_TIERS).map((tier) => {
          const isCurrent = tier.id === currentTier;
          const isImpact = tier.id !== 'lite';
          
          return (
            <div 
              key={tier.id}
              className={`card p-6 relative transition-all border-2 ${
                isCurrent ? 'border-primary ring-4 ring-primary/5' : 'border-transparent'
              }`}
            >
              {isImpact && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-400 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest flex items-center gap-1 ring-4 ring-white dark:ring-slate-900">
                  <Star className="w-2.5 h-2.5 fill-white" /> {tier.impactTag}
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {tier.label}
                    {tier.id === 'premium' && <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  </h3>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {tier.rewardMult}x Reward Multiplier
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
                    {tier.price === 0 ? 'Free' : `KSh ${tier.price.toLocaleString()}`}
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Contribution / month</p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(tier.id)}
                disabled={isCurrent}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                  isCurrent 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default' 
                    : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isCurrent ? 'Current Level' : tier.id === 'lite' ? 'Return to Basic' : `Become an ${tier.impactTag}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Community Impact Footer */}
      <div className="card p-5 bg-slate-50 dark:bg-slate-800/50 border-dashed border-2 border-slate-200 dark:border-slate-700">
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Your Community Impact
        </h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
          Standard and Premium contributions fund public estate bins and neighborhood cleanup projects in your area. 
          100% of rewards earned go directly to your wallet for M-Pesa withdrawal.
        </p>
      </div>
      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-6 py-6">
        Prices include all NEMA disposal levies and insurance. You can cancel or change your plan anytime.
      </p>
    </div>
  );
}
