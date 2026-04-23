import { useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Wallet, ShieldCheck, Sparkles } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col p-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-5%] right-[-10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[10%] left-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <img src="/logo.png" className="w-48 h-auto mb-6 animate-in zoom-in-50 duration-700 shadow-xl rounded-3xl" alt="Brand Logo" />
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-6 w-fit">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Join Africa's Greenest Fleet</span>
        </div>

        <h1 className="text-5xl font-black text-slate-900 dark:text-white leading-[0.95] mb-6 tracking-tighter">
          Drive. <br />
          Collect. <br />
          <span className="text-primary italic">Earn Big.</span>
        </h1>

        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-10 leading-relaxed">
          Become a CleanFlow Agent and turn your vehicle into a revenue machine while cleaning up your city.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 gap-6 mb-10">
          {[
            { icon: Truck, title: 'Flexible Jobs', desc: 'Accept pickup requests whenever you want.' },
            { icon: Wallet, title: 'Higher Earnings', desc: 'Get paid for service fees AND material sales.' },
            { icon: ShieldCheck, title: 'Verified Work', desc: 'Transparent tracking and instant M-Pesa payouts.' }
          ].map((feat, idx) => (
            <div key={idx} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-slate-100 dark:border-slate-700">
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
          className="w-full py-5 bg-primary text-white rounded-3xl font-black text-base shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          Join the Team <ArrowRight className="w-5 h-5" />
        </button>
        
        <p className="text-center text-sm text-slate-400 font-medium">
          Already an Agent? <span onClick={() => navigate('/login')} className="text-primary font-bold cursor-pointer">Log In</span>
        </p>
      </div>
    </div>
  );
}
