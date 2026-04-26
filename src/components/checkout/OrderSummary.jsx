import { Link }      from 'react-router-dom';
import { motion }    from 'framer-motion';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { useState }  from 'react';
import { cn, formatPrice } from '../../utils/formatters';
import { AnimatePresence } from 'framer-motion';

function OrderItem({ item }) {
  const image = item.variant?.image || item.imageSnapshot;
  const attrs = item.variant?.attributes instanceof Map
    ? Object.fromEntries(item.variant.attributes)
    : item.variant?.attributes || {};

  return (
    <div className="flex gap-3 py-3 border-b border-white/[0.05] last:border-b-0">
      {/* Image with qty badge */}
      <div className="relative w-14 h-16 shrink-0 bg-[#111] border border-white/[0.06] overflow-hidden">
        {image ? (
          <img src={image} alt={item.nameSnapshot} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={14} className="text-stone/20" />
          </div>
        )}
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gold text-obsidian text-[9px] font-mono font-bold flex items-center justify-center rounded-full">
          {item.quantity}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-cream text-xs font-medium line-clamp-2 mb-1">{item.nameSnapshot}</p>
        <div className="flex flex-wrap gap-1 mb-1">
          {Object.entries(attrs).map(([k, v]) => (
            <span key={k} className="text-[10px] text-stone/30 font-mono">{v}</span>
          ))}
        </div>
        <p className="text-cream text-xs font-mono">{formatPrice(item.linePrice)}</p>
      </div>
    </div>
  );
}

export default function OrderSummary({ cart, paymentMethod, walletAmount, selectedAddress }) {
  const [itemsOpen, setItemsOpen] = useState(true);

  if (!cart) return null;

  const {
    items          = [],
    subtotal       = 0,
    mrpDiscount    = 0,
    couponDiscount = 0,
    shippingCharge = 0,
    total          = 0,
    coupon,
  } = cart;

  const effectiveTotal = Math.max(0, total - walletAmount);

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.07] overflow-hidden">
      {/* Header — toggleable items list */}
      <button
        onClick={() => setItemsOpen(!itemsOpen)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <ShoppingBag size={14} className="text-stone/50" />
          <span className="text-sm text-cream font-medium">
            {items.length} Item{items.length !== 1 ? 's' : ''}
          </span>
          <span className="text-gold font-mono text-sm">{formatPrice(total)}</span>
        </div>
        {itemsOpen ? <ChevronUp size={14} className="text-stone/40" /> : <ChevronDown size={14} className="text-stone/40" />}
      </button>

      {/* Items list */}
      <AnimatePresence>
        {itemsOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 py-2 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <OrderItem key={item._id} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price breakdown */}
      <div className="px-5 py-4 space-y-2.5 border-t border-white/[0.06]">
        <div className="flex justify-between text-sm">
          <span className="text-stone">Subtotal</span>
          <span className="text-stone font-mono">{formatPrice(subtotal)}</span>
        </div>

        {mrpDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400/80">Product Discount</span>
            <span className="text-emerald-400 font-mono">-{formatPrice(mrpDiscount)}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400/80">Coupon ({coupon?.code})</span>
            <span className="text-emerald-400 font-mono">-{formatPrice(couponDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-stone">Shipping</span>
          <span className={cn(
            'font-mono',
            shippingCharge === 0 ? 'text-emerald-400' : 'text-stone'
          )}>
            {shippingCharge === 0 ? 'Free' : formatPrice(shippingCharge)}
          </span>
        </div>

        {walletAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gold/80">Wallet Applied</span>
            <span className="text-gold font-mono">-{formatPrice(walletAmount)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="px-5 pb-5 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-cream font-medium">
            {effectiveTotal > 0 ? 'Amount Payable' : 'Total'}
          </span>
          <span className="font-display text-2xl text-cream">
            {formatPrice(effectiveTotal > 0 ? effectiveTotal : total)}
          </span>
        </div>
        <p className="text-[10px] text-stone/30 font-mono mt-1 text-right">
          {paymentMethod === 'cod'
            ? 'Collect on delivery'
            : effectiveTotal === 0
              ? 'Fully covered by wallet'
              : 'Pay via Razorpay'}
        </p>
      </div>

      {/* Delivery address preview */}
      {selectedAddress && (
        <div className="px-5 pb-5 border-t border-white/[0.06] pt-4">
          <p className="eyebrow text-stone/40 text-[10px] mb-2">Delivering to</p>
          <p className="text-cream text-xs font-medium">{selectedAddress.fullName}</p>
          <p className="text-stone/60 text-[11px] leading-relaxed mt-0.5">
            {selectedAddress.line1}
            {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''},
            {' '}{selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
          </p>
        </div>
      )}
    </div>
  );
}