/**
 * Earnings Page — Premium Financial Hub for CleanFlow Agents
 */
import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Target, 
  Star, 
  Sparkles, 
  Calendar, 
  Package, 
  ShieldCheck, 
  Clock,
  ArrowLeft,
  ArrowUpRight,
  Truck,
  ChevronRight,
  MoreVertical,
  Download,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAgentStore, useAuthStore, supabase } from '@cleanflow/core';
import { toast } from 'sonner';

const CLAIM_STATUS = {
  held_in_escrow: { label: 'In Escrow', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  funds_released: { label: 'Paid Out', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  pending:        { label: 'Pending',   color: 'text-amber-600 bg-amber-50 border-amber-100' },
};

export default function EarningsPage() {
  const navigate = useNavigate();
  const { earnings, coachInsights, currentInsightIndex, nextInsight } = useAgentStore();
  const { profile, userId, withdrawRewards } = useAuthStore();
  const currentInsight = coachInsights[currentInsightIndex];
  const [materialSales, setMaterialSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  const lastWeek = earnings?.lastWeek || 0;
  const thisWeek = earnings?.thisWeek || 0;
  const weekChange = lastWeek > 0 
    ? (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1) 
    : '0.0';

  useEffect(() => {
    if (!userId) return;
    setSalesLoading(true);
    supabase
      .from('marketplace_orders')
      .select('*')
      .eq('seller_id', userId)
      .eq('order_type', 'agent_claim')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMaterialSales(data || []);
        setSalesLoading(false);
      });
  }, [userId]);

  const totalMaterialEarnings = materialSales
    .filter(s => s.status === 'funds_released')
    .reduce((sum, s) => sum + (Number(s.total_price) || 0), 0);

  const handleWithdraw = async () => {
    const balance = earnings.today || 0;
    if (balance < 100) {
      toast.warning("Minimum Withdrawal: KSh 100");
      return;
    }
    setIsWithdrawing(true);
    try {
      await withdrawRewards(balance);
      toast.success("Payout sent to M-Pesa!");
    } catch (err) {
      toast.error("Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Financial Hub</h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">My Earnings</p>
          </div>
        </div>
        <button className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <Download className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* ── BALANCE HERO ── */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[2.5rem] blur opacity-30"></div>
        <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Wallet className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Available for M-Pesa Withdrawal</p>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
              KSh {earnings.today.toLocaleString()}
            </h2>
            
            <div className="grid grid-cols-2 w-full gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickups Today</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{earnings.completedToday}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Change</p>
                <div className="flex items-center justify-center gap-1">
                  <ArrowUpRight className={`w-3 h-3 ${Number(weekChange) >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                  <p className={`text-lg font-black ${Number(weekChange) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{weekChange}%</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="mt-8 w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw to M-Pesa'}
            </button>
          </div>
        </div>
      </div>

      {/* ── MATERIAL SALES (WEAVER CLAIMS) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Material Sales</h3>
            <p className="text-lg font-black text-slate-900 dark:text-white">Weaver Payouts</p>
          </div>
          <Package className="w-5 h-5 text-indigo-400" />
        </div>

        {salesLoading ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Orders...</p>
          </div>
        ) : materialSales.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed px-10">
              No material sales yet.<br/>Verify recyclables to attract Weavers.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {materialSales.map(sale => {
              const statusCfg = CLAIM_STATUS[sale.status] || CLAIM_STATUS.pending;
              return (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 group active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-lg shadow-sm">
                      📦
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{sale.quantity}kg Claimed</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        <p className="text-[9px] font-bold text-slate-400">{new Date(sale.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">KSh {Number(sale.total_price).toLocaleString()}</p>
                    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── KEY PERFORMANCE METRICS ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
          <Star className="w-5 h-5 text-amber-400 mb-2 fill-amber-400" />
          <p className="text-2xl font-black text-slate-900 dark:text-white">{profile?.rating ? profile.rating.toFixed(1) : '5.0'}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Average Rating</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
          <Truck className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-black text-slate-900 dark:text-white">{earnings.totalJobs}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Pickups</p>
        </div>
      </div>

      {/* ── AI PERFORMANCE COACH ── */}
      {currentInsight && (
        <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Earning Strategy</p>
              </div>
              <button onClick={nextInsight} className="text-[9px] font-black uppercase text-primary">Next Tip →</button>
            </div>
            <h3 className="text-xl font-black mb-2 leading-tight">{currentInsight.title}</h3>
            <p className="text-xs font-medium text-white/60 leading-relaxed">
              {currentInsight.message || "Scale your verified recyclables to unlock high-value Weaver claims."}
            </p>
          </div>
        </div>
      )}

      {/* ── WEEKLY PERFORMANCE GRAPH (MOVED TO BOTTOM) ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Weekly Performance</h3>
            <p className="text-lg font-black text-slate-900 dark:text-white">Service Fees</p>
          </div>
          <Calendar className="w-5 h-5 text-slate-200" />
        </div>
        
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={earnings.weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-[10px] font-black shadow-2xl">
                        KSh {payload[0].value.toLocaleString()}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="earnings" radius={[8, 8, 8, 8]} barSize={24}>
                {earnings.weeklyData.map((entry, index) => {
                  // getDay() returns 0-6 (Sun-Sat). Our array is Mon-Sun (0-6).
                  const todayIndex = (new Date().getDay() + 6) % 7; 
                  return (
                    <Cell key={`cell-${entry.day}`} fill={index === todayIndex ? '#00A651' : '#e2e8f0'} />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
