import { useState }  from 'react';
import { useQuery }  from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { getPlatformAnalytics, getFinancialOverview } from '../../api/admin.api';
import { cn, formatPrice } from '../../utils/formatters';

function BarChart({ data, valueKey = 'gmv', labelKey = '_id' }) {
  if (!data?.length) return <div className="h-32 flex items-center justify-center text-stone/30 text-xs">No data</div>;
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.slice(-20).map((d, i) => {
        const h = ((d[valueKey] || 0) / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/[0.08] px-2 py-1 text-[9px] text-cream font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {formatPrice(d[valueKey] || 0)}
            </div>
            <motion.div
              className="w-full bg-gold/25 hover:bg-gold/50 transition-colors cursor-default"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(h, 2)}%` }}
              transition={{ delay: i * 0.02, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('monthly');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey:  ['admin-analytics', period],
    queryFn:   async () => { const { data } = await getPlatformAnalytics({ period }); return data.data; },
    staleTime: 5 * 60 * 1000,
  });

  const { data: finData } = useQuery({
    queryKey:  ['admin-financial'],
    queryFn:   async () => { const { data } = await getFinancialOverview(); return data.data; },
    staleTime: 5 * 60 * 1000,
  });

  const revenue      = analyticsData?.revenueTrend       || [];
  const paymentSplit = analyticsData?.paymentMethodSplit  || [];
  const topCats      = analyticsData?.topCategories       || [];
  const topVendors   = analyticsData?.topVendors          || [];
  const financial    = finData?.revenue                   || {};
  const payouts      = finData?.payouts                   || {};
  const refunds      = finData?.refunds                   || {};

  return (
    <PageWrapper>
      <DashboardShell title="Analytics" subtitle="Platform Insights">

        {/* Period selector */}
        <div className="flex gap-1 mb-6">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 text-[10px] font-mono border transition-all capitalize',
                period === p
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-white/[0.07] text-stone/60 hover:text-cream'
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-48" />
          </div>
        ) : (
          <>
            {/* Financial summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Gross GMV',         value: formatPrice(financial.gmv || 0) },
                { label: 'Platform Commission',value: formatPrice(financial.commission || 0) },
                { label: 'Vendor Earnings',    value: formatPrice(financial.vendorPaid || 0) },
              ].map(({ label, value }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#0d0d0d] border border-white/[0.07] p-4 sm:p-5"
                >
                  <p className="eyebrow text-stone/40 text-[10px] mb-2">{label}</p>
                  <p className="font-display text-2xl text-cream">{value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Revenue trend chart */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="eyebrow text-stone/40 text-[10px]">Revenue Trend (GMV)</p>
                  <p className="text-cream text-sm font-mono">
                    {formatPrice(revenue.reduce((s, d) => s + (d.gmv || 0), 0))}
                  </p>
                </div>
                <BarChart data={revenue} valueKey="gmv" />
                <div className="flex items-center gap-4 mt-3 text-xs text-stone/40">
                  <span>{revenue.length} periods</span>
                  <span>Avg: {formatPrice(revenue.length ? revenue.reduce((s, d) => s + (d.gmv || 0), 0) / revenue.length : 0)}</span>
                </div>
              </div>

              {/* Commission trend */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="eyebrow text-stone/40 text-[10px]">Commission Trend</p>
                  <p className="text-gold text-sm font-mono">
                    {formatPrice(revenue.reduce((s, d) => s + (d.commission || 0), 0))}
                  </p>
                </div>
                <BarChart data={revenue} valueKey="commission" />
              </div>

              {/* Payment split */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
                <p className="eyebrow text-stone/40 text-[10px] mb-5">Payment Method Split</p>
                {paymentSplit.length === 0 ? (
                  <p className="text-stone/30 text-xs text-center py-4">No data</p>
                ) : (
                  <div className="space-y-3">
                    {paymentSplit.map((p) => {
                      const total = paymentSplit.reduce((s, x) => s + (x.total || 0), 0);
                      const pct   = total > 0 ? ((p.total / total) * 100).toFixed(1) : 0;
                      return (
                        <div key={p._id}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-stone capitalize">{p._id}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-stone/40 font-mono">{p.count} orders</span>
                              <span className="text-cream font-mono">{pct}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-white/[0.05]">
                            <motion.div
                              className="h-full bg-gold/50"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top categories */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
                <p className="eyebrow text-stone/40 text-[10px] mb-5">Top Categories</p>
                {topCats.length === 0 ? (
                  <p className="text-stone/30 text-xs text-center py-4">No data</p>
                ) : (
                  <div className="space-y-3">
                    {topCats.map((c, i) => (
                      <div key={c._id} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-stone/30 w-4 shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-cream text-xs font-medium truncate">{c.name || 'Unknown'}</p>
                          <p className="text-stone/40 text-[10px] font-mono">{c.units} units</p>
                        </div>
                        <p className="text-cream text-xs font-mono shrink-0">{formatPrice(c.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top vendors */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
                <p className="eyebrow text-stone/40 text-[10px] mb-5">Top Vendors by GMV</p>
                {topVendors.length === 0 ? (
                  <p className="text-stone/30 text-xs text-center py-4">No data</p>
                ) : (
                  <div className="space-y-3">
                    {topVendors.map((v, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-stone/30 w-4 shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-cream text-xs font-medium truncate">{v.storeName || 'Unknown'}</p>
                          <p className="text-stone/40 text-[10px] font-mono">{v.orderCount} orders</p>
                        </div>
                        <p className="text-cream text-xs font-mono shrink-0">{formatPrice(v.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Financial overview */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
                <p className="eyebrow text-stone/40 text-[10px] mb-5">Financial Overview</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-stone/50 mb-2">Payouts</p>
                    <div className="space-y-1.5">
                      {['pending', 'processing', 'completed'].map((s) => (
                        <div key={s} className="flex justify-between text-xs">
                          <span className="text-stone capitalize">{s}</span>
                          <span className="text-cream font-mono">
                            {payouts[s]?.count || 0} · {formatPrice(payouts[s]?.amount || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-white/[0.05] pt-4">
                    <p className="text-xs text-stone/50 mb-2">Refunds</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-stone">Total Refunded</span>
                      <span className="text-vermillion font-mono">{formatPrice(refunds.refundAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-stone">Refund Count</span>
                      <span className="text-cream font-mono">{refunds.totalRefunds || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardShell>
    </PageWrapper>
  );
}