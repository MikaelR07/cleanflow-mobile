import { 
  TrendingUp, TrendingDown, Sparkles, FileText, Users, Truck, 
  Leaf, Star, ShieldCheck, Gift, Recycle, Cpu, Network, Clock,
  AlertCircle, ChevronRight, Activity, Wallet, AlertTriangle, Info, Zap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { useAdminStore, useIotStore } from '@cleanflow/core';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { 
    stats, revenueTrends, materialDistribution, systemEvents, highAlerts,
    initAdminLiveFeed, openNemaModal, isLoading 
  } = useAdminStore();
  
  const { smartBins } = useIotStore();

  useEffect(() => {
    initAdminLiveFeed();
  }, []);

  const kpis = [
    { 
      label: 'Free Members', 
      value: stats?.freeTierMembers || 0, 
      unit: '', 
      icon: Leaf,
      color: 'slate'
    },
    { 
      label: 'Standard Members', 
      value: stats?.standardMembers || 0, 
      unit: '', 
      icon: ShieldCheck,
      color: 'emerald'
    },
    { 
      label: 'Premium Members', 
      value: stats?.premiumMembers || 0, 
      unit: '', 
      icon: Star,
      color: 'amber'
    },
    { 
      label: 'Active Agents', 
      value: stats?.activeAgents || 0, 
      unit: '', 
      icon: Activity,
      color: 'emerald'
    },
    { 
      label: 'Total Agents', 
      value: stats?.registeredAgents || 0, 
      unit: '', 
      icon: Truck,
      color: 'slate'
    },
    { 
      label: 'Businesses', 
      value: stats?.totalBusinesses || 0, 
      unit: '', 
      icon: Network,
      color: 'indigo'
    },
    { 
      label: 'Gross Revenue', 
      value: stats?.totalRevenue || 0, 
      unit: 'KSh', 
      icon: TrendingUp,
      color: 'emerald'
    },
    { 
      label: 'Subscription Earnings', 
      value: stats?.subscriptionRevenue || 0, 
      unit: 'KSh', 
      icon: Zap,
      color: 'indigo'
    },
    { 
      label: 'Platform Commissions', 
      value: stats?.commissionRevenue || 0, 
      unit: 'KSh', 
      icon: Gift,
      color: 'purple'
    },
    { 
      label: 'Waste Recovered', 
      value: stats?.totalWeight || 0, 
      unit: 'KG', 
      icon: Recycle,
      color: 'amber'
    },
    { 
      label: 'Total Customers', 
      value: stats?.totalUsers || 0, 
      unit: '', 
      icon: Users,
      color: 'blue'
    },
    { 
      label: 'Rewards Liability', 
      value: stats?.rewardsLiabilities || 0, 
      unit: 'KSh', 
      icon: Wallet,
      color: 'rose'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Ops Control</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">System Live</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">CleanFlow Global Operations & Real-time Metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={openNemaModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
          >
            <Sparkles className="w-4 h-4" /> AI Compliance
          </button>
        </div>
      </div>

      {/* High Alert Banner */}
      {highAlerts.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between group overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-rose-600 dark:text-rose-400 text-sm uppercase tracking-widest">High Alert: Delayed Jobs</p>
              <p className="text-xs text-rose-500/80 font-bold">{highAlerts.length} pickups are pending for more than 24 hours.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-colors">
            Resolve Now
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${kpi.color}-500/5 rounded-full group-hover:scale-150 transition-transform duration-700`} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-2xl bg-${kpi.color}-500/10 text-${kpi.color}-600 dark:text-${kpi.color}-400`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <Activity className="w-4 h-4 text-slate-200 dark:text-slate-700 animate-pulse" />
            </div>
            
            <div className="relative z-10">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{kpi.label}</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                {isLoading ? '...' : (kpi.value || 0).toLocaleString()}
                <span className="text-xs ml-1 opacity-40 font-bold uppercase">{kpi.unit}</span>
              </h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Growth Chart */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    Ecosystem Revenue 
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Snapshot • Subscriptions + Service Fees</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    Live Ecosystem Flow
                  </div>
                </div>
            </div>

             <div className="h-[350px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrends.length > 1 ? revenueTrends : [
                    { month: 'Start', revenue: 0 }, 
                    ...(revenueTrends.length === 1 ? revenueTrends : [{ month: 'Current', revenue: 0 }])
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                      tickFormatter={(val) => `KSh ${(val/1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '20px', 
                        border: 'none', 
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)', 
                        fontWeight: 800,
                        backgroundColor: '#fff' 
                      }}
                      formatter={(val) => [`KSh ${val.toLocaleString()}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#00A651" 
                      strokeWidth={5}
                      dot={{ r: 6, fill: '#00A651', strokeWidth: 3, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Material Breakdown (Top 5)</h3>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={materialDistribution.length > 0 ? materialDistribution : [{name: 'Organic', value: 4500}, {name: 'Recyclables', value: 2000}]} 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={5} 
                        dataKey="value"
                      >
                        <Cell fill="#00A651" />
                        <Cell fill="#fbbf24" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#6366f1" />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">Fleet Efficiency</h3>
                  <p className="text-xs text-slate-500 font-medium">Real-time throughput analysis</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-slate-400">Agent Utilization</span>
                    <span className="text-lg font-black text-primary">74%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-[74%] bg-gradient-to-r from-primary to-emerald-400 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                    <Clock className="w-3 h-3" /> Avg. Pickup: 24 mins
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Live Activity Sidebar - FIXED STYLING */}
        <div className="lg:col-span-4">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] h-full shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Network className="w-32 h-32 text-primary" />
              </div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2 text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" /> System Pulse
                </h3>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Live
                </span>
              </div>

              <div className="flex-1 space-y-6 overflow-hidden relative z-10">
                {systemEvents.length === 0 && (
                  <div className="py-20 text-center opacity-30">
                    <Activity className="w-8 h-8 mx-auto mb-3 animate-pulse text-slate-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Deep Listening...</p>
                  </div>
                )}
                {systemEvents.map(ev => (
                  <div key={ev.id} className="flex gap-4 group border-b border-slate-50 dark:border-slate-800/50 pb-4 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 p-2 -m-2 rounded-xl transition-colors">
                    <div className="mt-1">
                      {ev.type === 'success' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />}
                      {ev.type === 'user' && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />}
                      {ev.type === 'info' && <div className="w-2 h-2 rounded-full bg-slate-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-tight group-hover:text-primary transition-colors">{ev.msg}</p>
                      <p className="text-[9px] font-black uppercase text-slate-400 mt-1">
                         {new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 relative z-10">
                 <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary text-slate-500 hover:text-white dark:text-slate-400 transition-all flex items-center justify-center gap-2">
                    System Hub <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
