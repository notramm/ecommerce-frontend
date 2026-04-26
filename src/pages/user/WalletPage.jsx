import { useQuery }  from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { getWallet } from '../../api/payment.api';
import useAuthStore  from '../../store/authStore';
import { cn, formatPrice, formatDate } from '../../utils/formatters';

const CATEGORY_LABELS = {
  order_payment: 'Order Payment',
  refund:        'Refund',
  wallet_topup:  'Wallet Top-up',
  payout:        'Payout',
  cashback:      'Cashback',
  adjustment:    'Adjustment',
};

function TransactionRow({ tx, index }) {
  const isCredit = tx.type === 'credit';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="flex items-center gap-4 py-4 border-b border-white/[0.05] last:border-b-0"
    >
      <div className={cn(
        'w-9 h-9 flex items-center justify-center border shrink-0',
        isCredit
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : 'bg-vermillion/10 border-vermillion/20'
      )}>
        {isCredit
          ? <ArrowDownLeft size={15} className="text-emerald-400" />
          : <ArrowUpRight  size={15} className="text-vermillion/80" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-cream text-sm font-medium">
          {CATEGORY_LABELS[tx.category] || tx.category}
        </p>
        <p className="text-stone/40 text-xs truncate">{tx.description}</p>
        <p className="text-stone/30 text-[10px] font-mono mt-0.5">
          {formatDate(tx.createdAt, 'dd MMM yyyy, hh:mm a')}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn(
          'font-mono text-sm font-medium',
          isCredit ? 'text-emerald-400' : 'text-vermillion/80'
        )}>
          {isCredit ? '+' : '-'}{formatPrice(tx.amount)}
        </p>
        <p className="text-stone/30 text-[10px] font-mono">
          Bal: {formatPrice(tx.balanceAfter)}
        </p>
      </div>
    </motion.div>
  );
}

export default function WalletPage() {
  const { user }           = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey:  ['wallet'],
    queryFn:   async () => { const { data } = await getWallet(); return data.data; },
    staleTime: 2 * 60 * 1000,
  });

  const transactions = data?.transactions || [];
  const balance      = data?.walletBalance ?? user?.walletBalance ?? 0;

  return (
    <PageWrapper>
      <DashboardShell title="My Wallet" subtitle="Finances">

        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden bg-gradient-to-br from-[#141008] via-[#0f0c06] to-[#0a0a0a] border border-gold/15 p-6 sm:p-8 mb-6"
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 opacity-[0.06] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, #c9a96e 0%, transparent 70%)' }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-gold/60" />
              <p className="eyebrow text-gold/40 text-[10px]">Available Balance</p>
            </div>
            <p className="font-display text-4xl sm:text-5xl text-gold mb-1">
              {formatPrice(balance)}
            </p>
            <p className="text-stone/40 text-xs font-mono">
              Usable at checkout for instant discount
            </p>
          </div>
        </motion.div>

        {/* Transactions */}
        <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={13} className="text-stone/40" />
            <p className="eyebrow text-stone/40 text-[10px]">Transaction History</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-9 h-9 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-2.5 w-3/4" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <Wallet size={28} className="mx-auto text-stone/20 mb-3" />
              <p className="text-stone text-sm">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx, i) => (
              <TransactionRow key={tx._id} tx={tx} index={i} />
            ))
          )}
        </div>
      </DashboardShell>
    </PageWrapper>
  );
}