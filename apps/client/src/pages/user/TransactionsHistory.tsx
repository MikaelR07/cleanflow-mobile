import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Store, Wallet, Package, 
  Search 
} from 'lucide-react';
import { useAuthStore } from '@klinflow/core/stores/authStore';
import { walletService } from '@klinflow/core';

export default function TransactionsHistory() {
  const navigate = useNavigate();
  const { profile, userId } = useAuthStore();
  const [rawTxns, setRawTxns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'payouts' | 'rewards'>('all');

  const isSeller = profile?.role === 'seller';

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    // Fetch both wallet transactions ledger and seller stats if seller
    const loadTxns = async () => {
      setIsLoading(true);
      try {
        if (isSeller) {
          const stats = await walletService.getSellerDashboard(userId);
          if (stats?.recent_trades && stats.recent_trades.length > 0) {
            setRawTxns(stats.recent_trades);
          } else {
            const txs = await walletService.getWalletTransactions(userId);
            setRawTxns(txs || []);
          }
        } else {
          const txs = await walletService.getWalletTransactions(userId);
          setRawTxns(txs || []);
        }
      } catch (err) {
        console.error('Failed to load transaction history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTxns();
  }, [isSeller, userId]);

  // Normalized Transaction List
  const normalizedTransactions = useMemo(() => {
    return rawTxns.map((item: any) => {
      const isPayout = item.transaction_type === 'payout' || item.amount > 0;
      const buyerName = item.buyer && !['Agent', 'Klinflow Hub Payout', 'Unknown Buyer'].includes(item.buyer)
        ? item.buyer
        : (item.metadata?.hub_name || item.metadata?.buyer_name || 'Klinflow Hub');
      
      const materialSummary = item.material && item.material !== 'Material'
        ? item.material
        : (item.metadata?.materials_summary || item.metadata?.description || 'Recyclables Drop-off');

      const dateObj = new Date(item.created_at || item.date || Date.now());

      return {
        id: item.id || Math.random().toString(),
        buyer: buyerName,
        material: materialSummary,
        amount: Number(item.amount || 0),
        status: item.status || 'Completed',
        date: dateObj,
        isPayout,
        raw: item
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [rawTxns]);

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return normalizedTransactions.filter(item => {
      const matchesSearch = 
        item.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.material.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterType === 'payouts') return matchesSearch && item.isPayout;
      if (filterType === 'rewards') return matchesSearch && !item.isPayout;
      return matchesSearch;
    });
  }, [normalizedTransactions, searchQuery, filterType]);

  // Totals
  const totalVolume = useMemo(() => {
    return filteredTransactions.reduce((acc, item) => acc + item.amount, 0);
  }, [filteredTransactions]);

  const formatTxDate = (date: Date) => {
    if (isNaN(date.getTime())) return '';
    const dateFormatted = date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dateFormatted} • ${timeFormatted}`;
  };

  return (
    <div className=" bg-slate-50 dark:bg-slate-950 transition-colors pb-12">
      {/* ── FIXED TOP NAV ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 pt-[calc(env(safe-area-inset-top,1rem)+1rem)] pb-2 shadow-2xs">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                Transaction History
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Hub payouts & wallet ledger
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
              {filteredTransactions.length} Total
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-3 pt-[calc(env(safe-area-inset-top,1rem)+4.25rem)] space-y-4">
        {/* ── STATS HEADER CARD ── */}
        <div className="bg-gradient-to-br from-[#224823] to-[#142d15] dark:from-slate-900 dark:to-slate-900 border border-emerald-800/30 dark:border-slate-800 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#c2ed7d] uppercase tracking-wider mb-0.5">
              Filtered Volume
            </p>
            <p className="text-2xl font-black font-mono text-white">
              KES {totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
            <Wallet className="w-5 h-5 text-[#c2ed7d]" />
          </div>
        </div>

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Hub name or material..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(['all', 'payouts', 'rewards'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                  filterType === type
                    ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* ── TRANSACTION FEED CARD ── */}
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-500 font-medium">
                Loading transaction ledger...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <Package className="w-8 h-8 mx-auto opacity-30" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No matching transactions found
                </p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  Try adjusting your search terms or filter selection.
                </p>
              </div>
            ) : (
              filteredTransactions.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.buyer}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.material}
                      </p>
                      <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatTxDate(item.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                      +KES {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-0.5">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
