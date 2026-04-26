import { useState }  from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { DollarSign, Clock, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { getPayouts, requestPayout } from '../../api/vendor.api';
import { cn, formatPrice, formatDate } from '../../utils/formatters';
import { toast }     from 'sonner';

const STATUS_STYLE = {
  pending:    'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
  processing: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
  completed:  'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
  failed:     'text-vermillion border-vermillion/20 bg-vermillion/5',
};

export default function VendorPayouts() {
  const [amount, setAmount] = useState('');
  const queryClient          = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-payouts'],
    queryFn:  async () => { const { data } = await getPayouts(); return data.data; },
    staleTime: 2 * 60 * 1000,
  });

  const payouts  = data?.payouts  || [];
  const summary  = data?.summary  || {};

  const mutation = useMutation({
    mutationFn: (d) => requestPayout(d),
    onSuccess:  () => {
      toast.success('Payout request submitted');
      queryClient.invalidateQueries({ queryKey: ['vendor-payouts'] });
      setAmount('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Request failed'),
  });

  const handleRequest = () => {
    const val = Number(amount);
    if (val < 100) { toast.error('Minimum payout ₹100'); return; }
    if (val > summary.pendingPayout) { toast.error('Insufficient balance'); return; }
    mutation.mutate({ amount: val });
  };

  return (
    <PageWrapper>
      <DashboardShell title="Payouts" subtitle="Earnings">

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Available',    value: formatPrice(summary.pendingPayout || 0), icon: DollarSign, accent: true },
            { label: 'Total Earned', value: formatPrice(summary.totalEarnings || 0), icon: CheckCircle2 },
            { label: 'Total Paid',   value: formatPrice(summary.totalPaidOut  || 0), icon: DollarSign },
          ].map(({ label, value, icon: Icon, accent }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={cn(
                'border p-4 sm:p-5',
                accent
                  ? 'bg-gradient-to-br from-[#141008] to-[#0a0a0a] border-gold/20'
                  : 'bg-[#0d0d0d] border-white/[0.07]'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="eyebrow text-stone/40 text-[10px]">{label}</p>
                <Icon size={14} className={accent ? 'text-gold' : 'text-stone/40'} />
              </div>
              <p className={cn('font-display text-2xl sm:text-3xl', accent ? 'text-gold' : 'text-cream')}>
                {value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Request payout */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
            <p className="eyebrow text-stone/40 text-[10px] mb-5">Request Payout</p>

            {summary.pendingPayout < 100 ? (
              <div className="flex items-start gap-3 text-stone/50 text-sm py-4">
                <AlertTriangle size={15} className="text-yellow-500/50 shrink-0 mt-0.5" />
                Minimum ₹100 required. Keep selling to unlock payouts!
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="eyebrow text-stone/40 text-[10px] block mb-2">
                    Amount (₹) — Available: {formatPrice(summary.pendingPayout)}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Max ${formatPrice(summary.pendingPayout)}`}
                      min={100}
                      max={summary.pendingPayout}
                      className="flex-1 bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none"
                    />
                    <button
                      onClick={() => setAmount(String(summary.pendingPayout))}
                      className="px-3 border border-white/[0.08] text-stone/50 hover:text-cream text-xs transition-colors whitespace-nowrap"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {[500, 1000, 5000].filter((v) => v <= summary.pendingPayout).map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className={cn(
                        'px-3 py-1.5 border text-xs font-mono transition-all',
                        Number(amount) === v
                          ? 'border-gold/40 bg-gold/10 text-gold'
                          : 'border-white/[0.07] text-stone/50 hover:text-cream'
                      )}
                    >
                      ₹{v.toLocaleString()}
                    </button>
                  ))}
                </div>

                <motion.button
                  onClick={handleRequest}
                  disabled={!amount || mutation.isPending}
                  whileTap={{ scale: 0.97 }}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Request Payout
                </motion.button>

                <p className="text-[10px] text-stone/30 text-center">
                  Processed within 3-5 business days via bank transfer
                </p>
              </div>
            )}
          </div>

          {/* Payout history */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
            <p className="eyebrow text-stone/40 text-[10px] mb-5">Payout History</p>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={24} className="mx-auto text-stone/20 mb-2" />
                <p className="text-stone/40 text-xs">No payouts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 py-3 border-b border-white/[0.05] last:border-b-0">
                    <div className={cn(
                      'w-8 h-8 flex items-center justify-center border shrink-0',
                      STATUS_STYLE[p.status]
                    )}>
                      {p.status === 'completed' ? <CheckCircle2 size={13} /> :
                       p.status === 'failed'    ? <XCircle size={13} />    :
                       <Clock size={13} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-xs font-medium">{formatPrice(p.amount)}</p>
                      <p className="text-stone/40 text-[10px] font-mono">{formatDate(p.createdAt)}</p>
                    </div>
                    <span className={cn(
                      'text-[10px] font-mono border px-2 py-0.5 shrink-0',
                      STATUS_STYLE[p.status]
                    )}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </PageWrapper>
  );
}