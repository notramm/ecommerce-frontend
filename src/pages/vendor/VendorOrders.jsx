import { useState }  from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion }    from 'framer-motion';
import { Package, ChevronDown, Loader2, Printer } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import DashboardShell from '../../components/layout/DashboardShell';
import { Skeleton }  from '../../components/ui/Skeleton';
import { getVendorOrders, updateItemStatus, getShippingLabel } from '../../api/vendor.api';
import { cn, formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUS }    from '../../utils/constants';
import { toast }     from 'sonner';

const VENDOR_TRANSITIONS = {
  confirmed:  ['processing'],
  processing: ['packed'],
  packed:     ['shipped'],
};

const STATUS_TABS = [
  { value: '',           label: 'All' },
  { value: 'confirmed',  label: 'New' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed',     label: 'Packed' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
];

function VendorOrderRow({ order, items, onUpdateStatus }) {
  const [expanded,   setExpanded]   = useState(false);
  const [tracking,   setTracking]   = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatus = async (itemId, status) => {
    setUpdatingId(itemId);
    await onUpdateStatus(itemId, { status, trackingNumber: tracking || undefined });
    setUpdatingId(null);
  };

  const handleLabel = async () => {
    try {
      const { data } = await getShippingLabel(order._id);
      const label    = data.data.label;
      // Open print-friendly window
      const win = window.open('', '_blank');
      win.document.write(`
        <html><head><title>Shipping Label</title>
        <style>body{font-family:monospace;padding:20px}h2{margin-bottom:10px}p{margin:4px 0}</style>
        </head><body>
        <h2>SHIPPING LABEL — ${label.orderId}</h2>
        <hr/>
        <h3>Ship To:</h3>
        <p><strong>${label.ship_to.name}</strong></p>
        <p>${label.ship_to.address}, ${label.ship_to.city}</p>
        <p>${label.ship_to.state} — ${label.ship_to.pincode}</p>
        <p>Phone: ${label.ship_to.phone}</p>
        <hr/>
        <p><strong>Payment:</strong> ${label.paymentMethod}</p>
        ${label.codAmount ? `<p><strong>COD Amount:</strong> ₹${label.codAmount}</p>` : ''}
        <hr/>
        <h3>Items:</h3>
        ${label.items.map((i) => `<p>${i.name} × ${i.quantity}</p>`).join('')}
        </body></html>
      `);
      win.print();
    } catch { toast.error('Failed to generate label'); }
  };

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.07] overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 sm:p-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-gold font-mono text-xs">{order.orderId}</span>
            {order.isCOD && (
              <span className="text-[10px] font-mono border border-blue-400/20 bg-blue-400/5 text-blue-400 px-2 py-0.5">COD</span>
            )}
          </div>
          <p className="text-stone/50 text-xs">{formatDate(order.createdAt)} · {items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-right shrink-0 mr-2">
          <p className="text-cream font-mono text-sm">{formatPrice(items.reduce((s, i) => s + i.total, 0))}</p>
          <p className="text-stone/40 text-[10px] capitalize">{order.deliveryAddress?.city}</p>
        </div>
        <ChevronDown size={14} className={cn('text-stone/40 transition-transform shrink-0', expanded && 'rotate-180')} />
      </button>

      {/* Expanded items */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="border-t border-white/[0.06] px-4 sm:px-5 py-4 space-y-4"
        >
          {/* Delivery address */}
          <div className="text-xs text-stone/50 bg-[#0a0a0a] border border-white/[0.05] p-3">
            <p className="text-cream font-medium mb-1">{order.deliveryAddress?.fullName}</p>
            <p>{order.deliveryAddress?.line1}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.pincode}</p>
            <p className="font-mono mt-0.5">{order.deliveryAddress?.phone}</p>
          </div>

          {/* Tracking input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tracking number (optional)"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="flex-1 bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/30 text-cream placeholder:text-stone/20 px-3 py-2 text-xs outline-none"
            />
            <button
              onClick={handleLabel}
              className="flex items-center gap-1.5 px-3 py-2 border border-white/[0.08] text-stone hover:text-cream hover:border-gold/20 transition-all text-xs"
            >
              <Printer size={12} /> Label
            </button>
          </div>

          {/* Items */}
          {items.map((item) => {
            const nextStatuses = VENDOR_TRANSITIONS[item.status] || [];
            const sStyle = ORDER_STATUS[item.status] || { label: item.status, color: 'text-stone' };

            return (
              <div key={item._id} className="flex items-center gap-3 flex-wrap">
                <div className="w-12 h-14 bg-[#111] border border-white/[0.06] shrink-0 overflow-hidden">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-stone/20" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cream text-xs font-medium line-clamp-1">{item.name}</p>
                  <p className="text-stone/40 text-[10px] font-mono">Qty: {item.quantity} · {formatPrice(item.total)}</p>
                  <span className={cn('text-[10px] font-mono', sStyle.color)}>{sStyle.label}</span>
                </div>

                {/* Status action buttons */}
                {nextStatuses.length > 0 && (
                  <div className="flex gap-1.5 shrink-0 flex-wrap">
                    {nextStatuses.map((ns) => (
                      <button
                        key={ns}
                        onClick={() => handleStatus(item._id, ns)}
                        disabled={updatingId === item._id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gold/10 border border-gold/30 text-gold text-[10px] font-mono hover:bg-gold/20 transition-colors disabled:opacity-40"
                      >
                        {updatingId === item._id && <Loader2 size={10} className="animate-spin" />}
                        Mark {ns}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default function VendorOrders() {
  const [tab, setTab]    = useState('');
  const queryClient      = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey:  ['vendor-orders', tab],
    queryFn:   async () => { const {data} = await getVendorOrders({ status: tab || undefined, limit: 30 }); return data.data; },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }) => updateItemStatus(itemId, data),
    onSuccess:  () => { toast.success('Status updated'); queryClient.invalidateQueries({ queryKey: ['vendor-orders'] }); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const orders = data?.orders || [];

  return (
    <PageWrapper>
      <DashboardShell title="Vendor Orders" subtitle="Fulfillment">
        <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-none">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'px-3 py-1.5 text-[10px] font-mono whitespace-nowrap border transition-all shrink-0',
                tab === t.value
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-white/[0.07] text-stone/60 hover:text-cream'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={28} className="mx-auto text-stone/20 mb-4" />
            <p className="text-stone text-sm">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <VendorOrderRow
                key={order._id}
                order={order}
                items={order.items || []}
                onUpdateStatus={(itemId, data) => updateMutation.mutate({ itemId, data })}
              />
            ))}
          </div>
        )}
      </DashboardShell>
    </PageWrapper>
  );
}