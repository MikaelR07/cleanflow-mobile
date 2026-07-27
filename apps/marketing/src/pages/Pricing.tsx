import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowRight, HelpCircle, Star, Quote } from "lucide-react";
import { useThemeStore } from "@klinflow/core/stores/themeStore";
import Layout from "../layouts/Layout";

const pricingTiers = [
  {
    name: "Resident",
    badge: "For Households",
    price: "Free",
    subtext: "You keep 95% of the payouts",
    pitch: "Turn household waste into instant cash. The 5% fee helps us build better services and expand our network.",
    features: [
      "Voice-activated pickup scheduling",
      "Unlimited AI Image Valuations",
      "Instant digital wallet payouts",
      "GreenFuel Points rewards"
    ],
    cta: "Download App",
    link: "/products/client",
    popular: false,
    color: "emerald"
  },
  {
    name: "Seller",
    badge: "For Scrappers",
    price: "Free",
    subtext: "You keep 95% of the earnings",
    pitch: "A transparent trading floor for your materials. The 5% fee helps us build better services and expand our network.",
    features: [
      "Dynamic Market-rate Matching",
      "Group Contract Pledging for higher margins",
      "Real-time demand alerts",
      "Proof-of-material image uploads"
    ],
    cta: "Start Selling",
    link: "/products/client",
    popular: false,
    color: "emerald"
  },
  {
    name: "Solo Agent",
    badge: "Individual Collectors",
    price: "KSh 1,150",
    yearlyPrice: "KSh 990",
    subtext: "per month",
    pitch: "Your intelligent co-driver. Maximize your daily collections and route efficiency effortlessly.",
    features: [
      "HygeneX Route Optimization map",
      "On-the-spot conversational material grading",
      "Pending job radar & live dispatch",
      "Individual revenue tracking dashboard"
    ],
    cta: "Join as Agent",
    link: "/products/agent",
    popular: false,
    color: "blue"
  },
  {
    name: "Fleet Suite",
    badge: "For Logistics Companies",
    price: "KSh 16,900",
    yearlyPrice: "KSh 14,500",
    subtext: "per month",
    pitch: "The complete operating system for your recycling logistics. Includes Hub app, Owner dashboard, and 10 driver licenses.",
    features: [
      "Company Owner full admin dashboard",
      "Hub Command App (MOS) for facility management",
      "Includes 10 Fleet Driver licenses",
      "Predictive Analytics & automated RFQ generation",
      "Additional drivers at KSh 650/month"
    ],
    cta: "Get Fleet Suite",
    link: "/products/fleet",
    popular: true,
    color: "primary"
  },
  {
    name: "Enterprise Trade",
    badge: "For Industrial B2B Buyers",
    price: "Custom",
    subtext: "Volume Pricing",
    pitch: "Secure consistent, traceable supply lots and realize your corporate sustainability goals.",
    features: [
      "Full Supply Chain Traceability",
      "Verified ESG & Carbon Offset Reporting",
      "Escrow-secured Bulk Sourcing",
      "Dedicated Account Manager & API access"
    ],
    cta: "Contact Sales",
    link: "/contact",
    popular: false,
    color: "slate"
  }
];

const faqs = [
  {
    q: "Why is there a 5% fee for Residents and Sellers?",
    a: "We believe you should keep the vast majority of the value you create. The small 5% platform fee allows us to maintain the servers, improve the HygeneX AI features, and continuously expand the Klinflow network so you can get even better prices for your materials."
  },
  {
    q: "What happens if my fleet has more than 10 drivers?",
    a: "The Fleet Suite includes 10 driver licenses out of the box. Any additional driver you want to add to your network will cost just KSh 650 per month, allowing you to scale your logistics operations affordably."
  },
  {
    q: "Do I need to sign a long-term contract?",
    a: "No. Solo Agent and Fleet Suite plans are billed month-to-month and you can cancel anytime. For Enterprise Trade customers, we offer customized annual agreements based on procurement volume."
  },
  {
    q: "How does payout work for free tier users?",
    a: "When your materials are collected or traded, 95% of the total transaction value is instantly routed to your Klinflow digital wallet. You can withdraw this to your bank account or convert it to GreenFuel Points at any time."
  }
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "Resident",
    quote: "Klinflow makes recycling so easy. The AI values my plastics instantly and I get paid directly to my digital wallet!"
  },
  {
    name: "John M.",
    role: "Scrap Seller",
    quote: "The group contract pledging has completely changed my business. I'm getting much better margins now on bulk materials."
  },
  {
    name: "David T.",
    role: "Fleet Driver",
    quote: "The route optimization is a lifesaver. I collect twice as much in the same amount of time with the smart map."
  },
  {
    name: "EcoCorp Hub",
    role: "Aggregator",
    quote: "Broadcasting RFQs and having the AI handle initial negotiations saves our facility hours of manual work every single day."
  }
];

export default function Pricing() {
  const { isDarkMode } = useThemeStore();
  const [isYearly, setIsYearly] = useState(false);

  return (
    <Layout>
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className={`absolute inset-0 opacity-[0.03] ${isDarkMode ? "text-white" : "text-slate-900"}`}
            style={{
              backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block">
            Transparent Pricing
          </span>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-6 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Fair economics for <br className="hidden md:block" />
            <span className="text-primary italic">every stakeholder.</span>
          </h1>
          <p className={`max-w-2xl mx-auto text-base md:text-lg mb-10 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
            Whether you are a household recycling plastic or an enterprise sourcing tons of PET, our ecosystem is designed to align incentives and accelerate the circular economy.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-semibold ${!isYearly ? (isDarkMode ? "text-white" : "text-slate-900") : "text-slate-500"}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-8 rounded-full p-1 transition-colors ${isYearly ? "bg-primary" : (isDarkMode ? "bg-surface-800 border border-white/10" : "bg-slate-200")}`}
            >
              <motion.div 
                className="w-6 h-6 bg-white rounded-full shadow-sm"
                animate={{ x: isYearly ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${isYearly ? (isDarkMode ? "text-white" : "text-slate-900") : "text-slate-500"}`}>Yearly</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded-full">Save 20%</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 xl:gap-4 items-start">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative flex flex-col h-full rounded-3xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 ${
                  tier.popular 
                    ? `border-2 border-primary shadow-[0_0_40px_rgba(34,197,94,0.15)] ${isDarkMode ? "bg-surface-900" : "bg-white"}`
                    : `border ${isDarkMode ? "border-white/10 bg-surface-900 hover:bg-surface-900/50" : "border-slate-200 bg-white hover:shadow-xl"}`
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                    Recommended
                  </div>
                )}
                
                <div className="mb-6">
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${tier.popular ? "text-primary" : "text-slate-500"}`}>
                    {tier.badge}
                  </span>
                  <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-2xl md:text-3xl font-black ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {isYearly && tier.yearlyPrice ? tier.yearlyPrice : tier.price}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {tier.subtext} {isYearly && tier.yearlyPrice && "(billed annually)"}
                  </span>
                </div>

                <p className={`text-sm leading-relaxed mb-8 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                  {tier.pitch}
                </p>

                <div className="flex-grow">
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${tier.popular ? "bg-primary/20 text-primary" : (isDarkMode ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700")}`}>
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={tier.link}
                  className={`mt-auto flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-colors ${
                    tier.popular
                      ? "bg-primary hover:bg-primary-dark text-white"
                      : isDarkMode
                        ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200"
                  }`}
                >
                  {tier.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-24 border-t ${isDarkMode ? "bg-transparent border-white/5" : "bg-slate-50 border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <HelpCircle className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className={`text-3xl font-bold tracking-tight mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Frequently Asked Questions
            </h2>
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              Everything you need to know about pricing and payments on Klinflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className={`rounded-2xl border p-6 md:p-8 ${isDarkMode ? "bg-surface-900 border-white/10" : "bg-white border-slate-200"}`}
              >
                <h3 className={`font-semibold text-base md:text-lg mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  {faq.q}
                </h3>
                <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-24 border-t ${isDarkMode ? "bg-surface-950 border-white/5" : "bg-white border-slate-200"}`}>
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block">
              Trusted by the Network
            </span>
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Don't just take our word for it.
            </h2>
            <p className={`text-base ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              See how Klinflow is transforming operations for every type of stakeholder in the circular economy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div 
                key={i} 
                className={`relative rounded-3xl p-8 border flex flex-col justify-between ${isDarkMode ? "bg-surface-900 border-white/10" : "bg-slate-50 border-slate-200"}`}
              >
                <div>
                  <div className="flex items-center gap-1 mb-6 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className={`w-8 h-8 mb-4 opacity-20 ${isDarkMode ? "text-white" : "text-slate-900"}`} />
                  <p className={`text-sm italic leading-relaxed mb-8 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    "{t.quote}"
                  </p>
                </div>
                <div className="mt-auto">
                  <h4 className={`font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {t.name}
                  </h4>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-primary" : "text-primary"}`}>
                    {t.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
