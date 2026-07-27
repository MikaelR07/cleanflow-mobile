import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Activity,
  Layers,
  Zap,
  MapPin,
  Store,
  Receipt,
  Settings,
  Truck,
  Globe,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  LineChart,
  Server,
  Wallet
} from "lucide-react";
import { useThemeStore } from "@klinflow/core/stores/themeStore";
import Layout from "../layouts/Layout";

// Static Feature List Component
function FeatureList({ details, color, isHighlighted }: { details: any[], color: string, isHighlighted?: boolean }) {
  const { isDarkMode } = useThemeStore();
  const effectivelyDark = isDarkMode || isHighlighted;

  return (
    <div className={`space-y-4 pt-2 border-t ${effectivelyDark ? 'border-white/10' : 'border-slate-200'}`}>
      {details.map((item, i) => {
        const activeBg = 'bg-primary shadow-sm shadow-primary/20';
        const activeBorder = 'border-white/20';
        
        return (
          <div 
            key={i} 
            className={`border rounded-xl p-4 overflow-hidden ${activeBg} ${activeBorder}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center shrink-0 bg-white/20 text-white`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className={`text-sm font-semibold mb-1 text-white`}>
                  {item.title}
                </p>
                <p className={`text-sm leading-relaxed text-emerald-50/90`}>
                  {item.text}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProductFleet() {
  const { isDarkMode } = useThemeStore();

  const features = [
    {
      id: "dashboard",
      title: "Fleet Operations Command Center",
      subtitle: "Real-Time Visibility Across Your Entire Fleet",
      desc: "Monitor every active agent, collection route, completed pickup, and payout from one centralized dashboard. Klinflow gives fleet owners live operational visibility to improve efficiency, reduce delays, and scale with confidence.",
      image: "/products/fleet-manager/manager-dashboard.webp",
      icon: Activity,
      color: "white",
      details: [
        { title: "Live fleet activity monitoring", text: "Track the exact GPS location and online status of every driver in your network in real-time, allowing for instant deployment decisions." },
        { title: "Pickup volume and route analytics", text: "Visualize daily collection metrics, pinpoint hotspots of high-volume areas, and review route efficiency across all your active territories." },
        { title: "Revenue and payout oversight", text: "Monitor cumulative financial distributions between your company, your drivers, and the platform through an automated, transparent ledger." }
      ]
    },
    {
      id: "management",
      title: "Workforce & Agent Management",
      subtitle: "Build and Manage High-Performing Collection Teams",
      desc: "Recruit, onboard, and manage collection agents at scale. Assign territories, monitor performance, and identify top-performing agents to ensure every team member contributes to fleet productivity and profitability.",
      image: "/products/fleet-manager/fleet-management.webp",
      icon: Users,
      color: "white",
      details: [
        { title: "Fast agent onboarding", text: "Generate secure, shareable invite codes that allow new drivers to join your roster instantly with automated background verification." },
        { title: "Territory and roster management", text: "Assign agents to specific collection zones and manage online/offline states centrally to balance your workforce." },
        { title: "Individual productivity tracking", text: "Dive deep into agent-level metrics including total KG collected, daily earnings, and overall community ratings." }
      ]
    },
    {
      id: "marketplace",
      title: "Industrial Marketplace Access",
      subtitle: "Secure High-Value Material Opportunities",
      desc: "Gain direct access to Klinflow’s industrial marketplace and connect with large-scale material buyers and suppliers. Source recyclable materials, unlock new business opportunities, and deploy your fleet where demand is highest.",
      image: "/products/fleet-manager/marketplace-view.webp",
      icon: Store,
      color: "white",
      details: [
        { title: "Direct buyer and supplier access", text: "Bypass the middleman and negotiate contracts directly with industrial manufacturers and large-scale aggregators." },
        { title: "Bulk material sourcing opportunities", text: "View live listings of bulk recyclable materials available in your region with transparent, upfront pricing." },
        { title: "Demand-driven fleet deployment", text: "Route your agents strategically based on where material listings and demand density are highest in the marketplace." }
      ]
    },
    {
      id: "rfq",
      title: "Corporate RFQ Management",
      subtitle: "Win and Execute Large Collection Contracts",
      desc: "Manage incoming corporate requests for quotation (RFQs) through a centralized pipeline. Submit competitive bids, secure high-volume contracts, and assign jobs to the right agents faster and more efficiently.",
      image: "/products/fleet-manager/RFQs.webp",
      icon: Receipt,
      color: "white",
      details: [
        { title: "Centralized RFQ pipeline", text: "Review all pending, active, and completed corporate quotation requests in a single, organized kanban-style pipeline." },
        { title: "Faster bid submissions", text: "Submit professional bids instantly with pre-configured fleet capabilities, material handling capacities, and custom pricing margins." },
        { title: "Contract allocation tools", text: "Once a contract is won, instantly broadcast the job to your most capable agents via targeted dispatch routing." }
      ]
    },
    {
      id: "pricing",
      title: "Dynamic Pricing & Margin Control",
      subtitle: "Protect Profitability in Every Market",
      desc: "Configure pricing rules based on material type, vehicle capacity, location, and market demand. Maintain healthy margins while staying competitive across different collection environments.",
      image: "/products/fleet-manager/pricing-config.webp",
      icon: Settings,
      color: "white",
      details: [
        { title: "Material-based pricing rules", text: "Set custom price-per-kg thresholds for different types of recyclables based on current market valuations." },
        { title: "Vehicle-specific fee structures", text: "Establish minimum base fees depending on whether an agent uses a motorbike, pickup truck, or heavy lorry." },
        { title: "Margin optimization controls", text: "Adjust your corporate commission split dynamically to retain talent while protecting your bottom line." }
      ]
    }
  ];

  return (
    <Layout>
      {/* ── HIGH-END HERO SECTION (SPLIT LAYOUT) ─────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden min-h-[100vh] flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-indigo-900" />
          {/* Dotted Pattern */}
          <div
            className="absolute inset-0 opacity-[0.15] text-white"
            style={{
              backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Glows */}
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-500/20 blur-[150px] rounded-full pointer-events-none" />
        </div>

        <div className="max-w-[90rem] mx-auto px-6 relative z-10 w-full mt-[-2rem] md:mt-[-4rem]">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Copy & CTA */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-mono text-[10px] uppercase tracking-[0.2em] mb-8 w-fit backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Grade
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold tracking-tighter mb-8 text-white leading-[1.05]">
                The Management Tool for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Recycling Fleets.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-2xl text-slate-300">
                Transform your collection operations with a centralized platform that combines fleet intelligence, dispatch automation, financial transparency, and contract-driven growth opportunities. Empower your operations team with the tools they need to scale efficiently.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Image Showcase */}
            <div className="lg:col-span-7 relative perspective-[2000px] z-20">
              <div className="relative transform rotate-y-[-10deg] rotate-x-[5deg] scale-105 md:scale-110 lg:scale-[1.2] hover:rotate-y-0 hover:rotate-x-0 hover:scale-[1.25] transition-all duration-700 ease-out mt-12 lg:mt-0 lg:ml-12 origin-center lg:origin-left">
               
                {/* The Dashboard Preview */}
                <div className="relative rounded-2xl overflow-hidden border shadow-2xl bg-slate-900 border-white/20 shadow-indigo-500/20">
                  <img
                    src="/products/fleet-manager/manager-dashboard.webp"
                    alt="Klinflow Enterprise Dashboard"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CORE MODULES (PROFESSIONAL ALTERNATING LAYOUT) ─────────────────────────────────────────── */}
      <div className={`${isDarkMode ? "bg-surface-950" : "bg-slate-50"}`}>
        <div className="pt-20 lg:pt-32 pb-10 max-w-[90rem] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-indigo-500 mb-4">Core Infrastructure</h2>
            <h3 className={`text-4xl md:text-5xl font-bold tracking-tighter mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Built for for the manager <br/> who wants to scale.
            </h3>
            <p className={`text-lg md:text-xl font-medium leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Klinflow replaces traditional fleet management and fragmented communication by providing recycling companies with a centralized operations platform for managing fleets, drivers, collections, and performance at scale. By bringing every aspect of field operations into one system, organizations gain greater visibility, faster execution, and stronger operational control.
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          {features.slice(1).map((feature, index) => {
            const isHighlighted = index === 1 || index === 3; // second and last (indices 1 and 3)
            const effectivelyDark = isDarkMode || isHighlighted;

            return (
              <section 
                key={feature.id} 
                className={`py-20 lg:py-4 ${
                  isHighlighted 
                    ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white" 
                    : ""
                }`}
              >
                <div className="max-w-[90rem] mx-auto px-6">
                  <div className={`grid lg:grid-cols-12 gap-12 lg:gap-12 items-center`}>
                    
                    {/* Text Content */}
                    <div className={`lg:col-span-5 xl:col-span-4 ${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
                      <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-2 border border-${feature.color}-500/20`}>
                        <feature.icon className={`w-5 h-5 text-${feature.color}-500`} />
                      </div>
                      
                      <h4 className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-3 ${isHighlighted ? "text-emerald-300" : `text-${feature.color}-500`}`}>
                        Module 0{index + 2} // {feature.title}
                      </h4>
                      
                      <h3 className={`text-3xl md:text-4xl font-bold tracking-tighter mb-6 leading-tight ${effectivelyDark ? "text-white" : "text-slate-900"}`}>
                        {feature.subtitle}
                      </h3>
                      
                      <p className={`text-lg leading-relaxed mb-8 ${isHighlighted ? "text-emerald-50" : (isDarkMode ? "text-slate-400" : "text-slate-600")}`}>
                        {feature.desc}
                      </p>

                      {/* Static Fact List */}
                      <FeatureList details={feature.details} color={feature.color} isHighlighted={isHighlighted} />
                    </div>

                    {/* Image Content */}
                    <div className={`lg:col-span-7 xl:col-span-8 ${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
                      <div className={`relative transform lg:scale-105 transition-transform duration-500 rounded-xl overflow-hidden shadow-2xl border ${effectivelyDark ? "bg-surface-900 border-white/10" : "bg-white border-slate-200"}`}>
                        <img
                          src={feature.image}
                          alt={feature.title}
                          loading="lazy"
                          className="w-full h-auto block"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* ── ENTERPRISE CTA (MINIMAL & SHARP) ────────────────────────────────────────────────── */}
      <section className={`py-20 md:py-20 ${isDarkMode ? "bg-surface-950" : "bg-slate-50"}`}>
        <div className="max-w-[70rem] mx-auto px-6">
          <div className={`rounded-3xl p-10 md:p-16 text-center flex flex-col items-center shadow-2xl relative overflow-hidden ${isDarkMode ? "bg-surface-900 border border-white/10" : "bg-gradient-to-br from-purple-800 to-indigo-900"}`}>
            
            {/* CTA Background Pattern */}
            <div className="absolute inset-0 opacity-[0.15] text-white" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            
            <div className="relative z-10 flex flex-col items-center w-full">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 text-white mb-8 border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                <Building2 className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-6 leading-[1.1] text-white`}>
                Ready to upgrade your fleet?
              </h2>
              
              <p className={`text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed text-purple-100`}>
                Streamline operations, automate your financials, and tap into an industrial ecosystem built for massive scale. Connect your fleet to Klinflow today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact" className="w-full sm:w-auto px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg shadow-black/10 active:scale-95 transition-all md:text-lg">
                  Contact Enterprise Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
