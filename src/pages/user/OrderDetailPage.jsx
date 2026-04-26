import { useState }  from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { ArrowLeft, Package, MapPin, CreditCard, Truck,
         RotateCcw, XCircle, ChevronDown, Loader2 } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { getOrderById, cancelOrder } from '../../api/order.api';
import { cn, formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUS } from '../../utils/constants';
import { toast }     from 'sonner';

function StatusTimeline({ history = [] }) {
  return (
    <div className="space-y-0">
      {[...history].reverse().map((h, i) => (
        <div key={i} className="flex gap-4 pb-5 last:pb-0">
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-3 h-3 rounded-full border-2 mt-0.5 shrink-0',
              i === 0 ? 'border-gold bg-gold' : 'border-white/[0.2] bg-transparent'
            )} />
            {i < history.length - 1 && <div className="w-px flex-1 bg-white/[0.06] mt-1" />}
          </div>
          <div className="pb-1">
            <p className={cn('text-sm font-medium capitalize', i === 0 ? 'text-cream' : 'text-stone/60')}>
              {ORDER_STATUS[h.status]?.label || h.status}
            </p>
            {h.note && <p className="text-stone/40 text-xs mt-0.5">{h.note}</p>}
            <p className="text-stone/30 text-[10px] font-mono mt-1">
              {formatDate(h.timestamp, 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id }         = useParams();
  const queryClient    = useQueryClient();
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey:  ['order', id],
    queryFn:   () => getOrderById(id),
    staleTime: 2 * 60 * 1000,
  });

  const order = data?.data?.order;

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id, cancelReason),
    onSuccess:  () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setCancelModal(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to cancel'),
  });

  const canCancel = ['confirmed', 'processing'].includes(order?.status);
  const status    = order ? (ORDER_STATUS[order.status] || { label: order.status, color: 'text-stone' }) : null;

  return (
    <PageWrapper>
      <DashboardShell>
        {/* Back + header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Link to="/orders" className="p-2 text-stone hover:text-cream transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="eyebrow text-gold/50 text-[10px] mb-1">Order Details</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl text-cream">
                {order?.orderId || 'Loading...'}
              </h1>
              {status && (
                <span className={cn(
                  'text-xs font-mono border px-2.5 py-1',
                  status.color, status.bg, 'border-current/20'
                )}>
                  {status.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : !order ? (
          <div className="text-center py-16">
            <p className="text-stone">Order not found</p>
            <Link to="/orders" className="btn-outline mt-4 inline-block">Back to Orders</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

            {/* Left */}
            <div className="space-y-4">

              {/* Items */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5">
                <p className="eyebrow text-stone/40 text-[10px] mb-4">
                  Items ({order.items?.length})
                </p>
                <div className="space-y-0 divide-y divide-white/[0.05]">
                  {order.items?.map((item) => (
                    <div key={item._id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="w-14 h-16 bg-[#111] border border-white/[0.06] shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={16} className="text-stone/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-cream text-sm font-medium line-clamp-2 mb-1">{item.name}</p>
                        <p className="text-stone/40 text-xs font-mono">SKU: {item.sku}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-stone/50 text-xs">
                            {formatPrice(item.price)} × {item.quantity}
                          </span>
                          <span className="text-cream font-mono text-sm">{formatPrice(item.total)}</span>
                        </div>
                        {/* Item status */}
                        <span className={cn(
                          'inline-block mt-1.5 text-[10px] font-mono border px-2 py-0.5',
                          ORDER_STATUS[item.status]?.color || 'text-stone',
                          ORDER_STATUS[item.status]?.bg    || 'bg-stone/10',
                          'border-current/20'
                        )}>
                          {ORDER_STATUS[item.status]?.label || item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery address */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={13} className="text-gold" />
                  <p className="eyebrow text-stone/40 text-[10px]">Delivery Address</p>
                </div>
                <p className="text-cream text-sm font-medium mb-0.5">
                  {order.deliveryAddress?.fullName}
                </p>
                <p className="text-stone text-xs leading-relaxed">
                  {order.deliveryAddress?.line1}
                  {order.deliveryAddress?.line2 ? `, ${order.deliveryAddress.line2}` : ''},
                  {' '}{order.deliveryAddress?.city}, {order.deliveryAddress?.state}{' '}
                  {order.deliveryAddress?.pincode}
                </p>
                <p className="text-stone/50 text-xs font-mono mt-1">
                  {order.deliveryAddress?.phone}
                </p>
              </div>

              {/* Status history */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Truck size={13} className="text-gold" />
                  <p className="eyebrow text-stone/40 text-[10px]">Order Timeline</p>
                </div>
                <StatusTimeline history={order.statusHistory || []} />
              </div>
            </div>

            {/* Right — Summary + actions */}
            <div className="space-y-4">

              {/* Price */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={13} className="text-gold" />
                  <p className="eyebrow text-stone/40 text-[10px]">Payment Summary</p>
                </div>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Subtotal',          value: formatPrice(order.subtotal) },
                    order.mrpDiscount > 0   && { label: 'Discount',   value: `-${formatPrice(order.mrpDiscount)}`, green: true },
                    order.couponDiscount > 0 && { label: `Coupon (${order.couponCode})`, value: `-${formatPrice(order.couponDiscount)}`, green: true },
                    { label: 'Shipping',           value: order.shippingCharge === 0 ? 'Free' : formatPrice(order.shippingCharge) },
                  ].filter(Boolean).map(({ label, value, green }) => (
                    <div key={label} className="flex justify-between">
                      <span className={green ? 'text-emerald-400/80' : 'text-stone'}>{label}</span>
                      <span className={cn('font-mono', green ? 'text-emerald-400' : 'text-stone')}>{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t border-white/[0.06]">
                    <span className="text-cream font-medium">Total</span>
                    <span className="text-cream font-mono font-medium">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.05]">
                  <p className="text-[10px] text-stone/40 font-mono">
                    Payment:{' '}
                    <span className="text-stone/60 capitalize">
                      {order.isCOD ? 'Cash on Delivery' : 'Online'}
                    </span>
                  </p>
                  <p className="text-[10px] text-stone/40 font-mono mt-0.5">
                    Status:{' '}
                    <span className={cn(
                      order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-yellow-500'
                    )}>
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              {canCancel && (
                <button
                  onClick={() => setCancelModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-vermillion/20 text-vermillion/70 hover:border-vermillion/40 hover:text-vermillion hover:bg-vermillion/5 transition-all text-sm"
                >
                  <XCircle size={14} />
                  Cancel Order
                </button>
              )}

              {order.status === 'delivered' && (
                <Link
                  to={`/products`}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-white/[0.08] text-stone hover:text-cream hover:border-white/20 transition-all text-sm"
                >
                  <RotateCcw size={14} />
                  Buy Again
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Cancel modal */}
        {cancelModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-obsidian/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-full max-w-md bg-[#0d0d0d] border border-white/[0.08] p-6"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
            >
              <p className="font-display text-xl text-cream mb-2">Cancel Order?</p>
              <p className="text-stone text-sm mb-5">
                This action cannot be undone. Refund will be initiated if payment was made.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (required)"
                rows={3}
                className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/30 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => cancelMutation.mutate()}
                  disabled={!cancelReason.trim() || cancelMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-vermillion text-cream text-sm hover:bg-vermillion/80 transition-colors disabled:opacity-40"
                >
                  {cancelMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                  Confirm Cancel
                </button>
                <button
                  onClick={() => setCancelModal(false)}
                  className="px-5 btn-outline text-sm"
                >
                  Keep Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </DashboardShell>
    </PageWrapper>
  );
}