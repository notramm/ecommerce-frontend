import { useState }  from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { Package, ChevronDown, Loader2, DollarSign } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { adminGetOrders, adminUpdateOrder, adminInitiateRefund } from '../../api/admin.api';
import { cn, formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUS } from '../../utils/constants';
import { toast }     from 'sonner';

const STATUS_OPTIONS = [
  'confirmed','processing','shipped','out_for_delivery','delivered','cancelled','refunded'
];

function OrderRow({ order, onUpdate, onRefund }) {
  const [expanded,  setExpanded]  = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [note,      setNote]      = useState('');
  const [refAmount, setRefAmount] = useState('');
  const [refReason, setRefReason] = useState('');

  const status = ORDER_STATUS[order.status] || { label: order.status, color: 'text-stone', bg: 'bg-stone/10' };

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.07] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-gold font-mono text-xs">{order.orderId}</span>
            <span className={cn('text-[10px] font-mono border px-2 py-0.5', status.bg, status.color, 'border-current/20')}>
              {status.label}
            </span>
            {order.isCOD && <span className="text-[10px] font-mono border border-blue-400/20 text-blue-400 px-2 py-0.5">COD</span>}
          </div>
          <p className="text-stone/40 text-xs font-mono">
            {order.customer?.name || 'Unknown'} · {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right shrink-0 mr-2">
          <p className="text-cream font-mono text-sm">{formatPrice(order.totalAmount)}</p>
          <p className={cn('text-[10px] font-mono', order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-yellow-500')}>
            {order.paymentStatus}
          </p>
        </div>
        <ChevronDown size={14} className={cn('text-stone/40 transition-transform shrink-0', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="border-t border-white/[0.06] px-4 sm:px-5 py-4 space-y-4"
        >
          {/* Update status */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/30 text-stone px-3 py-2 text-xs outline-none"
            >
              <option value="">Change status...</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-[#0a0a0a] capitalize">{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Admin note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/30 text-cream placeholder:text-stone/20 px-3 py-2 text-xs outline-none"
            />
            <button
              onClick={() => { if (newStatus) onUpdate(order._id, { status: newStatus, note }); }}
              disabled={!newStatus}
              className="px-4 py-2 bg-gold/10 border border-gold/30 text-gold text-xs hover:bg-gold/20 transition-colors disabled:opacity-40"
            >
              Update
            </button>
          </div>

          {/* Refund section */}
          {order.paymentStatus === 'paid' && order.razorpayPaymentId && (
            <div className="flex gap-2 flex-wrap border-t border-white/[0.05] pt-4">
              <input
                type="number"
                placeholder={`Refund amount (max ₹${order.totalAmount})`}
                value={refAmount}
                onChange={(e) => setRefAmount(e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/30 text-cream placeholder:text-stone/20 px-3 py-2 text-xs outline-none"
              />
              <input
                type="text"
                placeholder="Refund reason"
                value={refReason}
                onChange={(e) => setRefReason(e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/30 text-cream placeholder:text-stone/20 px-3 py-2 text-xs outline-none"
              />
              <button
                onClick={() => onRefund(order._id, { amount: Number(refAmount), reason: refReason })}
                disabled={!refAmount || !refReason}
                className="flex items-center gap-1.5 px-4 py-2 bg-vermillion/10 border border-vermillion/30 text-vermillion text-xs hover:bg-vermillion/20 transition-colors disabled:opacity-40"
              >
                <DollarSign size={11} /> Refund
              </button>
            </div>
          )}

          {/* Delivery address */}
          <div className="text-xs text-stone/50 bg-[#0a0a0a] border border-white/[0.04] p-3">
            <span className="text-cream font-medium">{order.deliveryAddress?.fullName}</span> ·
            {' '}{order.deliveryAddress?.line1}, {order.deliveryAddress?.city}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const [status,  setStatus]  = useState('');
  const [search,  setSearch]  = useState('');
  const [payment, setPayment] = useState('');
  const queryClient            = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey:  ['admin-orders', status, search, payment],
    queryFn:   () => adminGetOrders({
      status:        status  || undefined,
      paymentStatus: payment || undefined,
      search:        search  || undefined,
      limit:         30,
    }),
    staleTime: 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminUpdateOrder(id, data),
    onSuccess:  () => { toast.success('Order updated'); queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, data }) => adminInitiateRefund(id, data),
    onSuccess:  () => { toast.success('Refund initiated'); queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const orders = data?.data?.orders || [];

  return (
    <PageWrapper>
      <DashboardShell title="All Orders" subtitle="Admin">

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <input
            type="text"
            placeholder="Search by order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] bg-[#0f0f0f] border border-white/[0.07] focus:border-gold/30 text-cream placeholder:text-stone/20 px-3 py-2 text-xs outline-none"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#0f0f0f] border border-white/[0.07] text-stone px-3 py-2 text-xs outline-none focus:border-gold/30"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-[#0f0f0f] capitalize">{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="bg-[#0f0f0f] border border-white/[0.07] text-stone px-3 py-2 text-xs outline-none focus:border-gold/30"
          >
            <option value="">All Payments</option>
            {['pending','paid','failed','refunded'].map((p) => (
              <option key={p} value={p} className="bg-[#0f0f0f] capitalize">{p}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={28} className="mx-auto text-stone/20 mb-4" />
            <p className="text-stone text-sm">No orders found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                onUpdate={(id, data) => updateMutation.mutate({ id, data })}
                onRefund={(id, data) => refundMutation.mutate({ id, data })}
              />
            ))}
          </div>
        )}
      </DashboardShell>
    </PageWrapper>
  );
}