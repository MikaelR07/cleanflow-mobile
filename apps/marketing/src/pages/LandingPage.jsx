import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Globe, ArrowRight, Layers, 
  Trash2, Search, TrendingUp, LockKeyhole, BarChart3, 
  CheckCircle2, Sparkles, Building2, Package, 
  Repeat, Recycle, CreditCard, Brain, Mic, Wallet,
  Leaf, User, Truck, ChevronRight, ExternalLink,
  MessageSquare, Mail, Sun, Moon, Cpu, Award,
  Sprout, HandCoins, Activity, Navigation, Menu, X,
  ShoppingBag, Home as HomeIcon, LineChart, Shield, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, useAssetStore } from '@cleanflow/core';
import ImpactTicker from '../components/ImpactTicker';

const GlassMockup = ({ color = "emerald", icon: Icon, isDarkMode }) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/40', glow: 'from-emerald-500/20', border: 'border-emerald-500/20' },
    blue: { bg: 'bg-blue-500', shadow: 'shadow-blue-500/40', glow: 'from-blue-500/20', border: 'border-blue-500/20' },
    purple: { bg: 'bg-purple-500', shadow: 'shadow-purple-500/40', glow: 'from-purple-500/20', border: 'border-purple-500/20' },
    rose: { bg: 'bg-rose-500', shadow: 'shadow-rose-500/40', glow: 'from-rose-500/20', border: 'border-rose-500/20' },
    indigo: { bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/40', glow: 'from-indigo-500/20', border: 'border-indigo-500/20' },
  };
  const theme = colorMap[color];

  return (
    <div className={`aspect-square rounded-[2rem] md:rounded-[3rem] border ${isDarkMode ? 'border-white/5 bg-slate-800/20' : 'border-slate-200 bg-white/50'} relative overflow-hidden shadow-2xl backdrop-blur-sm group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow} to-transparent opacity-50`} />
      
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] ${theme.bg} opacity-20`}
      />

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`w-32 h-32 rounded-[2rem] ${theme.bg} flex items-center justify-center text-white shadow-2xl ${theme.shadow} transform group-hover:scale-110 transition-transform duration-700`}
        >
          <Icon className="w-16 h-16" />
        </motion.div>
      </div>

      <motion.div 
        animate={{ x: [0, 15, 0], y: [0, 10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-12 right-12 w-24 h-24 rounded-2xl border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/30'} backdrop-blur-md shadow-lg`} 
      />
      <motion.div 
        animate={{ x: [0, -20, 0], y: [0, -5, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute bottom-12 left-12 w-32 h-32 rounded-3xl border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/30'} backdrop-blur-md shadow-lg`} 
      />
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
    </div>
  );
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { fetchAssets } = useAssetStore();

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPortalLink = (app) => {
    if (import.meta.env.DEV) {
      const ports = { client: '5173', agent: '5174', business: '5175', admin: '5176' };
      return `http://localhost:${ports[app]}`;
    }
    const fallbacks = {
      client: 'https://cleanflow-client.netlify.app',
      agent: 'https://cleanflow-agent.netlify.app',
      business: 'https://cleanflow-business.netlify.app',
      admin: 'https://cleanflow-admin.netlify.app'
    };
    return import.meta.env[`VITE_URL_${app.toUpperCase()}`] || fallbacks[app] || '#';
  };

  return (
    <div className={`overflow-hidden min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 text-slate-100 selection:bg-emerald-500/30' : 'bg-slate-50 text-slate-900 selection:bg-emerald-500/20'}`}>
      
      {/* ── NAVBAR ────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || mobileMenuOpen ? (isDarkMode ? 'bg-slate-900/90 border-white/5' : 'bg-white/90 border-slate-200') + ' backdrop-blur-xl border-b py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CleanFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold">
            <a href="#ecosystem" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}>Ecosystem</a>
            <a href="#vision" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}>Vision</a>
            <a href="#portals" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}>Portals</a>
            
            <button onClick={toggleTheme} className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <a href="#portals" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-emerald-500/20">Launch Apps</a>
          </div>

          <div className="flex md:hidden items-center gap-4">
            <button onClick={toggleTheme} className={`p-2 rounded-full ${isDarkMode ? 'text-yellow-400' : 'text-slate-700'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={isDarkMode ? 'text-white' : 'text-slate-900'}>
              {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`md:hidden absolute top-full left-0 right-0 border-b p-6 space-y-6 font-bold ${isDarkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
          >
            <a href="#ecosystem" onClick={() => setMobileMenuOpen(false)} className="block text-2xl">Ecosystem</a>
            <a href="#vision" onClick={() => setMobileMenuOpen(false)} className="block text-2xl">Vision</a>
            <a href="#portals" onClick={() => setMobileMenuOpen(false)} className="block text-2xl">Portals</a>
            <a href="#portals" onClick={() => setMobileMenuOpen(false)} className="block py-4 bg-emerald-500 text-white text-center rounded-2xl">Launch Apps</a>
          </motion.div>
        )}
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-6 flex items-center min-h-[700px] md:min-h-[850px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${isDarkMode ? 'from-emerald-950/40 via-slate-900 to-slate-900' : 'from-emerald-500/10 via-slate-50 to-slate-50'}`} />
          
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className={`absolute -top-[10%] -right-[5%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`}
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute -bottom-[5%] -left-[5%] w-[50%] h-[50%] rounded-full blur-[100px] ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`}
          />
          
          <div className={`absolute inset-0 opacity-[0.05] ${isDarkMode ? 'text-white' : 'text-emerald-900'}`} style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-100 border-emerald-200'}`}>
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">The Ultimate Waste Management Software Suite</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className={`text-5xl md:text-8xl font-black tracking-tight mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Closing the Loop on <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Africa's Waste Management</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className={`max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed mb-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Four interlocking technological platforms uniting households, informal collectors, industrial titans, and AI infrastructure to turn circular economics into a high-yield reality.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#ecosystem" className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-95">
              Explore the Ecosystem <ChevronRight className="w-5 h-5" />
            </a>
            <a href="#portals" className={`w-full sm:w-auto px-10 py-5 border rounded-2xl font-black transition-all flex items-center justify-center gap-3 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}>
              View Our Portals <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── PERSONA SELECTION SECTION ──────────────────────────────── */}
      <section id="personas" className={`py-32 px-6 relative overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500 mb-4">The Persona-Driven Experience</h2>
            <h3 className={`text-4xl md:text-6xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>One Platform. Three Journeys.</h3>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Resident Persona */}
            <motion.div 
              className={`p-10 rounded-[3.5rem] border relative overflow-hidden group transition-all duration-500 md:hover:-translate-y-2 ${isDarkMode ? 'bg-slate-900 border-white/5 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500/50 shadow-xl'}`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <HomeIcon className="w-48 h-48" />
              </div>
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/30 group-hover:rotate-12 transition-transform">
                <HomeIcon className="w-8 h-8" />
              </div>
              <h4 className={`text-2xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>The Home Resident</h4>
              <p className={`text-sm font-medium leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Focus on convenience and community. Schedule pickups from your doorstep, track your environmental impact, and earn rewards for every collection.
              </p>
              <ul className="space-y-3">
                {[
                  "Doorstep Smart Pickups",
                  "Community Impact Dashboard",
                  "Eco-Reward Marketplace",
                  "AI Segregation Coach"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Seller Persona */}
            <motion.div 
              className={`p-10 rounded-[3.5rem] border relative overflow-hidden group transition-all duration-500 md:hover:-translate-y-2 ${isDarkMode ? 'bg-slate-900 border-white/5 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-500/50 shadow-xl'}`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShoppingBag className="w-48 h-48" />
              </div>
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30 group-hover:-rotate-12 transition-transform">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className={`text-2xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>The Professional Seller</h4>
              <p className={`text-sm font-medium leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Focus on profit and inventory. Access live material market rates, analyze inventory with AI, and maximize earnings through Hub drop-offs.
              </p>
              <ul className="space-y-3">
                {[
                  "Live Market Price Oracle",
                  "AI Material Valuation",
                  "Strategic Hub Drop-offs",
                  "Bulk Inventory Manager"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-indigo-500">
                    <CheckCircle2 className="w-4 h-4" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Agent Persona */}
            <motion.div 
              className={`p-10 rounded-[3.5rem] border relative overflow-hidden group transition-all duration-500 md:hover:-translate-y-2 ${isDarkMode ? 'bg-slate-900 border-white/5 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-500/50 shadow-xl'}`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Truck className="w-48 h-48" />
              </div>
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/30 group-hover:rotate-12 transition-transform">
                <Truck className="w-8 h-8" />
              </div>
              <h4 className={`text-2xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>The Collection Agent</h4>
              <p className={`text-sm font-medium leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Work independently or partner with CleanFlow. Own your schedule, build your own client base, or tap into our network for guaranteed job flow and premium commissions.
              </p>
              <ul className="space-y-3">
                {[
                  "Independent or Partnered Mode",
                  "Real-Time Job Dispatch",
                  "AI-Powered Route Optimization",
                  "Instant M-Pesa Payouts"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-blue-500">
                    <CheckCircle2 className="w-4 h-4" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STRATEGIC VISION ────────────────────────────────────── */}
      <section id="vision" className={`py-32 px-6 relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 border-b border-white/5' : 'bg-white border-b border-slate-200'}`}>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] blur-[150px] rounded-full bg-emerald-500/5 pointer-events-none`} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-6 font-mono">The Thesis</h2>
              <h3 className={`text-4xl md:text-6xl font-black mb-8 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                A Future Where <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 italic">Waste is an Asset.</span>
              </h3>
              <p className={`text-lg font-medium leading-relaxed mb-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                CleanFlow is more than a software suite—it is the digital foundation for a circular society. By integrating real-time telemetry, automated rewards, and industrial marketplaces, we are transforming waste into a high-value digital asset.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Traceability", val: "100%", sub: "Source to Recycler" },
                  { label: "Rewards", val: "Instant", sub: "Digital Payouts" },
                  { label: "AI Operations", val: "24/7", sub: "Predictive Analytics" }
                ].map((stat, i) => (
                  <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-2xl font-black text-emerald-500 mb-1">{stat.val}</div>
                    <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.label}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </motion.div>

              <GlassMockup color="emerald" icon={Recycle} isDarkMode={isDarkMode} />
          </div>
        </div>
      </section>

      {/* ── HYGENEX AI SECTION ───────────────────────────────────── */}
      <section id="ai" className={`py-40 px-6 relative ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 text-indigo-500 font-black uppercase tracking-widest text-xs mb-6">
                <Brain className="w-5 h-5" /> Built-In AI That Does the Hard Work
              </div>
              <h3 className={`text-4xl md:text-7xl font-black mb-8 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                The Oracle of<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 italic">Material Value.</span>
              </h3>
              <p className={`text-xl font-medium leading-relaxed mb-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                HygeneX is our proprietary AI engine that powers the entire ecosystem. It identifies 50+ material types, grades quality instantly, and provides a real-time "Oracle" price for every gram you collect.
              </p>

              <div className="grid gap-6">
                {[
                  { title: "Computer Vision Grading", desc: "Grade materials from PET to HDPE with 98.7% accuracy using your mobile camera.", icon: Search },
                  { title: "Live Price Oracle", desc: "Our AI tracks global and local market shifts to give you the highest possible payout every day.", icon: LineChart },
                  { title: "Fraud Protection", desc: "Digital Sealing technology ensures that once AI verifies an asset, its value is locked and secured.", icon: Shield },
                ].map((item, i) => (
                  <div key={i} className={`p-6 rounded-3xl border flex gap-6 items-start transition-colors ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h5>
                      <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }}
              className="relative"
            >
              <GlassMockup color="indigo" icon={Brain} isDarkMode={isDarkMode} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SYSTEMIC NODES ────────────────────────────────────────── */}
      <section id="ecosystem" className={`py-40 px-6 overflow-hidden relative ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="inline-flex items-center gap-2 text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
               <Repeat className="w-4 h-4" /> Global Value Chain
            </motion.div>
            <h2 className={`text-4xl md:text-6xl font-black mb-8 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               The Value Chain Oracle
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm max-w-2xl mx-auto leading-relaxed">
               Every kilogram is tracked, verified by AI, and traded in our secure B2B marketplace. From your bin to the industrial plant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Smart Source", desc: "Persona-driven material collection.", value: "Asset Initialization", icon: Trash2, color: "emerald" },
              { title: "Verification", desc: "AI-powered grading & sealing.", value: "Value Certification", icon: ShieldCheck, color: "blue" },
              { title: "Aggregation", desc: "B2B supply lot creation.", value: "Market Liquidity", icon: Building2, color: "indigo" },
              { title: "Production", desc: "Industrial purchase via Escrow.", value: "Economic Closing", icon: Recycle, color: "rose" },
            ].map((node, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-10 rounded-[3rem] border text-center group transition-all duration-500 ${
                  isDarkMode ? 'bg-slate-900 border-white/5 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-lg hover:border-emerald-500/50'
                }`}
              >
                <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                  <node.icon className="w-10 h-10" />
                </div>
                <h4 className={`font-black text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{node.title}</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">{node.desc}</p>
                <div className="py-2 px-4 rounded-xl text-[8px] font-black uppercase tracking-widest border border-dashed border-emerald-500/20 text-emerald-500">
                   {node.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTAL DEEP DIVES ─────────────────────────────────────── */}
      <section className="space-y-0">
        
        {/* 1. CLIENT APP */}
        <div className={`py-32 px-6 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <GlassMockup color="emerald" icon={User} isDarkMode={isDarkMode} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 text-emerald-500 font-bold mb-4 uppercase tracking-widest text-xs">Platform One: The Client</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Resident & Seller Portal</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-10">"Choose your path — convenience or profit — and turn waste into wealth."</p>
              <ul className="grid gap-8">
                {[
                  { title: "Persona-Driven Onboarding", desc: "Choose between Home Resident (doorstep convenience & GFP rewards) or Professional Seller (market-rate payouts & inventory tools) from your first tap.", icon: User },
                  { title: "HygeneX AI Scanner", desc: "Snap a photo of any material. Our AI identifies it, grades its quality, and shows you its live market value in real-time.", icon: Search },
                  { title: "Dynamic Payouts per KG", desc: "Get paid at live market rates directly into your M-Pesa-linked wallet. Prices update daily via our Price Oracle.", icon: HandCoins },
                  { title: "Smart Pickup Booking", desc: "Schedule doorstep collections or find the nearest Hub drop-off. AI optimizes scheduling for fastest service.", icon: Truck },
                ].map((f, i) => (
                  <li key={i} className="flex gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><f.icon className="w-6 h-6" /></div>
                    <div>
                      <h4 className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{f.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* 2. AGENT APP */}
        <div className={`py-32 px-6 border-y ${isDarkMode ? 'border-white/5 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-blue-500 font-bold mb-4 uppercase tracking-widest text-xs">Platform Two: The Verifier</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Green Agent HUD</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-10">"Precision logistics and AI verification for a trust-less circular economy."</p>
              <ul className="grid gap-8">
                {[
                  { title: "Real-Time Job Board", desc: "Go online and receive live pickup missions matched to your GPS location. Accept with one tap, navigate with built-in routing.", icon: Briefcase },
                  { title: "AI Grade & Seal", desc: "Use HygeneX computer vision to grade collected materials on-site. Once sealed, the asset value is locked and fraud-proof.", icon: ShieldCheck },
                  { title: "Route Optimizer", desc: "AI-driven multi-stop route planning ensures maximum collections with minimum fuel cost and carbon footprint.", icon: Navigation },
                  { title: "Earning Dashboard", desc: "Track daily commissions, completed pickups, and performance bonuses. Withdraw earnings to M-Pesa instantly.", icon: TrendingUp },
                ].map((f, i) => (
                  <li key={i} className="flex gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><f.icon className="w-6 h-6" /></div>
                    <div>
                      <h4 className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{f.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
              <GlassMockup color="blue" icon={Truck} isDarkMode={isDarkMode} />
            </motion.div>
          </div>
        </div>

        {/* 3. BUSINESS APP */}
        <div className={`py-32 px-6 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <GlassMockup color="indigo" icon={Building2} isDarkMode={isDarkMode} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 text-indigo-500 font-bold mb-4 uppercase tracking-widest text-xs">Platform Three: The Marketplace</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Weaver Marketplace</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-10">"Where informal collectors and industrial titans trade verified waste assets at scale."</p>
              <ul className="grid gap-8">
                {[
                  { title: "Supply Terminal for Collectors", desc: "Informal collectors browse and claim verified material lots from the CleanFlow network. Smart matching recommends assets based on each weaver's material specialization and location.", icon: Package },
                  { title: "Industrial Procurement Hub", desc: "Large recycling plants and manufacturers place bulk purchase orders for specific grades and volumes. The platform aggregates weaver supply to meet industrial-scale demand.", icon: Building2 },
                  { title: "Digital Warehouse", desc: "Weavers manage their full inventory — both CleanFlow-sourced and independently collected materials — in a unified dashboard with AI-powered valuation and lot creation tools.", icon: Layers },
                  { title: "Escrow & B2B Settlement", desc: "All trades between Collectors and industrial buyers are secured with automated escrow, built-in dispute mediation, and instant M-Pesa or bank settlement for both parties.", icon: Wallet },
                  { title: "Market Intelligence", desc: "Real-time price feeds, demand forecasting from industrial buyers, and AI-generated trade recommendations help both weavers and buyers maximize their margins.", icon: Brain },
                ].map((f, i) => (
                  <li key={i} className="flex gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center"><f.icon className="w-6 h-6" /></div>
                    <div>
                      <h4 className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{f.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PORTAL LAUNCHER ─────────────────────────────────────────── */}
      <section id="portals" className={`py-40 px-6 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-black mb-4 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ready to join the ecosystem?</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Select your gateway to the circular economy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "CleanFlow Client", desc: "For Residents(Household waste scheduling,trackin) & Professional Sellers", icon: User, url: getPortalLink('client') },
              { title: "CleanFlow Agent", desc: "A Digital Hub for mechanized waste collectors", icon: Truck, url: getPortalLink('agent') },
              { title: "CleanFlow Collectors", desc: "For Businesses & Recyclers", icon: Building2, url: getPortalLink('business') },
            ].map((portal, i) => (
              <motion.div
                key={i}
                className={`p-10 rounded-[3.5rem] border transition-all md:hover:-translate-y-2 group relative overflow-hidden ${
                  isDarkMode ? 'bg-slate-800/50 border-white/5 hover:border-emerald-500/50' : 'bg-slate-50 border-slate-200 hover:border-emerald-500/50 shadow-xl'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl mb-8 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                  <portal.icon className="w-8 h-8" />
                </div>
                <h3 className={`font-black text-2xl mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{portal.title}</h3>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed">{portal.desc}</p>
                <a 
                  href={portal.url} 
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all"
                >
                  Enter Portal <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className={`py-32 px-6 border-t relative transition-colors ${isDarkMode ? 'border-white/5 bg-slate-950' : 'border-slate-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                   <Leaf className="w-7 h-7 text-white" />
                </div>
                <span className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CleanFlow</span>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed max-w-sm italic">
                Pioneering the first AI-driven circular logistics network in East Africa. Scaling sustainability through intelligence.
              </p>
            </div>
            
            <div>
              <h5 className={`text-sm font-black uppercase tracking-widest mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Explore</h5>
              <ul className="space-y-4 text-sm font-bold text-slate-500 italic">
                <li><a href="#ecosystem" className="hover:text-emerald-500 transition-colors">Ecosystem</a></li>
                <li><a href="#vision" className="hover:text-emerald-500 transition-colors">Vision</a></li>
                <li><a href="#portals" className="hover:text-emerald-500 transition-colors">Portals</a></li>
              </ul>
            </div>

            <div>
              <h5 className={`text-sm font-black uppercase tracking-widest mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Network</h5>
              <div className="flex items-center gap-6">
                <Globe className="w-6 h-6 text-slate-400 hover:text-emerald-500 transition-all cursor-pointer" />
                <Mail className="w-6 h-6 text-slate-400 hover:text-emerald-500 transition-all cursor-pointer" />
                <MessageSquare className="w-6 h-6 text-slate-400 hover:text-emerald-500 transition-all cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">© 2026 CleanFlow Logistics. All Rights Reserved.</p>
             <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="cursor-pointer hover:text-emerald-500">Security</span>
                <span className="cursor-pointer hover:text-emerald-500">Privacy</span>
                <span className="cursor-pointer hover:text-emerald-500">Status: Operational</span>
             </div>
          </div>
        </div>
      </footer>

      <ImpactTicker />
    </div>
  );
}

