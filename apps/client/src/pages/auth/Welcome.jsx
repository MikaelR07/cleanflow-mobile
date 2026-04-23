import { useNavigate } from 'react-router-dom';
import { ArrowRight, Recycle, Gift, Gauge, Sparkles } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col p-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-5%] left-[-10%] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[20%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <img src="/logo.png" className="w-48 h-auto mb-6 animate-in zoom-in-50 duration-700 shadow-xl rounded-3xl" alt="Brand Logo" />
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6 w-fit">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Recycle & Earn Cashback</span>
        </div>

        <h1 className="text-5xl font-black text-slate-900 dark:text-white leading-[0.95] mb-6 tracking-tighter">
          Clean Home. <br />
          <span className="text-emerald-500 italic">Green Wallet.</span>
        </h1>

        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-10 leading-relaxed">
          The easiest way to dispose of your waste while earning rewards for every kilogram you recycle.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 gap-6 mb-10">
          {[
            { icon: Recycle, title: 'Smart Pickups', desc: 'Book a collection in 30 seconds.' },
            { icon: Gift, title: 'Cashback Rewards', desc: 'Get paid to keep your neighborhood clean.' },
            { icon: Gauge, title: 'Track Impact', desc: 'See your real-time CO2 savings and points.' }
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform border border-slate-100 dark:border-slate-700">
                <feat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{feat.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative z-10 pb-8 space-y-4">
        <button
          onClick={() => navigate('/register')}
          className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black text-base shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          Start Recycling <ArrowRight className="w-5 h-5" />
        </button>
        
        <p className="text-center text-sm text-slate-400 font-medium">
          Already a member? <span onClick={() => navigate('/login')} className="text-emerald-500 font-bold cursor-pointer">Log In</span>
        </p>
      </div>
    </div>
  );
}
