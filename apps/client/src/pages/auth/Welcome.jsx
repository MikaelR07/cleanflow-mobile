import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Recycle, Gift, Gauge, Sparkles, Home, ShoppingBag, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Welcome() {
  const navigate = useNavigate();
  const [showPersonaSelect, setShowPersonaSelect] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col p-6 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-5%] left-[-10%] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[20%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      <AnimatePresence mode="wait">
        {!showPersonaSelect ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col"
          >
            {/* Hero Section */}
            <div className="flex-1 flex flex-col justify-center relative z-10">

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
                onClick={() => setShowPersonaSelect(true)}
                className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black text-base shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                Start Recycling <ArrowRight className="w-5 h-5" />
              </button>
              
              <p className="text-center text-sm text-slate-400 font-medium">
                Already a member? <span onClick={() => navigate('/login')} className="text-emerald-500 font-bold cursor-pointer">Log In</span>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="persona"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center relative z-10"
          >
            <button onClick={() => setShowPersonaSelect(false)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-8">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>

            <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">Choose Your Path</h2>
              <p className="text-slate-500 font-medium">How will you use CleanFlow today?</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => navigate('/register?type=resident')}
                className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-emerald-500 transition-all text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Home className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                   <Home className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Home Resident</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[200px]">
                  I want a clean home, smart IOTs, and community rewards.
                </p>
                <div className="mt-6 flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                   Select Path <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              <button 
                onClick={() => navigate('/register?type=seller')}
                className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <ShoppingBag className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                   <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Professional Seller</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[200px]">
                  I want to earn maximum profit from my recyclable materials.
                </p>
                <div className="mt-6 flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-widest">
                   Select Path <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
