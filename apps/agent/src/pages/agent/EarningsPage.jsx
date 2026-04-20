/**
 * Earnings Page — Weekly chart, summary, AI performance coach tips
 */
import { TrendingUp, Wallet, Target, Star, Sparkles, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAgentStore, useAuthStore } from '@cleanflow/core';
import AIInsightCard from '@cleanflow/ui/components/AIInsightCard';
import { toast } from 'sonner';

export default function EarningsPage() {
  const navigate = useNavigate();
  const { earnings, coachInsights, currentInsightIndex, nextInsight } = useAgentStore();
  const { profile } = useAuthStore();
  const currentInsight = coachInsights[currentInsightIndex];
  
  const lastWeek = earnings?.lastWeek || 0;
  const thisWeek = earnings?.thisWeek || 0;
  const weekChange = lastWeek > 0 
    ? (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-xl font-bold dark:text-white">Earnings</h1>

      {/* Earnings Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-gradient-to-br from-primary to-green-600 text-white p-5">
          <Wallet className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">KSh {earnings.today.toLocaleString()}</p>
          <p className="text-xs text-white/70">Today</p>
        </div>
        <div className="card bg-gradient-to-br from-secondary to-blue-700 text-white p-5">
          <Calendar className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">KSh {earnings.thisWeek.toLocaleString()}</p>
          <p className="text-xs text-white/70">This Week</p>
        </div>
      </div>

      {/* Week Comparison */}
      <div className="card flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">vs. Last Week</p>
          <p className="font-bold dark:text-white">KSh {earnings.lastWeek.toLocaleString()}</p>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          Number(weekChange) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {Number(weekChange) >= 0 ? '+' : ''}{weekChange}%
        </span>
      </div>

      {/* Weekly Chart */}
      <div className="card">
        <h3 className="font-bold text-sm mb-4 dark:text-white">This Week's Earnings</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={earnings.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v) => [`KSh ${v.toLocaleString()}`, 'Earnings']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="earnings" fill="#00A651" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center p-3">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold dark:text-white">KSh {(earnings.thisMonth / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">This Month</p>
        </div>
        <div 
          onClick={() => navigate('/reviews')}
          className="card text-center p-3 cursor-pointer active:scale-95 hover:border-primary/20 transition-all"
        >
          <Star className={`w-5 h-5 text-yellow-400 ${profile?.rating ? 'fill-yellow-400' : ''} mx-auto mb-1`} />
          <p className="text-lg font-bold dark:text-white">{profile?.rating ? profile.rating.toFixed(1) : 'New'}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Rating</p>
        </div>
        <div className="card text-center p-3">
          <Target className="w-5 h-5 text-secondary mx-auto mb-1" />
          <p className="text-lg font-bold dark:text-white">{earnings.totalJobs}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Total Jobs</p>
        </div>
      </div>

      {/* AI Coach */}
      {currentInsight && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm flex items-center gap-2 dark:text-white">
              <Sparkles className="w-4 h-4 text-primary" /> Performance Coach
            </h3>
            <button onClick={nextInsight} className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors">Next →</button>
          </div>
          <AIInsightCard insight={currentInsight} onAction={() => toast.info('Coming soon!')} onDismiss={nextInsight} />
        </div>
      )}

      {/* M-Pesa Payout */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-900/30 dark:to-green-900/20 border border-green-200 dark:border-emerald-800/50 p-5 flex items-center justify-between">
        <div>
          <p className="font-bold text-green-800 dark:text-emerald-400">M-Pesa Payout</p>
          <p className="text-sm text-green-600 dark:text-emerald-500">Available: KSh {earnings.today.toLocaleString()}</p>
        </div>
        <button className="btn-primary py-2 px-5 text-sm shadow-xl shadow-primary/20">Withdraw</button>
      </div>
    </div>
  );
}
