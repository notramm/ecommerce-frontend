import { useQuery }  from '@tanstack/react-query';
import { Link }      from 'react-router-dom';
import { motion }    from 'framer-motion';
import {
  DollarSign, Package, Users, Store,
  AlertTriangle, TrendingUp, ShoppingBag,
  FileCheck, ArrowUpRight, Clock
} from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { getPlatformDashboard } from '../../api/admin.api';
import { cn, formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUS } from '../../utils/constants';

function StatCard({ label, value, sub, icon: Icon, accent, alert, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'border p-4 sm:p-5',
        accent ? 'bg-gradient-to-br from-[#141008] to-[#0a0a0a] border-gold/20'
        : alert ? 'bg-vermillion/5 border-vermillion/20'
        : 'bg-[#0d0d0d] border-white/[0.07]'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="eyebrow text-stone/40 text-[10px]">{label}</p>
        <div className={cn(
          'w-8 h-8 flex items-center justify-center border',
          accent ? 'border-gold/25 bg-gold/10'
          : alert ? 'border-vermillion/20 bg-vermillion/10'
          : 'border-white/[0.08]'
        )}>
          <Icon size={14} className={accent ? 'text-gold' : alert ? 'text-vermillion' : 'text-stone/50'} />
        </div>
      </div>
      <p className={cn(
        'font-display text-2xl sm:text-3xl mb-0.5',
        accent ? 'text-gold' : alert ? 'text-vermillion' : 'text-cream'
      )}>
        {value}
      </p>
      {sub && <p className="text-stone/40 text-xs font-mono">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey:  ['admin-dashboard'],
    queryFn:   async () => { const { data } = await getPlatformDashboard(); return data.data; },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const platform = data?.platform || {};
  const users    = data?.users    || {};
  const pending  = data?.pendingActions || {};
  const recent   = data?.recentOrders  || [];

  const todayStats    = platform.today    || {};
  const monthStats    = platform.thisMonth || {};
  const allTimeStats  = platform.allTime  || {};

  const mainStats = [
    { label: 'Today\'s GMV',    value: formatPrice(todayStats.gmv || 0),      sub: `${todayStats.orders || 0} orders today`,  icon: DollarSign, accent: true },
    { label: 'This Month',      value: formatPrice(monthStats.gmv || 0),       sub: `${monthStats.orders || 0} orders`,        icon: TrendingUp },
    { label: 'Commission',      value: formatPrice(monthStats.commission || 0), sub: 'Platform earnings',                       icon: DollarSign },
    { label: 'Total Customers', value: (users.customers || 0).toLocaleString(),sub: `${users.vendors || 0} vendors · ${users.agents || 0} agents`, icon: Users },
  ];

  const alertStats = [
    { label: 'Pending KYC',    value: (pending.pendingKYCVendors || 0).toString(), icon: FileCheck, alert: (pending.pendingKYCVendors || 0) > 0 },
    { label: 'Pending Products',value:(pending.pendingProducts || 0).toString(),   icon: ShoppingBag, alert: (pending.pendingProducts || 0) > 0 },
    { label: 'Pending Payouts', value:(pending.pendingPayouts || 0).toString(),    icon: DollarSign, alert: (pending.pendingPayouts || 0) > 0 },
    { label: 'Fraud Alerts',    value:(pending.fraudAlerts || 0).toString(),       icon: AlertTriangle, alert: (pending.fraudAlerts || 0) > 0 },
  ];

  return (
    <PageWrapper>
      <DashboardShell title="Admin Dashboard" subtitle="Platform Overview">

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Main stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              {mainStats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
            </div>

            {/* Alert stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {alertStats.map((s, i) => <StatCard key={s.label} {...s} index={i + 4} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Recent orders */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="eyebrow text-stone/40 text-[10px]">Recent Orders</p>
                  <Link to="/admin/orders" className="text-[10px] text-gold/60 hover:text-gold transition-colors">
                    View All →
                  </Link>
                </div>
                {recent.length === 0 ? (
                  <p className="text-stone/30 text-xs text-center py-6">No recent orders</p>
                ) : (
                  <div className="space-y-3">
                    {recent.map((order) => {
                      const s = ORDER_STATUS[order.status] || { label: order.status, color: 'text-stone' };
                      return (
                        <Link
                          key={order._id}
                          to={`/admin/orders`}
                          className="flex items-center gap-3 hover:bg-white/[0.02] p-2 -mx-2 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-gold text-xs font-mono">{order.orderId}</span>
                              <span className={cn('text-[10px] font-mono', s.color)}>{s.label}</span>
                            </div>
                            <p className="text-stone/40 text-[10px] font-mono">
                              {order.customer?.name} · {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <span className="text-cream text-xs font-mono shrink-0">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pending actions */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
                <p className="eyebrow text-stone/40 text-[10px] mb-5">Action Required</p>
                <div className="space-y-2">
                  {[
                    { label: 'Review Vendor KYC',    count: pending.pendingKYCVendors,  href: '/admin/vendors',  icon: FileCheck },
                    { label: 'Approve Products',     count: pending.pendingProducts,    href: '/admin/products', icon: ShoppingBag },
                    { label: 'Process Payouts',      count: pending.pendingPayouts,     href: '/admin/vendors',  icon: DollarSign },
                    { label: 'Review Fraud Alerts',  count: pending.fraudAlerts,        href: '/admin/users',    icon: AlertTriangle },
                    { label: 'Pending Refunds',      count: pending.pendingRefunds,     href: '/admin/orders',   icon: Clock },
                  ].map(({ label, count, href, icon: Icon }) => (
                    <Link
                      key={label}
                      to={href}
                      className={cn(
                        'flex items-center gap-3 p-3 border transition-all group',
                        count > 0
                          ? 'border-vermillion/15 bg-vermillion/3 hover:border-vermillion/30'
                          : 'border-white/[0.05] hover:border-white/[0.12]'
                      )}
                    >
                      <Icon size={14} className={count > 0 ? 'text-vermillion/60' : 'text-stone/30'} />
                      <span className="flex-1 text-sm text-stone group-hover:text-cream transition-colors">
                        {label}
                      </span>
                      <span className={cn(
                        'text-xs font-mono border px-2 py-0.5 shrink-0',
                        count > 0
                          ? 'text-vermillion border-vermillion/20 bg-vermillion/5'
                          : 'text-stone/30 border-white/[0.06]'
                      )}>
                        {count || 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Platform stats summary */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
                <p className="eyebrow text-stone/40 text-[10px] mb-5">All-Time Platform Stats</p>
                <div className="space-y-3">
                  {[
                    { label: 'Total GMV',       value: formatPrice(allTimeStats.gmv || 0) },
                    { label: 'Total Commission', value: formatPrice(allTimeStats.commission || 0) },
                    { label: 'Total Orders',     value: (allTimeStats.orders || 0).toLocaleString() },
                    { label: 'Total Users',      value: (users.total || 0).toLocaleString() },
                    { label: 'Active Vendors',   value: (users.vendors || 0).toLocaleString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-stone">{label}</span>
                      <span className="text-cream font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
                <p className="eyebrow text-stone/40 text-[10px] mb-5">Quick Navigation</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Analytics',     href: '/admin/analytics',     icon: TrendingUp },
                    { label: 'All Orders',    href: '/admin/orders',        icon: Package },
                    { label: 'Manage Users',  href: '/admin/users',         icon: Users },
                    { label: 'Vendor KYC',    href: '/admin/vendors',       icon: Store },
                    { label: 'Banners',       href: '/admin/banners',       icon: ArrowUpRight },
                    { label: 'Notifications', href: '/admin/notifications', icon: ArrowUpRight },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      to={href}
                      className="flex items-center gap-2 p-3 border border-white/[0.06] hover:border-gold/20 hover:bg-gold/3 transition-all group text-sm"
                    >
                      <Icon size={13} className="text-stone/40 group-hover:text-gold transition-colors" />
                      <span className="text-stone group-hover:text-cream transition-colors text-xs">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardShell>
    </PageWrapper>
  );
}