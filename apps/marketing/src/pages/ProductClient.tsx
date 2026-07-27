import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Wallet,
  Truck,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  Handshake,
  Layout as LayoutIcon,
  BarChart3,
  Brain,
  Leaf,
  LineChart,
  ShieldCheck,
  Users,
  Smartphone,
  Network,
  Activity,
  Globe,
  ChevronRight,
  PlayCircle,
  Pause,
  Play,
  Zap,
  DollarSign,
  TrendingUp,
  EyeOff,
  SearchX,
  Weight,
  RouteOff,
  ClockAlert,
  ShieldAlert,
  Minimize2,
} from "lucide-react";
import { useThemeStore } from "@klinflow/core/stores/themeStore";
import Layout from "../layouts/Layout";

type ProblemSolutionPairData = {
  id: string;
  number: string;
  problem: {
    title: string;
    desc: string;
    icon: React.ElementType;
  };
  solution: {
    label: string;
    desc: string;
    icon: React.ElementType;
  };
};

const problemSolutionPairs: ProblemSolutionPairData[] = [
  {
    id: "opaque-pricing",
    number: "01",
    problem: {
      title: "Opaque Pricing",
      desc: "Most households and independent sellers have little visibility into current market rates. Pricing is often dictated by middlemen, leading to inconsistent valuations and reduced earnings.",
      icon: EyeOff,
    },
    solution: {
      label: "Live Market Intelligence",
      desc: "Access real-time prices across multiple recyclable categories, historical market trends, and intelligent valuation tools to make informed selling decisions.",
      icon: TrendingUp,
    },
  },

  {
    id: "limited-access",
    number: "02",
    problem: {
      title: "Limited Market Access",
      desc: "Finding reliable buyers can be difficult and time-consuming. Many sellers depend on informal networks that limit competition and pricing opportunities.",
      icon: SearchX,
    },
    solution: {
      label: "Verified Buyer Network",
      desc: "Connect directly with verified recyclers, aggregators, and industrial off-takers through a trusted digital marketplace.",
      icon: Users,
    },
  },

  {
    id: "small-volumes",
    number: "03",
    problem: {
      title: "Small Volumes Earn Less",
      desc: "Many recyclers only accept large quantities, leaving households and small-scale collectors unable to access premium pricing tiers.",
      icon: Minimize2,
    },
    solution: {
      label: "Community Swarms",
      desc: "Pool recyclable materials with nearby users to meet industrial minimums, unlock better rates, and maximize collective earnings.",
      icon: Handshake,
    },
  },

  {
    id: "inefficient-collections",
    number: "04",
    problem: {
      title: "Inefficient Collections",
      desc: "Collection processes are fragmented, difficult to coordinate, and often lack visibility into pickup schedules or agent activity.",
      icon: RouteOff,
    },
    solution: {
      label: "Smart Logistics",
      desc: "Schedule pickups, track agents in real time, and benefit from optimized collection routes that reduce delays and improve reliability.",
      icon: Truck,
    },
  },

  {
    id: "delayed-payments",
    number: "05",
    problem: {
      title: "Delayed Payments",
      desc: "Cash-based transactions create uncertainty, disputes, and delays, leaving sellers waiting to receive compensation.",
      icon: ClockAlert,
    },
    solution: {
      label: "Instant Digital Payouts",
      desc: "Receive secure payments directly into your Klinflow Wallet immediately after materials are verified and processed.",
      icon: Zap,
    },
  },

  {
    id: "lack-of-trust",
    number: "06",
    problem: {
      title: "Lack of Trust",
      desc: "Disagreements around weight, material grading, and final payouts create friction across the recycling value chain.",
      icon: ShieldAlert,
    },
    solution: {
      label: "End-to-End Transparency",
      desc: "Every transaction is digitally verified with collection records, weight confirmations, receipts, and a complete audit trail.",
      icon: ShieldCheck,
    },
  },
];

function ArrowConnector({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center w-20 flex-shrink-0 relative" aria-hidden="true">
      <svg width="80" height="24" viewBox="0 0 80 24" fill="none" className="overflow-visible">
        <motion.path
          d="M 0 12 Q 20 4 40 12 Q 60 20 80 12"
          stroke={isDarkMode ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.4)"}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.circle
          r="3"
          fill={isDarkMode ? "#34d399" : "#10b981"}
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ offsetPath: "path('M 0 12 Q 20 4 40 12 Q 60 20 80 12')" }}
        />
        <motion.circle
          r="2"
          fill={isDarkMode ? "#34d399" : "#10b981"}
          opacity={0.5}
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.7 }}
          style={{ offsetPath: "path('M 0 12 Q 20 4 40 12 Q 60 20 80 12')" }}
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
        className={`absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-b-[5px] border-l-[7px] border-t-transparent border-b-transparent ${isDarkMode ? "border-l-emerald-400/60" : "border-l-emerald-500/60"}`}
      />
    </div>
  );
}

function ProblemSolutionPair({
  pair,
  index,
  isDarkMode,
}: {
  pair: ProblemSolutionPairData;
  index: number;
  isDarkMode: boolean;
}) {
  const ProblemIcon = pair.problem.icon;
  const SolutionIcon = pair.solution.icon;

  return (
    <motion.article
      role="listitem"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex flex-col lg:flex-row items-stretch gap-0 lg:gap-0"
    >
      {/* Desktop: Pair Number left of row */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08 + 0.1, type: "spring", stiffness: 180 }}
        className={`hidden lg:flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-xl self-center mr-3 text-sm font-black tracking-tight ${isDarkMode ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800/50" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}
      >
        {pair.number}
      </motion.div>

      {/* Problem Card */}
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className={`flex-1 min-w-0 p-5 sm:p-6 rounded-2xl border transition-shadow duration-300 hover:shadow-lg group
          ${isDarkMode ? "bg-rose-950/20 border-rose-800/30 hover:shadow-rose-900/20" : "bg-rose-50/80 border-rose-100 hover:shadow-rose-200/50"}`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${isDarkMode ? "bg-rose-900/40 text-rose-400" : "bg-rose-100 text-rose-600"}`}>
            <ProblemIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className={`text-sm sm:text-base font-bold mb-1 leading-tight ${isDarkMode ? "text-rose-200" : "text-rose-900"}`}>{pair.problem.title}</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? "text-rose-300/70" : "text-rose-700/70"}`}>{pair.problem.desc}</p>
          </div>
        </div>
      </motion.div>

      {/* Mobile: Pair number + vertical connector between cards */}
      <div className="flex lg:hidden items-center gap-3 py-2.5 px-1">
        <span className={`text-[10px] font-black tracking-widest ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>{pair.number}</span>
        <div className={`flex-1 h-px ${isDarkMode ? "bg-emerald-800/40" : "bg-emerald-200"}`} />
        <ChevronRight className={`w-3.5 h-3.5 -rotate-90 ${isDarkMode ? "text-emerald-500" : "text-emerald-600"}`} />
      </div>

      {/* Desktop: Arrow connector between cards */}
      <ArrowConnector isDarkMode={isDarkMode} />

      {/* Solution Card */}
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className={`flex-1 min-w-0 p-5 sm:p-6 rounded-2xl border transition-shadow duration-300 hover:shadow-lg group
          ${isDarkMode ? "bg-emerald-950/20 border-emerald-800/30 hover:shadow-emerald-900/20" : "bg-emerald-50/80 border-emerald-100 hover:shadow-emerald-200/50"}`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${isDarkMode ? "bg-emerald-900/40 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}>
            <SolutionIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className={`text-sm sm:text-base font-bold mb-1 leading-tight ${isDarkMode ? "text-emerald-200" : "text-emerald-900"}`}>{pair.solution.label}</h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? "text-emerald-300/70" : "text-emerald-700/70"}`}>{pair.solution.desc}</p>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function ProductClient() {
  const { isDarkMode } = useThemeStore();
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeIssue, setActiveIssue] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  const sliderImages = [
    "/products/client/resident-home.webp",
    "/products/client/seller-home.webp",
    "/products/client/market-price.webp",
    "/products/client/book-pickup.webp",
    "/products/client/impact-analysis.webp",
    "/products/client/collective-hub.webp"
  ];

  const deepDiveFeatures = [
    {
      subtitle: "Market Intelligence",
      subtitleColor: "text-primary",
      title: "Never guess the value of waste again.",
      description: "Access live market prices for different material grades. Whether you have a few kilos of PET bottles or tons of industrial copper, Klinflow provides real-time tickers and trends so you sell at the optimal time. Our platform tracks over 50 material categories and automatically alerts you when market conditions are optimal to lock in the highest profit margins.",
      features: ['Live Price Tickers', 'Historical Trend Graphs', 'Automated AI Valuation Estimates'],
      featureColor: "text-primary",
      bgFeatureColor: "bg-primary/20",
      image: "/products/client/market-price.webp",
      icon: LineChart
    },
    {
      subtitle: "B2B Trading & RFQs",
      subtitleColor: "text-blue-500",
      title: "Direct access to industrial buyers.",
      description: "Create listings, receive competitive bids, and track Request for Quotation (RFQ) proposals. We connect bulk sellers directly to verified recyclers and industrial off-takers, bypassing traditional middlemen. Upload cryptographic proof of quality, negotiate minimum viable volumes, and finalize legally-binding escrow smart contracts instantly.",
      features: ['Direct Listing Creation', 'Real-time Bid Management', 'RFQ Proposal Tracking'],
      featureColor: "text-blue-500",
      bgFeatureColor: "bg-blue-500/20",
      image: "/products/client/RFQ.webp",
      icon: Handshake
    },
    {
      subtitle: "Frictionless Logistics",
      subtitleColor: "text-purple-500",
      title: "Verified pickups, right at your doorstep.",
      description: "Post a collection request and let the network come to you. Verified Klinflow Agents handle the weighing and grading on-site using cryptographic verification, ensuring absolute transparency. Track the entire journey via GPS, view the agent's historical ratings, and manage bulk collections without breaking a sweat.",
      features: ['Geo-fenced Agent Tracking', 'On-site Digital Weighing Integration', 'Secure QR Handshake'],
      featureColor: "text-purple-500",
      bgFeatureColor: "bg-purple-500/20",
      image: "/products/client/book-pickup.webp",
      icon: Truck
    },
    {
      subtitle: "FinTech Integration",
      subtitleColor: "text-emerald-500",
      title: "Instant payouts. Zero delays.",
      description: "The moment an Agent verifies your materials, funds are instantly released into your Klinflow Wallet. Withdraw directly to M-Pesa or your bank account in seconds. Monitor detailed transaction ledgers, automate tax reporting, and leverage micro-loans backed by your consistent trading volume.",
      features: ['In-app Digital Wallet', 'Instant M-Pesa Integration', 'Detailed Transaction Ledgers'],
      featureColor: "text-emerald-500",
      bgFeatureColor: "bg-emerald-500/20",
      image: "/products/client/client-wallet.webp",
      icon: Wallet
    },
    {
      subtitle: "AI Analysis",
      subtitleColor: "text-blue-500",
      title: "Smart material recognition.",
      description: "Instantly analyze materials using advanced AI to determine their value and recycling potential. Snap a picture and get real-time insights.",
      features: ['Real-time Image Analysis', 'Material Classification', 'Value Estimation'],
      featureColor: "text-blue-500",
      bgFeatureColor: "bg-blue-500/20",
      image: "/products/client/ai-analysis.webp",
      icon: Brain
    },
    {
      subtitle: "Impact Analysis",
      subtitleColor: "text-emerald-500",
      title: "Track your environmental footprint.",
      description: "Visualize your positive impact on the environment. Track carbon offset, materials saved from landfills, and your overall contribution to a greener planet.",
      features: ['Carbon Offset Tracking', 'Waste Reduction Metrics', 'Personalized Impact Reports'],
      featureColor: "text-emerald-500",
      bgFeatureColor: "bg-emerald-500/20",
      image: "/products/client/impact-analysis.webp",
      icon: Leaf
    },
    {
      subtitle: "Smart Contracts",
      subtitleColor: "text-amber-500",
      title: "Secure and transparent agreements.",
      description: "Leverage blockchain-powered smart contracts to ensure secure, transparent, and immutable agreements with verified buyers and aggregators.",
      features: ['Immutable Records', 'Automated Execution', 'Dispute Resolution'],
      featureColor: "text-amber-500",
      bgFeatureColor: "bg-amber-500/20",
      image: "/products/client/contracts.webp",
      icon: ShieldCheck
    },
     {
      subtitle: "Collaborative Growth",
      subtitleColor: "text-amber-500",
      title: "Pool resources. Maximize profits.",
      description: "Join \"Swarms\" with other local sellers to aggregate small quantities into bulk industrial orders, unlocking premium tier pricing from top-tier recyclers. Communicate via encrypted channels, vote on acceptable RFQs, and watch payouts distribute perfectly pro-rata according to each member's exact contribution weight.",
      features: ['Swarm Creation & Discovery', 'Group Chat & Negotiation', 'Pro-rata Payout Distribution'],
      featureColor: "text-amber-500",
      bgFeatureColor: "bg-amber-500/20",
      image: "/products/client/collective-hub.webp",
      icon: Users
    }
  ];

  return (
    <Layout>
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-40 md:pb-32 min-h-[100vh] flex items-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-primary"
          />
          <div
            className="absolute inset-0 opacity-[0.15] text-white"
            style={{
              backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/8 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-16 relative z-10 w-full mt-4 lg:-mt-40">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left side: Text */}
            <div className="max-w-2xl">
              {/* Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 bg-white/10 backdrop-blur-md text-white border border-white/20">
                <div className="w-2 h-2 rounded-full bg-lime-400" />
                Multi Persona Application
              </div>
              
              {/* Heading */}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-white"
              >
                Recycling Made,<br />
                 Rewarding<br />
                <span className="text-lime-400">and Transparent.</span>
              </h1>
              
              {/* Subheading */}
              <p
                className="text-base md:text-lg font-medium leading-relaxed mb-10 max-w-xl text-emerald-50"
              >
               The Klinflow Client App empowers residents,small businesses, scrappers, and micro sellers to participate in the circular economy through a seamless digital experience. Schedule collections, access real-time market prices, connect with verified buyers, join community Group Pickups, track your environmental impact, and receive secure payouts—all from a single, intelligent platform designed to make recycling simple, transparent, and rewarding.
              </p>
              
              {/* Buttons */}
              <div className="flex flex-row flex-wrap gap-3 sm:gap-4">
                <Link to="/contact" className="flex-1 sm:flex-none px-4 py-3 sm:px-8 sm:py-4 bg-white text-primary hover:bg-slate-50 font-bold rounded-full active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap shadow-xl shadow-black/10">
                  Get Started <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <button
                  className="flex-1 sm:flex-none px-4 py-3 sm:px-8 sm:py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap bg-white/10 text-white hover:bg-white/20 border border-white/20"
                >
                  Watch Demo <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
              </div>
            </div>

            {/* Right side: Static Images Side by Side */}
            <div className="relative flex justify-center lg:justify-end mt-16 lg:mt-0 perspective-[1000px] h-[500px] sm:h-[600px] md:h-[700px] items-center">
              {/* Image 1 (Left/Back) */}
              <motion.div
                initial={{ opacity: 0, x: isMobile ? -15 : -30, rotate: 0, y: 0 }}
                animate={{ opacity: 1, x: isMobile ? "-25%" : "-45%", rotate: 0, y: isMobile ? -15 : -30 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3, delay: 0.2 }}
                className="absolute w-[220px] sm:w-[260px] md:w-[320px] aspect-[1/2] rounded-[2rem] overflow-hidden border shadow-2xl z-10 border-white/20 bg-black/20 backdrop-blur-md"
              >
                 <img src={sliderImages[2]} alt="Client App Home" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/5" />
              </motion.div>

              {/* Image 2 (Right/Front) */}
              <motion.div
                initial={{ opacity: 0, x: isMobile ? 15 : 30, rotate: 0, y: 20 }}
                animate={{ opacity: 1, x: isMobile ? "25%" : "45%", rotate: 0, y: isMobile ? 15 : 30 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3, delay: 0.4 }}
                className="absolute w-[220px] sm:w-[260px] md:w-[320px] aspect-[1/2] rounded-[2rem] overflow-hidden border z-20 border-white/20 bg-black/20 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                 <img src={sliderImages[1]} alt="Client App Seller" className="w-full h-full object-cover" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>


  {/* 3. WHY KLINFLOW EXISTS */}

<section
  className={`py-10 md:py-24 px-6 relative overflow-hidden ${
    isDarkMode ? "bg-surface-900" : "bg-slate-50"
  }`}
>
  {/* Background Grid */}
  <div
    className={`absolute inset-0 ${
      isDarkMode ? "opacity-[0.04]" : "opacity-[0.03]"
    }`}
    style={{
      backgroundImage:
        "radial-gradient(circle, currentColor 1px, transparent 1px)",
      backgroundSize: "32px 32px",
    }}
  />

{/* Glow Effects */}



  <div className="max-w-7xl mx-auto relative z-10">
    {/* Header */}
    <div className="max-w-3xl mx-auto mb-16 md:mb-20 text-center">
      <div className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
        Why Klinflow Exists
      </div>

  <h2
    className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-6 ${
      isDarkMode ? "text-white" : "text-slate-900"
    }`}
  >
    Built to solve the biggest inefficiencies in the recycling value chain.
  </h2>

  <p
    className={`text-base md:text-lg leading-relaxed max-w-2xl mx-auto ${
      isDarkMode ? "text-slate-400" : "text-slate-600"
    }`}
  >
    Traditional recycling systems are fragmented, opaque, and difficult
    to scale. Klinflow replaces manual processes with a connected digital
    ecosystem that makes recycling more transparent, efficient, and
    rewarding for residents and sellers.
  </p>
</div>

{/* Problem / Solution Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
  {problemSolutionPairs.map((item) => {
    const ProblemIcon = item.problem.icon;
    const SolutionIcon = item.solution.icon;
    const isFlipped = activeIssue === item.id;
    return (
      <div
        key={item.id}
        onClick={() => setActiveIssue(isFlipped ? null : item.id)}
        className={`group cursor-pointer relative overflow-hidden p-6 lg:p-8 rounded-3xl border transition-all duration-500 flex flex-col min-h-[300px] ${isDarkMode ? "bg-surface-900/50 border-slate-700 hover:border-primary" : "bg-white border-slate-200 hover:border-primary hover:shadow-xl shadow-primary/10"}`}
      >
        {/* PROBLEM LAYER (Default View) */}
        <div className={`relative z-10 flex flex-col h-full transition-transform duration-500 ${isFlipped ? "-translate-y-8 opacity-0 pointer-events-none" : "lg:group-hover:-translate-y-8 lg:group-hover:opacity-0"}`}>
          <div className="flex items-center justify-between mb-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-rose-500/10 text-rose-400" : "bg-rose-100 text-rose-600"}`}>
              <ProblemIcon className="w-6 h-6" />
            </div>
            <div className={`text-xs font-black tracking-widest ${isDarkMode ? "text-slate-600" : "text-slate-300"}`}>
              {item.number}
            </div>
          </div>
          <h4 className={`text-lg font-bold mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{item.problem.title}</h4>
          <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{item.problem.desc}</p>
          
          <div className={`mt-auto pt-6 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider transition-opacity ${isFlipped ? "opacity-100" : "opacity-60 lg:group-hover:opacity-100"}`}>
            <span>Click for Solution</span> <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* SOLUTION LAYER (Slide Up on Hover/Click) */}
        <div className={`absolute inset-0 p-6 lg:p-8 flex flex-col h-full transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-20 ${isFlipped ? "translate-y-0" : "translate-y-[110%] lg:group-hover:translate-y-0"} ${isDarkMode ? "bg-emerald-950/95 backdrop-blur-md" : "bg-emerald-50/95 backdrop-blur-md"}`}>
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center mb-5 shadow-lg shadow-primary/30 shrink-0">
            <SolutionIcon className="w-6 h-6" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 shrink-0">The Solution</div>
          <h4 className={`text-lg font-bold mb-3 shrink-0 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{item.solution.label}</h4>
          <p className={`text-sm leading-relaxed overflow-y-auto ${isDarkMode ? "text-emerald-100/70" : "text-emerald-900/70"}`}>{item.solution.desc}</p>
        </div>
      </div>
    );
  })}
</div>


  </div>
</section>


      {/* 4. UNIFIED PLATFORM FEATURES (INTERACTIVE SIDEBAR) */}
      <section className="py-20 md:py-24 px-6 overflow-hidden relative bg-gradient-to-br from-emerald-700 to-primary">
        {/* LINE GRID background */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              Everything you need to thrive.
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-emerald-50">
              Explore the powerful features built into the Klinflow Client App.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Left Sidebar (Tabs) */}
            <div className="w-full lg:w-1/3 flex flex-col gap-2">
              {deepDiveFeatures.map((item, i) => {
                const isActive = activeFeature === i;
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveFeature(i)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left border ${
                      isActive 
                        ? "bg-primary border-white/20 shadow-lg" 
                        : "bg-transparent border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? "bg-white text-primary shadow-md" : "bg-white/10 text-emerald-100"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-emerald-100" : "text-emerald-200/60"}`}>
                        {item.subtitle}
                      </span>
                      <span className={`font-semibold ${isActive ? "text-white" : "text-emerald-100/70"}`}>
                        {item.title.split('.')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Main Stage */}
            <div className="w-full lg:w-2/3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="p-8 lg:p-12 rounded-[2.5rem] border shadow-2xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16 bg-primary border-white/20 "
                >
                  {/* Stage Text */}
                  <div className="flex-1">
                    <div className="text-emerald-300 font-bold tracking-widest text-sm uppercase mb-3">
                      {deepDiveFeatures[activeFeature].subtitle}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight text-white">
                      {deepDiveFeatures[activeFeature].title}
                    </h2>
                    <p className="text-base mb-8 leading-relaxed text-emerald-50/90">
                      {deepDiveFeatures[activeFeature].description}
                    </p>
                    <ul className="space-y-4">
                      {deepDiveFeatures[activeFeature].features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-emerald-50">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stage Image */}
                  <div className="w-[220px] sm:w-[280px] md:w-[300px] shrink-0 perspective-[1000px]">
                    <motion.div 
                      initial={{ rotateY: 15 }}
                      animate={{ rotateY: 0 }}
                      className="rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl bg-white/5"
                    >
                      <img 
                        src={deepDiveFeatures[activeFeature].image} 
                        alt={deepDiveFeatures[activeFeature].subtitle} 
                        className="w-full h-auto object-cover" 
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* COMBINED: HOW IT WORKS + ECOSYSTEM */}
      <section className={`py-24 px-6 relative overflow-hidden ${isDarkMode ? "bg-surface-900" : "bg-slate-50"}`}>
        {/* Dot grid background */}
        <div
          className={`absolute inset-0 ${isDarkMode ? "opacity-[0.06]" : "opacity-[0.04]"}`}
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="uppercase tracking-[0.3em] text-primary text-xs font-bold mb-3 block">Platform Overview</span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              How It Works & Who's Connected
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              A simple 4-step pipeline powered by an ecosystem of connected apps.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* LEFT — How It Works: Circular orbit */}
            <div className="lg:col-span-5 relative w-full aspect-square max-w-[450px] mx-auto lg:mr-auto">
              {/* Center label */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full flex flex-col items-center justify-center z-20 shadow-xl border-2 border-primary/30 ${isDarkMode ? "bg-surface-950" : "bg-white"}`}>
                <span className="text-primary text-2xl font-black">4</span>
                <span className={`text-xs font-bold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Steps</span>
              </div>

              {/* Orbit ring */}
              <div className={`absolute inset-[20%] rounded-full border-2 border-dashed ${isDarkMode ? "border-white/40" : "border-slate-200"}`} />

              {/* Static nodes with animated connector lines */}
              <div className="absolute inset-0">
                {[
                  { step: "01", title: "Post Request", desc: "List materials or schedule pickup.", icon: Smartphone, color: "text-blue-500", angle: -45 },
                  { step: "02", title: "Agent Matches", desc: "Nearest verified agent dispatched.", icon: Truck, color: "text-purple-500", angle: 45 },
                  { step: "03", title: "Verify & Weigh", desc: "Cryptographic QR verification.", icon: ShieldCheck, color: "text-amber-500", angle: 135 },
                  { step: "04", title: "Get Paid", desc: "Instant wallet payout.", icon: Wallet, color: "text-emerald-500", angle: -135 },
                ].map((s, i) => {
                  const rad = (s.angle * Math.PI) / 180;
                  const ORBIT_RADIUS = 100; // radius in pixels for connector line
                  const radiusPct = 38; // percentage from center for node placement
                  const x = 50 + radiusPct * Math.cos(rad);
                  const y = 50 + radiusPct * Math.sin(rad);
                  return (
                    <div
                      key={i}
                      className="absolute"
                      style={{ top: `${y}%`, left: `${x}%`, transform: "translate(-50%, -50%)" }}
                    >
                      {/* CENTER CONNECTOR */}
                      <div
                        className={`absolute left-1/2 top-1/2 origin-left z-0 overflow-hidden ${
                          isDarkMode ? "bg-white/10" : "bg-slate-200"
                        }`}
                        style={{
                          width: `${ORBIT_RADIUS}px`,
                          height: "2px",
                          transform: `
                            rotate(${s.angle + 180}deg)
                            translateX(0px)
                          `,
                        }}
                      >
                        {[0, 1].map((j) => (
                          <motion.div
                            key={j}
                            className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${s.color.replace('text-', 'bg-')} shadow-[0_0_8px_2px_currentColor]`}
                            initial={{ left: "0%", opacity: 0 }}
                            animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                              delay: j * 1,
                            }}
                          />
                        ))}
                      </div>

                      {/* NODE */}
                      <div className={`relative z-10 w-28 md:w-32 p-3 rounded-2xl text-center shadow-lg border ${isDarkMode ? "bg-surface-950 border-white/10" : "bg-white border-slate-200"} hover:scale-105 transition-transform`}>
                        <div className={`w-10 h-10 mx-auto rounded-xl bg-primary/10 ${s.color} flex items-center justify-center mb-2`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        <div className="text-[10px] font-bold text-primary tracking-widest mb-0.5">{s.step}</div>
                        <h4 className={`text-xs font-bold mb-0.5 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{s.title}</h4>
                        <p className={`text-[10px] leading-tight ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — Ecosystem: 2×2 square */}
            <div className="lg:col-span-7">
              <div className="mb-6">
                <span className="uppercase tracking-[0.3em] text-primary text-xs font-bold mb-2 block">Connected Ecosystem</span>
                <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  Part of a Massive Network
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  {
                    icon: Truck,
                    title: "Agent App",
                    desc: "Verified agents handle your pickups, weigh materials on-site with calibrated digital scales, and complete cryptographic handshakes to lock in your transaction.",
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/20"
                  },
                  {
                    icon: LayoutIcon,
                    title: "Hub App",
                    desc: "Local recycling hubs aggregate materials from multiple agents, grade and sort inventory, and prepare bulk industrial-grade shipments for off-takers.",
                    color: "text-purple-500",
                    bg: "bg-purple-500/10",
                    border: "border-purple-500/20"
                  },
                  {
                    icon: Globe,
                    title: "Fleet App",
                    desc: "Fleet operators manage vehicle dispatch, optimise collection routes, and track real-time capacity across their entire logistics network.",
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/20"
                  },
                  {
                    icon: Activity,
                    title: "Admin Dashboard",
                    desc: "Platform administrators monitor system health, verify agents, manage compliance, and oversee the financial settlement layer in real time.",
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/20"
                  },
                ].map((node, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                    className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border ${isDarkMode ? `bg-surface-950 ${node.border}` : `bg-white ${node.border}`} shadow-sm transition-all group relative overflow-hidden`}
                  >
                    <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${node.bg} blur-3xl opacity-0 group-hover:opacity-60 transition-opacity`} />
                    <div className="relative z-10">
                      <div className={`w-8 h-8 sm:w-11 h-11 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${node.bg} ${node.color} group-hover:scale-110 transition-transform`}>
                        <node.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h4 className={`text-sm sm:text-base font-bold mb-1.5 sm:mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{node.title}</h4>
                      <p className={`text-[10px] sm:text-xs leading-relaxed line-clamp-4 sm:line-clamp-none ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{node.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FINAL CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Ready to turn waste into wealth?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of residents and sellers leveraging the Klinflow platform today.
          </p>
          <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link  to="/contact" className="flex-1 sm:flex-none sm:w-auto px-6 py-4 sm:px-10 sm:py-5 bg-white text-primary font-bold rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap">
              Contact Sales <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
