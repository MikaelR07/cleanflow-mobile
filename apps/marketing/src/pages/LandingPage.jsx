import { useState, useEffect } from 'react';
import { 
  Leaf, ShieldCheck, Zap, Globe, 
  Building2, User, Truck, 
  ChevronRight, ExternalLink, BarChart3, Bot,
  MessageSquare, Mail, Layers, Sun, Moon,
  Cpu, Award, Sprout, HandCoins, Activity,
  LockKeyhole, TrendingUp, Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '@cleanflow/core';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { isDarkMode, toggleTheme } = useThemeStore();

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
    { title: "CleanFlow Resident", desc: "Household waste scheduling, tracking, and rewards.", icon: User, color: "from-emerald-500 to-teal-600", link: getPortalLink('client') },
    { title: "CleanFlow Agent", desc: "Digital hub for mechanized waste collectors.", icon: Truck, color: "from-blue-500 to-indigo-600", link: getPortalLink('agent') },
    { title: "CleanFlow Business", desc: "Industrial B2B marketplace and AI advisory.", icon: Building2, color: "from-purple-500 to-pink-600", link: getPortalLink('business') },
    { title: "CleanFlow Admin", desc: "High-security systemic control and oversight.", icon: ShieldCheck, color: "from-rose-500 to-orange-600", link: getPortalLink('admin') }
  ];

  return (
    <div className={`overflow-hidden min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 text-slate-100 selection:bg-emerald-500/30' : 'bg-slate-50 text-slate-900 selection:bg-emerald-500/20'}`}>
      
      {/* ── NAVBAR ────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? (isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-white/80 border-slate-200') + ' backdrop-blur-xl border-b py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CleanFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold">
            <a href="#ecosystem" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}>Ecosystem</a>
            <a href="#portals" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} transition-colors`}>Portals</a>
            
            <button onClick={toggleTheme} className={`p-2.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <a href="#portals" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-emerald-500/20">Launch Apps</a>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-48 pb-32 px-6">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-300/20'}`} />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-100 border-emerald-200'}`}>
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">The Ultimate Software Suite</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className={`text-5xl md:text-8xl font-black tracking-tight mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Closing the Loop on <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Africa's Waste</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className={`max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed mb-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Four interlocking technological platforms uniting households, independent mechanics, industrial titans, and AI infrastructure to make circular economics a reality.
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
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-emerald-500/20 -translate-y-1/2 z-0" />
            
            {[ { i: User, t: "Households" }, { i: Truck, t: "Agents" }, { i: Building2, t: "Marketplace" }, { i: ShieldCheck, t: "Oversight" } ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-4 bg-slate-50 dark:bg-slate-900 p-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                  <step.i className="w-8 h-8" />
                </div>
                <div className="font-bold uppercase tracking-widest text-xs text-slate-500 ">{step.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEEP DIVES ─────────────────────────────────────────── */}
      <section className="py-12">
        
        {/* 1. CLIENT APP */}
        <div className={`py-24 px-6 ${isDarkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-100/50'} transition-colors`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/10 flex items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <User className="w-48 h-48 text-emerald-500 drop-shadow-2xl" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 text-emerald-500 font-bold mb-4 uppercase tracking-widest text-xs">Platform One</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CleanFlow Resident</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-8">"Turn your daily waste into actual wealth with gamified tracking."</p>
              
              <ul className="space-y-6">
                {[
                  { title: "Dynamic Weight-Based Pricing", desc: "Get paid instantly per KG for segregated plastic and metal, securely into your digital wallet.", icon: HandCoins },
                  { title: "IoT Eco-System", desc: "We integrate with CleanFlow IoT hardware—real-time air quality sensors and smart bins that alert agents automatically when they reach extreme volume capacities.", icon: Cpu },
                  { title: "GFP Rewards & Gamification", desc: "Earn Green Flow Points (GFP) and unlock achievement badges. Turn your recycling volume into leaderboards and cashback bonuses.", icon: Award },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><item.icon className="w-5 h-5" /></div>
                    <div>
                      <h4 className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* 2. AGENT APP */}
        <div className={`py-24 px-6 border-y ${isDarkMode ? 'border-white/5 bg-slate-900 hover:bg-slate-800/30' : 'border-slate-200 bg-white hover:bg-slate-50/80'} transition-colors`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-blue-500 font-bold mb-4 uppercase tracking-widest text-xs">Platform Two</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CleanFlow Agent</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-8">"The ultimate logistics tool for verified waste mechanics."</p>
              
              <ul className="space-y-6">
                {[
                  { title: "Live Mission Boards", desc: "Agents receive real-time push notifications from smart-bins or household pickup requests in their verified zones.", icon: Activity },
                  { title: "GPS Route Optimization", desc: "Dynamic mapping technology built into the app ensures agents collect maximum volume with minimum travel time.", icon: Navigation },
                  { title: "Instant Digital Payouts", desc: "The moment an agent validates a KG-weight collection, the bounty is routed into their mobile wallet for instant withdrawal.", icon: Zap },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><item.icon className="w-5 h-5" /></div>
                    <div>
                      <h4 className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-blue-500/20 to-blue-900/20 border border-blue-500/10 flex items-center justify-center p-12 relative overflow-hidden">
                <Truck className="w-48 h-48 text-blue-500 drop-shadow-2xl" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* 3. BUSINESS APP */}
        <div className={`py-24 px-6 ${isDarkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-100/50'} transition-colors`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-purple-500/20 to-pink-900/20 border border-purple-500/10 flex items-center justify-center p-12 relative overflow-hidden">
                <Building2 className="w-48 h-48 text-purple-500 drop-shadow-2xl" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 text-purple-500 font-bold mb-4 uppercase tracking-widest text-xs">Platform Three</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CleanFlow Business</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-8">"Industrial-scale raw material sourcing powered by AI."</p>
              
              <ul className="space-y-6">
                {[
                  { title: "B2B Volume Marketplace", desc: "Recycling factories bid on multi-ton volumes of plastics, metals, and e-waste aggregated directly from our agents.", icon: TrendingUp },
                  { title: "Agricultural Organic Trades", desc: "A dedicated marketplace pipeline for farms, factories, and agricultural fields to trade, monetize, and source organic waste and biofuels securely.", icon: Sprout },
                  { title: "HygeneX AI Intelligence", desc: "Our proprietary AI agent provides realtime market forecasting, anomaly detection, and material yield optimizations.", icon: Bot },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center"><item.icon className="w-5 h-5" /></div>
                    <div>
                      <h4 className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* 4. ADMIN APP */}
        <div className={`py-24 px-6 border-y ${isDarkMode ? 'border-white/5 bg-slate-900 hover:bg-slate-800/30' : 'border-slate-200 bg-white hover:bg-slate-50/80'} transition-colors`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-rose-500 font-bold mb-4 uppercase tracking-widest text-xs">Platform Four</div>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CleanFlow Security</h2>
              <p className="text-xl font-medium text-slate-400 italic mb-8">"Total systemic control, financial oversight, and compliance."</p>
              
              <ul className="space-y-6">
                {[
                  { title: "Master-Key Protection", desc: "Impenetrable environment-variable master keys replace SMS OTPs for hyper-secure internal system access.", icon: LockKeyhole },
                  { title: "Macro Financial Oversight", desc: "Track liquidity, agent bounties processed, marketplace transaction taxes, and overarching corporate growth from a single pane of glass.", icon: BarChart3 },
                  { title: "Compliance Verification", desc: "Manually audit and verify the NEMA (Environmental Authority) licenses of businesses before giving them access to the B2B marketplace.", icon: ShieldCheck },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center"><item.icon className="w-5 h-5" /></div>
                    <div>
                      <h4 className={`font-black text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-rose-500/20 to-orange-900/20 border border-rose-500/10 flex items-center justify-center p-12 relative overflow-hidden">
                <ShieldCheck className="w-48 h-48 text-rose-500 drop-shadow-2xl" />
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((portal, idx) => (
              <motion.a
                href={portal.link}
                target="_blank"
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`group p-8 rounded-3xl border transition-all duration-300 block ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xl shadow-slate-200/50 hover:shadow-2xl'}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                  <portal.icon className="w-7 h-7" />
                </div>
                <h3 className={`text-xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{portal.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">{portal.desc}</p>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500 group-hover:text-emerald-400 transition-colors">
                  Open Sub-App <ExternalLink className="w-3 h-3" />
                </div>
              </motion.a>
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
                <li><a href="#portals" className="hover:text-emerald-500 transition-colors">Client Edge</a></li>
                <li><a href="#portals" className="hover:text-emerald-500 transition-colors">Agent Field Ops</a></li>
                <li><a href="#portals" className="hover:text-emerald-500 transition-colors">Business Market</a></li>
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
    </div>
  );
}
