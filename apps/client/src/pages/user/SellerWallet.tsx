/**
 * Seller Wallet — Financial dashboard for marketplace sellers
 * Clean, dark greenish theme matching the resident wallet hero card
 */
import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft, Eye, EyeOff, ArrowUpRight,
  Gift, Send, Banknote, Package,
  TrendingUp, BarChart2, ShieldCheck, CheckCircle2,
  Receipt, Landmark, ChevronRight,
  ArrowLeftRight,
  BadgeDollarSign,
  Store
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@klinflow/core/stores/authStore';

import { walletService } from '@klinflow/core';
import { SellerWalletStats } from '@klinflow/core/services/walletService';
import { supabase } from '@klinflow/supabase';
import { toast } from 'sonner';

export default function SellerWallet() {
  const navigate = useNavigate();
  const { profile, userId, walletBalance } = useAuthStore();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [gfpBalance, setGfpBalance] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [stats, setStats] = useState<SellerWalletStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoadingStats(false);
      return;
    }

    const loadData = () => {
      walletService.getWalletDetails(userId).then(data => {
        if (data) {
          setGfpBalance(data.available_points);
          setCashBalance(data.cash_balance);
        }
      });
      walletService.getSellerDashboard(userId).then(data => {
        if (data) {
          setStats(data);
        }
        setIsLoadingStats(false);
      });
    };

    loadData();

    // Instant Realtime Subscription for incoming Hub Payouts & Trades
    const channel = supabase
      .channel(`seller-wallet-realtime-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wallet_transactions', filter: `profile_id=eq.${userId}` },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_wallets', filter: `user_id=eq.${userId}` },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const totalEarningsLifetime = stats?.lifetime_earnings || 0;
  const pendingSettlement = stats?.pending_settlement || 0;
  const totalEarningsThisMonth = stats?.earnings_this_month || 0;
  const recentTrades = stats?.recent_trades || [];
  const topMaterials = stats?.top_materials || [];

  const formatTxDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const dateFormatted = d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dateFormatted} • ${timeFormatted}`;
  };

  return (
    <div className="space-y-4 pb-8">
      {/* ── FIXED TOP NAV ── */}
      <div className="fixed top-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white dark:bg-slate-800 pt-[calc(env(safe-area-inset-top,1rem)+1rem)] pb-2 px-4 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors active:scale-95">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-slate-600 dark:text-white">Seller Wallet</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="pt-[calc(env(safe-area-inset-top,1rem)+1.5rem)]" />

      {/* ── BALANCE HERO CARD ── */}
      <div className="mx-1">
        <div className="bg-primary rounded-2xl p-5 overflow-hidden ">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold text-emerald-100 mb-1 tracking-wider uppercase">
                Total Available
              </p>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight leading-none">
                  {balanceVisible ? `KSH ${Number(cashBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••••'}
                </h2>
                <button onClick={() => setBalanceVisible(!balanceVisible)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  {balanceVisible ? <Eye className="w-5 h-5 text-emerald-100/80" /> : <EyeOff className="w-5 h-5 text-emerald-100/80" />}
                </button>
              </div>
              <p className="text-[10px] font-medium text-emerald-200 mt-1">Ready for withdrawal</p>
            </div>

          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 border-t border-emerald-700/50 pt-4">
            <div>
              <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest mb-1">Pending Settlement</p>
              <p className="text-sm font-bold text-white">KES {pendingSettlement.toLocaleString() || '8,200.00'}</p>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest mb-1">Total Earnings</p>
                <p className="text-sm font-bold text-white">KES {isLoadingStats ? '...' : totalEarningsLifetime.toLocaleString()}</p>
              </div>
              <BarChart2 className="w-5 h-5 text-[#c2ed7d]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="mx-1">
        <div className="bg-slate-100 dark:bg-slate-800/40 rounded-[12px] p-1.5 shadow-sm border border-slate-200/50 dark:border-slate-800/60 space-y-3">
          <div className="space-y-2">
            <h3 className="text-[13px] font-black text-slate-700 dark:text-white capitalize tracking-widest px-1">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-4 gap-2 !mt-1">
            {/* Withdraw */}
            <button
              onClick={() => navigate('/withdraw')}
              className="bg-white dark:bg-slate-700/50 border border-white dark:border-slate-700/50 rounded-2xl p-2 flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-[10px] flex items-center justify-center group-hover:scale-110 transition-transform">
                <BadgeDollarSign className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize tracking-wider text-center leading-tight">Withdraw</p>
            </button>

            {/* Redeem Points */}
            <button
              onClick={() => {
                if (gfpBalance < 0) {
                  toast.warning('You need at least 100 points to redeem rewards.');
                } else {
                  navigate('/redeem-gfp');
                }
              }}
              className="bg-white dark:bg-slate-700/50 border border-white dark:border-slate-700/50 rounded-2xl p-2 flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-[10px] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize tracking-wider text-center leading-tight">Redeem</p>
            </button>

            {/* Transfer Points */}
            <button
              onClick={() => navigate('/transfer-gfp')}
              className="bg-white dark:bg-slate-700/50 border border-white dark:border-slate-700/50 rounded-2xl p-2 flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-[10px] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize tracking-wider text-center leading-tight">Transfer</p>
            </button>

            {/* Earn More */}
            <button
              onClick={() => navigate('/post-trade')}
              className="bg-white dark:bg-slate-700/50 border border-white dark:border-slate-700/50 rounded-2xl p-2 flex flex-col items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-[10px] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Banknote className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 capitalize tracking-wider text-center leading-tight">Earn More</p>
            </button>
          </div>

          {/* ── RECENT TRANSACTIONS ── */}
          <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800 p-3 shadow-2xs mt-2">
        <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[13px] font-black text-slate-700 dark:text-white capitalize tracking-widest">Recent Transactions</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Hub payouts</p>
              </div>
              <button onClick={() => navigate('/transactions-history')} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline flex items-center">
                View All <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

        <div className="space-y-2 mt-1">
          {isLoadingStats ? (
            <div className="py-6 text-center text-xs text-slate-500 font-medium">Loading transactions...</div>
          ) : recentTrades.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-1">
              <Package className="w-6 h-6 mx-auto opacity-40 mb-1" />
              <p className="font-semibold">No recent transactions found.</p>
              <p className="text-[10px] text-slate-400">Hub payouts will appear here instantly when you sell materials.</p>
            </div>
          ) : (
            recentTrades.slice(0, 4).map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 px-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.buyer && !['Agent', 'Klinflow Hub Payout', 'Unknown Buyer'].includes(item.buyer)
                        ? item.buyer
                        : (item.metadata?.hub_name || 'Klinflow Hub')}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.material && item.material !== 'Material' ? item.material : 'Recyclables Drop-off'}
                    </p>
                    {item.created_at && (
                      <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatTxDate(item.created_at)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                    +KES {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-0.5">
                    {item.status || 'Completed'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
        </div>
      </div>

      {/* ── CHARTS SECTION ── */}
      <div className="mx-1 !mt-1">
        <div className="bg-slate-100 dark:bg-slate-800/40 rounded-[12px] p-1.5 shadow-sm border border-slate-200/50 dark:border-slate-800/60 space-y-3 mt-2">
          <div className="space-y-2">
            <h3 className="text-[13px] font-black text-slate-700 dark:text-white capitalize tracking-widest px-1">Insights</h3>
          </div>
          
          {/* Combined Insights Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col overflow-hidden transform-gpu">
            
            {/* Top section: Earnings Overview */}
            <div className="flex flex-col mb-4">
              <h4 className="text-xs font-bold text-slate-600 dark:text-white mb-2">
                Earnings Overview
              </h4>
              <p className="text-xl font-semibold text-slate-800 dark:text-white mb-1 leading-none truncate">
                KES {isLoadingStats ? '...' : totalEarningsThisMonth.toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5">
                {totalEarningsThisMonth > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-[#c2ed7d] shrink-0" />
                    <p className="text-[10px] font-bold text-[#84cc16] dark:text-[#c2ed7d] truncate">
                      This Month
                    </p>
                  </>
                ) : (
                  <p className="text-[10px] font-bold text-slate-400 truncate">
                    No earnings yet
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-4" />

            {/* Bottom section: Top Material Sold */}
            <div className="flex flex-col">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
                Top Material Sold
              </h4>
              <div className="space-y-2">
                {isLoadingStats ? (
                  <div className="text-xs text-slate-500">Loading...</div>
                ) : topMaterials.length === 0 ? (
                  <div className="text-xs text-slate-500">No data available</div>
                ) : (
                  topMaterials.map((mat, idx) => {
                    const colors = ['bg-[#c2ed7d]', 'bg-[#65a30d]', 'bg-slate-600', 'bg-slate-500'];
                    const total = topMaterials.reduce((acc, m) => acc + m.amount_sold, 0);
                    const percentage = total > 0 ? Math.round((mat.amount_sold / total) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`w-2 h-2 rounded-sm ${colors[idx % colors.length]} shrink-0`} />
                          <span className="truncate">{mat.material}</span>
                        </div>
                        <span className="shrink-0">{percentage}%</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
