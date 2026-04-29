import { useState }    from 'react';
import { Link }        from 'react-router-dom';
import { useQuery }    from '@tanstack/react-query';
import { motion }      from 'framer-motion';
import { Package, ChevronRight, Search } from 'lucide-react';
import PageWrapper     from '../../components/layout/PageWrapper';
import DashboardShell  from '../../components/layout/DashboardShell';
import { Skeleton }    from '../../components/ui/Skeleton';
import { getMyOrders } from '../../api/order.api';
import { cn, formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUS } from '../../utils/constants';

const TABS = [
  { value: '',                label: 'All' },
  { value: 'confirmed',       label: 'Confirmed' },
  { value: 'shipped',         label: 'Shipped' },
  { value: 'out_for_delivery',label: 'Out for Delivery' },
  { value: 'delivered',       label: 'Delivered' },
  { value: 'cancelled',       label: 'Cancelled' },
];

function OrderCard({ order }) {
  const status  = ORDER_STATUS[order.status] || { label: order.status, color: 'text-stone', bg: 'bg-stone/10' };
  const first   = order.firstItem || order.items?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/orders/${order._id}`}
        className="block bg-[#0d0d0d] border border-white/[0.07] hover:border-gold/20 transition-all duration-300 group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5">

          {/* Left — image + info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-16 sm:w-16 sm:h-18 bg-[#111] border border-white/[0.06] shrink-0 overflow-hidden">
              {first?.image ? (
                <img src={first.image} alt={first.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={18} className="text-stone/20" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-gold font-mono text-xs">{order.orderId}</span>
                <span className={cn(
                  'text-[10px] font-mono border px-2 py-0.5',
                  status.bg, status.color,
                  `border-current/20`
                )}>
                  {status.label}
                </span>
                {order.isCOD && (
                  <span className="text-[10px] font-mono border border-blue-400/20 bg-blue-400/5 text-blue-400 px-2 py-0.5">
                    COD
                  </span>
                )}
              </div>
              <p className="text-cream text-sm font-medium line-clamp-1 mb-0.5">
                {first?.name || 'Order items'}
              </p>
              {(order.itemCount > 1 || (order.items?.length > 1)) && (
                <p className="text-stone/40 text-xs">
                  +{(order.itemCount || order.items?.length || 1) - 1} more item{(order.itemCount || order.items?.length || 1) > 2 ? 's' : ''}
                </p>
              )}
              <p className="text-stone/40 text-xs font-mono mt-1">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Right — price + arrow */}
          <div className="flex items-center justify-between sm:justify-end gap-6 pl-18 sm:pl-0">
            <div className="text-right">
              <p className="text-cream font-mono text-base">{formatPrice(order.totalAmount)}</p>
              <p className="text-stone/40 text-[10px] capitalize">
                {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus}
              </p>
            </div>
            <ChevronRight
              size={16}
              className="text-stone/30 group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-200"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('');

  const { data, isLoading } = useQuery({
    queryKey:  ['my-orders', activeTab],
    queryFn:   async () => { const {data} = await getMyOrders({ status: activeTab || undefined, limit: 20 }); return data.data; },
    staleTime: 2 * 60 * 1000,
  });

  const orders = data?.orders || [];

  return (
    <PageWrapper>
      <DashboardShell title="My Orders" subtitle="Shopping History">

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'px-4 py-2 text-xs font-mono whitespace-nowrap transition-all duration-200 border shrink-0',
                activeTab === tab.value
                  ? 'bg-gold/10 border-gold/40 text-gold'
                  : 'border-white/[0.07] text-stone/60 hover:text-cream hover:border-white/20'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-4">
              <Package size={22} className="text-stone/20" />
            </div>
            <p className="font-display text-xl text-cream mb-2">No orders yet</p>
            <p className="text-stone text-sm mb-6">
              {activeTab ? `No ${activeTab} orders found.` : "You haven't placed any orders yet."}
            </p>
            <Link to="/products" className="btn-primary text-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </DashboardShell>
    </PageWrapper>
  );
}