import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { useQuery }     from '@tanstack/react-query';
import { getPublicCoupons } from '../../api/coupon.api';
import { cn, formatPrice }  from '../../utils/formatters';

export default function CouponInput({ appliedCoupon, onApply, onRemove, isLoading, subtotal }) {
  const [code,     setCode]     = useState('');
  const [expanded, setExpanded] = useState(false);
  const inputRef                = useRef(null);

  const { data: couponsData } = useQuery({
    queryKey:  ['public-coupons'],
    queryFn:   getPublicCoupons,
    staleTime: 10 * 60 * 1000,
  });
  const publicCoupons = couponsData?.data?.coupons || [];

  const handleApply = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    onApply(trimmed);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  const handleQuickApply = (couponCode) => {
    setCode(couponCode);
    onApply(couponCode);
    setExpanded(false);
  };

  // Applied state
  if (appliedCoupon && !appliedCoupon.invalid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 px-4 py-3.5"
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-emerald-400 text-sm font-mono font-medium">
              {appliedCoupon.code}
            </p>
            <p className="text-emerald-400/60 text-[10px]">
              Coupon applied successfully
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-stone/40 hover:text-vermillion transition-colors p-1"
          aria-label="Remove coupon"
        >
          <X size={15} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone/40" />
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKey}
            placeholder="Enter coupon code"
            className={cn(
              'w-full bg-[#0f0f0f] border text-cream placeholder:text-stone/25',
              'pl-9 pr-4 py-3 text-sm font-mono outline-none transition-all duration-300',
              code
                ? 'border-gold/40 focus:border-gold/60'
                : 'border-white/[0.07] focus:border-gold/30'
            )}
          />
        </div>
        <motion.button
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          whileTap={{ scale: 0.96 }}
          className={cn(
            'px-4 sm:px-6 py-3 text-xs font-sans font-medium uppercase tracking-widest',
            'transition-all duration-300 whitespace-nowrap flex items-center gap-2',
            code.trim() && !isLoading
              ? 'bg-gold text-obsidian hover:bg-gold-light'
              : 'bg-white/[0.04] text-stone/30 cursor-not-allowed border border-white/[0.06]'
          )}
        >
          {isLoading ? <Loader2 size={13} className="animate-spin" /> : null}
          Apply
        </motion.button>
      </div>

      {/* Public coupons toggle */}
      {publicCoupons.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-[10px] text-gold/60 hover:text-gold transition-colors"
          >
            <Tag size={11} />
            View available offers
            <ChevronDown
              size={11}
              className={cn('transition-transform duration-300', expanded && 'rotate-180')}
            />
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pt-3">
                  {publicCoupons.map((coupon) => {
                    const eligible = !coupon.minOrderValue || subtotal >= coupon.minOrderValue;
                    return (
                      <div
                        key={coupon.code}
                        className={cn(
                          'border p-3 flex items-center justify-between gap-3',
                          eligible
                            ? 'border-white/[0.07] bg-white/[0.02]'
                            : 'border-white/[0.04] bg-transparent opacity-50'
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-gold font-medium">
                              {coupon.code}
                            </span>
                            <span className="text-[10px] text-stone/40 font-mono">
                              {coupon.discountType === 'flat'
                                ? `₹${coupon.discountValue} off`
                                : `${coupon.discountValue}% off`}
                              {coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ''}
                            </span>
                          </div>
                          {coupon.description && (
                            <p className="text-[10px] text-stone/40 truncate">{coupon.description}</p>
                          )}
                          {coupon.minOrderValue > 0 && !eligible && (
                            <p className="text-[10px] text-yellow-500/70 mt-0.5">
                              Min. order: {formatPrice(coupon.minOrderValue)}
                            </p>
                          )}
                        </div>
                        {eligible && (
                          <button
                            onClick={() => handleQuickApply(coupon.code)}
                            className="shrink-0 text-[10px] text-gold border border-gold/30 px-2.5 py-1.5 hover:bg-gold/10 transition-colors font-mono whitespace-nowrap"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}