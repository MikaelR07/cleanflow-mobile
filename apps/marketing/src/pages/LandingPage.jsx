import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Globe, ArrowRight, Layers, 
  Trash2, Search, TrendingUp, LockKeyhole, BarChart3, 
  CheckCircle2, Sparkles, Building2, Package, 
  Repeat, CreditCard, Brain, Mic, Wallet,
  Leaf, User, Truck, ChevronRight, ExternalLink,
  MessageSquare, Mail, Sun, Moon, Cpu, Award,
  Sprout, HandCoins, Activity, Navigation, Menu, X
} from 'lucide-react';
import { motion } from 'framer-motion';
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
      
      {/* Dynamic Background Elements */}
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

      {/* Floating Glass Panels */}
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
      
      {/* Decorative Dots/Grid */}
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

  const portals = [
    { title: "CleanFlow Resident", desc: "Turn household waste into digital assets with real-time tracking and rewards.", icon: User, color: "from-emerald-500 to-teal-600", link: getPortalLink('client') },
    { title: "CleanFlow Agent", desc: "The official verification hub for waste-as-asset grading and logistics.", icon: Truck, color: "from-blue-500 to-indigo-600", link: getPortalLink('agent') },
    { title: "CleanFlow Weaver", desc: "The live marketplace for informal collectors to claim and trade verified assets.", icon: Building2, color: "from-purple-500 to-pink-600", link: getPortalLink('business') }
  ];

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

        {/* Mobile Menu Overlay */}
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
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-6 flex items-center min-h-[600px] md:min-h-[750px]">
        {/* Background Image Layer */}
        {/* CSS-Only Hero Visual Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${isDarkMode ? 'from-emerald-950/40 via-slate-900 to-slate-900' : 'from-emerald-500/10 via-slate-50 to-slate-50'}`} />
          
          {/* Animated Background Blobs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className={`absolute -top-[10%] -right-[5%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`}
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, -30, 0],
              y: [0, 40, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute -bottom-[5%] -left-[5%] w-[50%] h-[50%] rounded-full blur-[100px] ${isDarkMode ? 'bg-teal-500/10' : 'bg-teal-500/5'}`}
          />
          
          {/* Subtle Grid Overlay */}
          <div className={`absolute inset-0 opacity-[0.05] ${isDarkMode ? 'text-white' : 'text-emerald-900'}`} style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-100 border-emerald-200'}`}>
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">The Ultimate Waste Management Software Suite</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className={`text-5xl md:text-8xl font-black tracking-tight mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Turning Waste into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Digital Assets.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className={`max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed mb-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Four interlocking technological platforms uniting households, informal weavers, industrial titans, and AI infrastructure to turn circular economics into a high-yield reality.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#ecosystem" className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3">
              Explore the Ecosystem <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── ECOSYSTEM STEPPER ────────────────────────────────────── */}
      <section id="ecosystem" className="py-24 px-6 border-y border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-2">The Value Chain</h2>
            <h3 className={`text-3xl font-black italic tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>How CleanFlow Connects Everything</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-emerald-500/20 -translate-y-1/2 z-0" />
            <div className="md:hidden absolute top-0 bottom-0 left-1/2 w-1 h-full bg-gradient-to-b from-emerald-500/20 via-emerald-500 to-emerald-500/20 -translate-x-1/2 z-0" />
            
            {[ { i: User, t: "Households" }, { i: Truck, t: "Verification" }, { i: Building2, t: "Weaver Network" }, { i: ShieldCheck, t: "Asset Market" } ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-4 bg-slate-100 dark:bg-slate-900 p-2 md:bg-slate-50">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                  <step.i className="w-8 h-8" />
                </div>
                <div className="font-bold uppercase tracking-widest text-[10px] text-slate-500 ">{step.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STRATEGIC VISION ────────────────────────────────────── */}
      <section id="vision" className={`py-32 px-6 relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 border-b border-white/5' : 'bg-white border-b border-slate-200'}`}>
        {/* Decorative background glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] blur-[150px] rounded-full ${isDarkMode ? 'bg-emerald-500/5' : 'bg-emerald-500/5'} pointer-events-none`} />

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

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }}
              className="relative"
            >
              <div className={`aspect-square rounded-[4rem] border ${isDarkMode ? 'border-white/5 bg-slate-800/20' : 'border-slate-200 bg-white/50'} backdrop-blur-xl relative overflow-hidden shadow-3xl`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-emerald-500/20 rounded-full border-dashed" />
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border border-teal-500/10 rounded-full border-dashed" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center blur-xl" />
                      <Globe className="w-20 h-20 text-emerald-500 relative z-10" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* ── THE CIRCULAR ECOSYSTEM (Intricate Node Mapping) ───────── */}
      <section id="ecosystem" className={`py-40 px-6 overflow-hidden relative ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="inline-flex items-center gap-2 text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
               <Repeat className="w-4 h-4" /> Systemic Mapping
            </motion.div>
            <h2 className={`text-4xl md:text-6xl font-black mb-8 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               The Value Chain Oracle
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm max-w-2xl mx-auto">
               From household trash to industrial raw material. Every node adds value, verified by AI, secured by Escrow.
            </p>
          </div>

          <div className="relative min-h-[600px] flex items-center justify-center">
            {/* SVG Connection Paths (Desktop Only) */}
            <div className="absolute inset-0 pointer-events-none hidden lg:block">
               <svg className="w-full h-full opacity-20" viewBox="0 0 1200 600" fill="none">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d="M150 300 C 300 300, 300 300, 450 300" 
                    stroke="url(#grad-emerald)" strokeWidth="4" strokeDasharray="10 10" 
                  />
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                    d="M450 300 C 600 300, 600 300, 750 300" 
                    stroke="url(#grad-emerald)" strokeWidth="4" strokeDasharray="10 10" 
                  />
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                    d="M750 300 C 900 300, 900 300, 1050 300" 
                    stroke="url(#grad-emerald)" strokeWidth="4" strokeDasharray="10 10" 
                  />
                  <defs>
                    <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
              {[
                { 
                  title: "Resident Source", 
                  desc: "Waste is segregated & tagged", 
                  value: "Digital Asset Born",
                  icon: Trash2, 
                  pos: "left-[5%]",
                  color: "emerald"
                },
                { 
                  title: "Green Agent", 
                  desc: "AI Scan & Digital Sealing", 
                  value: "Quality Guaranteed",
                  icon: ShieldCheck, 
                  pos: "left-[35%]",
                  color: "blue"
                },
                { 
                  title: "Informal Weaver", 
                  desc: "Lot Aggregation & Storage", 
                  value: "B2B Lot Created",
                  icon: Package, 
                  pos: "left-[65%]",
                  color: "indigo"
                },
                { 
                  title: "Industrial Plant", 
                  desc: "Bulk Purchase via Escrow", 
                  value: "Liquidity Released",
                  icon: Building2, 
                  pos: "left-[95%]",
                  color: "rose"
                },
              ].map((node, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className={`group relative p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border text-center transition-all hover:border-emerald-500/50 ${
                    isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`w-20 h-20 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-12 transition-all duration-500`}>
                    <node.icon className="w-10 h-10" />
                  </div>
                  
                  <div className="absolute top-6 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="px-3 py-1 bg-emerald-500 text-[8px] font-black text-white rounded-full uppercase tracking-widest">
                        Node 0{i+1}
                     </div>
                  </div>

                  <h4 className={`font-black text-2xl mb-2 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{node.title}</h4>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">{node.desc}</p>
                  
                  <div className={`mt-8 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-dashed border-emerald-500/20 text-emerald-500`}>
                     Value Flow: {node.value}
                  </div>

                  {/* Desktop Only Connectors Text */}
                  {i < 3 && (
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
                       <div className="w-16 h-16 rounded-full bg-slate-900 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-pulse">
                          <ArrowRight className="w-6 h-6" />
                       </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTAL DEEP DIVES ─────────────────────────────────────── */}
      <section className="space-y-0">
        
        {/* 1. RESIDENT APP */}
        <div className={`py-32 px-6 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <GlassMockup color="emerald" icon={User} isDarkMode={isDarkMode} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 text-emerald-500 font-bold mb-4 uppercase tracking-widest text-xs">Node One: The Source</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Resident Wealth Portal</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-10">"Turning household waste into a high-yield digital asset."</p>
              <ul className="grid gap-8">
                {[
                  { title: "Dynamic Payouts", desc: "Get paid instantly per KG for segregated materials directly into your M-Pesa linked wallet.", icon: HandCoins },
                  { title: "GFP Reward Engine", desc: "Earn Green Flow Points (GFP) for every verified pickup. Unlock local merchant discounts and achievement status.", icon: Award },
                  { title: "AI Waste Advisory", desc: "Receive personalized tips on how to maximize your household earnings through better segregation.", icon: Sparkles },
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
        <div className={`py-32 px-6 border-y ${isDarkMode ? 'border-white/5 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-blue-500 font-bold mb-4 uppercase tracking-widest text-xs">Node Two: The Verifier</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Green Agent HUD</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-10">"Precision verification for a trust-less circular economy."</p>
              <ul className="grid gap-8">
                {[
                  { title: "HygeneX AI Scanner", desc: "Mobile-first computer vision that grades and seals waste materials with industrial precision.", icon: Search },
                  { title: "Network Value Reveal", desc: "Instantly see the financial impact of every pickup on the network market cap.", icon: Activity },
                  { title: "Optimized Logistics", desc: "AI-driven route mapping ensures maximum collections with minimum carbon footprint.", icon: Navigation },
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
        <div className={`py-32 px-6 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <GlassMockup color="indigo" icon={Building2} isDarkMode={isDarkMode} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 text-indigo-500 font-bold mb-4 uppercase tracking-widest text-xs">Node Three: The Aggregator</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Weaver Marketplace</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-10">"Smart matching for informal weavers and industrial buyers."</p>
              <ul className="grid gap-8">
                {[
                  { title: "Smart Match Feed", desc: "Personalized asset matching based on the Weaver's unique material specializations.", icon: Sparkles },
                  { title: "Digital Warehouse", desc: "Manage verified inventory and self-collected 'side hustle' materials in one dashboard.", icon: Package },
                  { title: "Escrow & Disputes", desc: "Safe, automated 90/10 payment splits with built-in mediation for total trade security.", icon: Wallet },
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

        {/* 4. ADMIN APP */}
        <div className={`py-32 px-6 border-y ${isDarkMode ? 'border-white/5 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-rose-500 font-bold mb-4 uppercase tracking-widest text-xs">Node Four: The Governance</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Network Oracle</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-10">"Macro control over the entire waste-as-asset economy."</p>
              <ul className="grid gap-8">
                {[
                  { title: "Financial Oversight", desc: "Track liquidity, platform commissions, and agent bounties from a centralized HUD.", icon: BarChart3 },
                  { title: "Market Correction", desc: "Manually adjust material price-per-KG to respond to global market shifts instantly.", icon: Globe },
                  { title: "Dispute Mediation", desc: "Review and resolve marketplace disputes with full access to verified digital pedigrees.", icon: LockKeyhole },
                ].map((f, i) => (
                  <li key={i} className="flex gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center"><f.icon className="w-6 h-6" /></div>
                    <div>
                      <h4 className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{f.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
              <GlassMockup color="rose" icon={ShieldCheck} isDarkMode={isDarkMode} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PORTAL LAUNCHER ─────────────────────────────────────────── */}
      <section id="portals" className={`py-32 px-6 ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-100'} transition-colors`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-black mb-4 italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Launch Your Software</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Select the portal that fits your role.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "CleanFlow Resident", desc: "Homeowners & Estates", icon: User, color: "emerald", url: getPortalLink('client') },
              { title: "CleanFlow Agent", desc: "Verifiers & Logistics", icon: Truck, color: "blue", url: getPortalLink('agent') },
              { title: "CleanFlow Weaver", desc: "B2B Marketplace", icon: Building2, color: "indigo", url: getPortalLink('business') },
            ].map((portal, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className={`p-8 rounded-[3rem] border transition-all group relative overflow-hidden ${
                  isDarkMode ? 'bg-slate-900 border-white/5 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500/50'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500`}>
                  <portal.icon className="w-7 h-7" />
                </div>
                <h3 className={`font-black text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{portal.title}</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">{portal.desc}</p>
                <a 
                  href={portal.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500 group-hover:gap-4 transition-all"
                >
                  Enter Portal <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className={`py-20 px-6 border-t relative transition-colors ${isDarkMode ? 'border-white/5 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-6">
                <Leaf className="w-8 h-8 text-emerald-500" />
                <span className={`text-2xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CleanFlow</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs italic">Scaling the circular economy through technology and logistical excellence.</p>
            </div>
            
            <div>
              <h5 className={`text-sm font-black uppercase tracking-widest mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Platforms</h5>
              <ul className="space-y-4 text-sm font-bold text-slate-500 italic">
                <li><a href="#ecosystem" className="hover:text-emerald-500 transition-colors">Ecosystem</a></li>
                <li><a href="#vision" className="hover:text-emerald-500 transition-colors">Strategic Vision</a></li>
                <li><a href="#portals" className="hover:text-emerald-500 transition-colors">Portals</a></li>
              </ul>
            </div>

            <div>
              <h5 className={`text-sm font-black uppercase tracking-widest mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Social Ecosystem</h5>
              <div className="flex items-center gap-6">
                <Globe className="w-6 h-6 text-slate-400 hover:text-emerald-500 cursor-pointer" />
                <Mail className="w-6 h-6 text-slate-400 hover:text-emerald-500 cursor-pointer" />
                <MessageSquare className="w-6 h-6 text-slate-400 hover:text-emerald-500 cursor-pointer" />
              </div>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center border-t border-slate-200 dark:border-white/5 pt-12 italic">© 2026 CleanFlow Logistics. Optimized for Circularity.</p>
        </div>
      </footer>

      {/* Live Network Pulse */}
      <ImpactTicker />
    </div>
  );
}
