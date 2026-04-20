import { useState, useEffect } from 'react';
import { 
  Leaf, ShieldCheck, Zap, Globe, 
  Building2, User, Truck, 
  ChevronRight, ExternalLink, BarChart3, Bot,
  MessageSquare, Mail, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const portals = [
    {
      title: "CleanFlow Resident",
      description: "Manage household waste with a tap. Schedule pickups, track rewards, and reduce your carbon footprint effortlessly.",
      icon: User,
      color: "from-emerald-500 to-teal-600",
      link: "https://cleanflow-client.vercel.app",
      features: ["Smart Scheduling", "Reward Tokens", "Impact Analytics"]
    },
    {
      title: "CleanFlow Agent",
      description: "The professional hub for waste collectors. Optimize logistics, earn bounties, and streamline your operations.",
      icon: Truck,
      color: "from-blue-500 to-indigo-600",
      link: "https://cleanflow-agent.vercel.app",
      features: ["Live Job Board", "Route Optimization", "Digital Bounty System"]
    },
    {
      title: "CleanFlow Business",
      description: "Industrial-grade recycling marketplace. Bulk trading, AI market intelligence, and verified compliance for companies.",
      icon: Building2,
      color: "from-indigo-500 to-purple-600",
      link: "https://cleanflow-business.vercel.app",
      features: ["B2B Marketplace", "AI Market Advisor", "Verification Center"]
    }
  ];

  const featuresList = [
    { title: "HygeneX AI Intelligence", desc: "Real-time market insights and material forecasting.", icon: Bot },
    { title: "Verified Industrial Hub", desc: "Digital verification for NEMA licenses and compliance.", icon: ShieldCheck },
    { title: "Circular Economy Engine", desc: "Closing the loop through data-driven logistics.", icon: Globe },
    { title: "Smart Asset Tracking", desc: "Live monitoring of waste volume and diversion rates.", icon: BarChart3 }
  ];

  return (
    <div className="bg-slate-900 overflow-hidden min-h-screen text-slate-100 selection:bg-emerald-500/30">
      
      {/* ── NAVBAR ────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-slate-900/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">CleanFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <a href="#hub" className="hover:text-white transition-colors">Portals</a>
            <a href="#ai" className="hover:text-white transition-colors">Intelligence</a>
            <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-emerald-500/10">Launch App</button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
          >
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Revolutionizing Waste Management</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-8xl font-black tracking-tight text-white mb-8"
          >
            Scaling the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Circular Economy</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed mb-12"
          >
            CleanFlow integrates AI intelligence, industrial compliance, and streamlined logistics to turn waste into value. The smarter way to manage our world.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="#hub" className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 text-center">
              Explore Our Portals
            </a>
            <a href="#ai" className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/5 text-center flex items-center justify-center gap-3">
              How it Works <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── HUB SECTION ─────────────────────────────────────────── */}
      <section id="hub" className="py-24 px-6 relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 italic tracking-tighter">Choose Your Portal</h2>
          <p className="text-slate-500 font-medium tracking-wide italic">Designed for every stakeholder in the recycling lifecycle.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {portals.map((portal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all duration-500"
            >
              <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${portal.color} flex items-center justify-center text-white mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                <portal.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">{portal.title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-8">{portal.description}</p>
              <ul className="space-y-4 mb-10">
                {portal.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {feat}
                  </li>
                ))}
              </ul>
              <a href={portal.link} target="_blank" className="inline-flex items-center gap-3 text-sm font-black text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">
                Enter Portal <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI IMPACT ─────────────────────────────────────────── */}
      <section id="ai" className="py-24 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter italic">AI-Driven Impact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featuresList.map((feat, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-white/5 group hover:border-emerald-500/30 transition-colors">
                  <feat.icon className="w-6 h-6 text-emerald-500 mb-4" />
                  <h4 className="text-white font-black mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-white/5 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <Bot className="w-40 h-40 text-emerald-500/50" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-20 px-6 border-t border-white/5 relative bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-6">
                <Leaf className="w-8 h-8 text-emerald-500" />
                <span className="text-2xl font-black text-white italic tracking-tighter">CleanFlow</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs italic">Scaling the circular economy through technology and logistical excellence.</p>
            </div>
            
            <div>
              <h5 className="text-sm font-black text-white uppercase tracking-widest mb-6">Platforms</h5>
              <ul className="space-y-4 text-sm font-bold text-slate-500 italic">
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Residential Portal</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Agent Console</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Business Hub</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-black text-white uppercase tracking-widest mb-6">Social Ecosystem</h5>
              <div className="flex items-center gap-6">
                <Globe className="w-6 h-6 text-slate-400 hover:text-emerald-500 cursor-pointer" />
                <Mail className="w-6 h-6 text-slate-400 hover:text-emerald-500 cursor-pointer" />
                <MessageSquare className="w-6 h-6 text-slate-400 hover:text-emerald-500 cursor-pointer" />
              </div>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-center border-t border-white/5 pt-12 italic">© 2026 CleanFlow Logistics. Optimized for Circularity.</p>
        </div>
      </footer>
    </div>
  );
}
