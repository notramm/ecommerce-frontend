import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Info, ChevronDown } from 'lucide-react';
import CouponInput  from './CouponInput';
import { cn, formatPrice } from '../../utils/formatters';

function PriceLine({ label, value, className, highlight, info }) {
  return (
    <motion.div
      layout
      className={cn('flex items-center justify-between py-2', className)}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn('text-sm', highlight ? 'text-cream font-medium' : 'text-stone')}>
          {label}
        </span>
        {info && (
          <div className="group relative">
            <Info size={12} className="text-stone/30 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-[#1a1a1a] border border-white/[0.08] px-3 py-2 text-[10px] text-stone opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {info}
            </div>
          </div>
        )}
      </div>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'font-mono text-sm tabular-nums',
          highlight ? 'text-cream text-base font-medium' : 'text-stone'
        )}
      >
        {value}
      </motion.span>
    </motion.div>
  );
}

export default function CartSummary({ cart, onApplyCoupon, onRemoveCoupon, isCouponing }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!cart) return null;

  const {
    subtotal       = 0,
    mrpTotal       = 0,
    mrpDiscount    = 0,
    couponDiscount = 0,
    shippingCharge = 0,
    total          = 0,
    coupon,
    savings        = 0,
    itemCount      = 0,
  } = cart;

  const hasSavings  = savings > 0;
  const isFreeShip  = shippingCharge === 0;

  return (
    <motion.div
      layout
      className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="eyebrow text-stone/50 text-[10px]">Order Summary</p>
        <span className="text-[10px] text-stone/30 font-mono">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Price breakdown */}
      <div className="space-y-0 divide-y divide-white/[0.04]">
        <PriceLine label="Subtotal" value={formatPrice(subtotal)} />

        {mrpDiscount > 0 && (
          <PriceLine
            label="Product Discount"
            value={`-${formatPrice(mrpDiscount)}`}
            className="text-emerald-400"
          />
        )}

        {/* Coupon section */}
        <div className="py-3">
          <CouponInput
            appliedCoupon={coupon}
            onApply={onApplyCoupon}
            onRemove={onRemoveCoupon}
            isLoading={isCouponing}
            subtotal={subtotal}
          />
        </div>

        {couponDiscount > 0 && (
          <PriceLine
            label={`Coupon (${coupon?.code})`}
            value={`-${formatPrice(couponDiscount)}`}
            className="text-emerald-400"
          />
        )}

        <PriceLine
          label="Shipping"
          value={isFreeShip ? 'Free' : formatPrice(shippingCharge)}
          className={isFreeShip ? 'text-emerald-400' : ''}
          info={isFreeShip
            ? 'You qualify for free shipping!'
            : 'Add more items to get free shipping'}
        />
      </div>

      {/* Total */}
      <div className="border-t border-white/[0.08] pt-4">
        <div className="flex items-center justify-between">
          <span className="text-cream font-medium">Total</span>
          <motion.span
            key={total}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1,    opacity: 1 }}
            className="font-display text-2xl text-cream"
          >
            {formatPrice(total)}
          </motion.span>
        </div>

        {hasSavings && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-emerald-400 text-xs font-mono mt-1.5 text-right"
          >
            You save {formatPrice(savings)} on this order 🎉
          </motion.p>
        )}
      </div>

      {/* Tax note */}
      <p className="text-[10px] text-stone/30 text-center font-mono">
        Inclusive of all taxes
      </p>

      {/* CTA */}
      <Link
        to="/checkout"
        className="w-full btn-primary py-4 sm:py-5 flex items-center justify-center gap-3 group text-sm"
      >
        Proceed to Checkout
        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
      </Link>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <ShieldCheck size={13} className="text-stone/30" />
        <span className="text-[10px] text-stone/30">100% Secure & Encrypted</span>
      </div>

      {/* Payment icons */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {['UPI', 'Cards', 'NetBanking', 'COD'].map((method) => (
          <span
            key={method}
            className="text-[9px] font-mono text-stone/25 border border-white/[0.04] px-2 py-1"
          >
            {method}
          </span>
        ))}
      </div>
    </motion.div>
  );
}