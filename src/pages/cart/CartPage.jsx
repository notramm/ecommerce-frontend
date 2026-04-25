import { useState, useEffect }  from 'react';
import { Link, useNavigate }     from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Trash2, RefreshCw } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import CartItem      from '../../components/cart/CartItem';
import CartSummary   from '../../components/cart/CartSummary';
import { useServerCart }  from '../../hooks/useCart';
import useAuthStore  from '../../store/authStore';
import useCartStore  from '../../store/cartStore';
import { Skeleton }  from '../../components/ui/Skeleton';
import { cn, formatPrice } from '../../utils/formatters';
import { toast }     from 'sonner';

// ── Guest cart view ────────────────────────────────────────────────────────────
function GuestCartItem({ item, onUpdate, onRemove }) {
  const { ShoppingBag: SB, Minus, Plus, Trash2: T2 } = require('lucide-react');
  return (
    <div className="flex gap-4 py-5 border-b border-white/[0.06]">
      <div className="w-20 h-24 sm:w-24 sm:h-28 bg-[#111] border border-white/[0.06] shrink-0 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={20} className="text-stone/20" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-cream text-sm font-medium line-clamp-2 mb-1">{item.name}</p>
          <p className="text-stone/40 text-[10px] font-mono">{item.sku}</p>
        </div>
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div className="flex items-center border border-white/[0.1]">
            <button
              onClick={() => onUpdate(item, Math.max(1, item.quantity - 1))}
              className="w-8 h-8 flex items-center justify-center text-stone hover:text-cream transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-sm font-mono text-cream">{item.quantity}</span>
            <button
              onClick={() => onUpdate(item, Math.min(10, item.quantity + 1))}
              className="w-8 h-8 flex items-center justify-center text-stone hover:text-cream transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cream font-mono text-sm">{formatPrice(item.price * item.quantity)}</span>
            <button onClick={() => onRemove(item)} className="text-stone/30 hover:text-vermillion transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stock warning banner ───────────────────────────────────────────────────────
function StockWarnings({ warnings }) {
  if (!warnings?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-500/5 border border-yellow-500/20 p-4 mb-4"
    >
      <p className="text-yellow-500 text-xs font-mono font-medium mb-2">Cart Updates</p>
      <ul className="space-y-1.5">
        {warnings.map((w, i) => (
          <li key={i} className="text-yellow-500/70 text-xs flex items-start gap-2">
            <span className="mt-0.5 shrink-0">•</span>
            {w.message}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ── Empty cart ─────────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20 sm:py-32 text-center px-6"
    >
      <motion.div
        className="w-20 h-20 sm:w-24 sm:h-24 bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-6 sm:mb-8"
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ShoppingBag size={32} className="text-stone/20" />
      </motion.div>

      <h2 className="font-display text-2xl sm:text-3xl text-cream mb-3">Your cart is empty</h2>
      <p className="text-stone text-sm max-w-xs mb-8 sm:mb-10 leading-relaxed">
        Looks like you haven't added anything yet. Discover our curated collection.
      </p>

      <Link to="/products" className="btn-primary flex items-center gap-3 group">
        Continue Shopping
        <ArrowLeft
          size={15}
          className="rotate-180 group-hover:translate-x-1 transition-transform"
        />
      </Link>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CartPage() {
  const { isLoggedIn }                                        = useAuthStore();
  const { items, setServerCart }                              = useCartStore();
  const { data: serverCart, isLoading, updateItem,
          removeItem, applyCoupon, removeCoupon,
          clearCart, isUpdating, isCouponing }                = useServerCart();
  const navigate                                              = useNavigate();

  const displayCart  = isLoggedIn ? serverCart : null;
  const displayItems = isLoggedIn
    ? serverCart?.items || []
    : items;

  const guestTotal   = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const isEmpty      = isLoggedIn ? displayItems.length === 0 : items.length === 0;

  const updateGuestItem = (item, qty) => {
    if (qty === 0) {
      useCartStore.setState({
        items: items.filter((i) =>
          !(i.productId === item.productId && i.variantId === item.variantId)
        ),
      });
    } else {
      useCartStore.setState({
        items: items.map((i) =>
          i.productId === item.productId && i.variantId === item.variantId
            ? { ...i, quantity: qty }
            : i
        ),
      });
    }
  };

  const handleClearCart = () => {
    if (!isLoggedIn) {
      useCartStore.setState({ items: [] });
      toast.success('Cart cleared');
      return;
    }
    clearCart();
  };

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 pt-6 sm:pt-8 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <p className="eyebrow text-gold/50 mb-2 text-[10px] sm:text-xs">Shopping</p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-cream">
              Your Cart
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isEmpty && (
              <button
                onClick={handleClearCart}
                className="flex items-center gap-2 text-xs text-stone/40 hover:text-vermillion transition-colors"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Clear cart</span>
              </button>
            )}
            <Link
              to="/products"
              className="flex items-center gap-2 text-xs text-stone hover:text-cream transition-colors"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Continue shopping</span>
            </Link>
          </div>
        </div>

        {/* Content */}
        {isLoading && isLoggedIn ? (
          /* Skeleton */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 xl:gap-12">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 py-5 border-b border-white/[0.06]">
                  <Skeleton className="w-24 h-28 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-8 w-28 mt-4" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-[500px]" />
          </div>
        ) : isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-8 xl:gap-12 items-start">

            {/* Cart items */}
            <div>
              {/* Stock warnings */}
              {isLoggedIn && (
                <StockWarnings warnings={serverCart?.stockWarnings} />
              )}

              {/* Free shipping progress */}
              {!isLoggedIn && guestTotal < 499 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 bg-emerald-500/5 border border-emerald-500/20 p-4"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-emerald-400/70">Free shipping progress</span>
                    <span className="text-emerald-400 font-mono">
                      {formatPrice(499 - guestTotal)} away
                    </span>
                  </div>
                  <div className="h-1 bg-white/[0.05]">
                    <motion.div
                      className="h-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (guestTotal / 499) * 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Items */}
              <AnimatePresence>
                {isLoggedIn
                  ? displayItems.map((item) => (
                      <CartItem
                        key={item._id}
                        item={item}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                        isUpdating={isUpdating}
                      />
                    ))
                  : items.map((item, i) => (
                      <GuestCartItem
                        key={`${item.productId}-${item.variantId}`}
                        item={item}
                        onUpdate={updateGuestItem}
                        onRemove={(it) => updateGuestItem(it, 0)}
                      />
                    ))
                }
              </AnimatePresence>

              {/* Sign-in prompt for guests */}
              {!isLoggedIn && items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 bg-gold/5 border border-gold/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-cream text-sm font-medium mb-0.5">Sign in to save your cart</p>
                    <p className="text-stone/60 text-xs">
                      Access exclusive coupons and track your orders
                    </p>
                  </div>
                  <Link to="/login" className="btn-outline text-xs whitespace-nowrap shrink-0">
                    Sign In
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-[calc(var(--nav-height)+24px)]">
              {isLoggedIn && serverCart ? (
                <CartSummary
                  cart={serverCart}
                  onApplyCoupon={applyCoupon}
                  onRemoveCoupon={removeCoupon}
                  isCouponing={isCouponing}
                />
              ) : !isLoggedIn && items.length > 0 ? (
                /* Guest summary */
                <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6 space-y-5">
                  <p className="eyebrow text-stone/50 text-[10px]">Order Summary</p>
                  <div className="space-y-2 border-b border-white/[0.06] pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone">Subtotal</span>
                      <span className="text-cream font-mono">{formatPrice(guestTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone">Shipping</span>
                      <span className={cn('font-mono', guestTotal >= 499 ? 'text-emerald-400' : 'text-stone')}>
                        {guestTotal >= 499 ? 'Free' : formatPrice(49)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cream font-medium">Total</span>
                    <span className="font-display text-2xl text-cream">
                      {formatPrice(guestTotal + (guestTotal >= 499 ? 0 : 49))}
                    </span>
                  </div>
                  <Link
                    to="/login?redirect=/checkout"
                    className="w-full btn-primary py-4 flex items-center justify-center gap-3 group text-sm"
                  >
                    Sign in to Checkout
                    <ArrowLeft
                      size={15}
                      className="rotate-180 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}