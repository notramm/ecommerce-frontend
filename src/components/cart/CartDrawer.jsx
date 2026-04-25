import { useEffect }  from 'react';
import { Link }       from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useUIStore    from '../../store/uiStore';
import useAuthStore  from '../../store/authStore';
import useCartStore  from '../../store/cartStore';
import api           from '../../api/axios';
import { cn, formatPrice } from '../../utils/formatters';
import { toast }     from 'sonner';
import { Skeleton }  from '../ui/Skeleton';
import Spinner       from '../ui/Spinner';

function GuestCartItem({ item, onRemove, onQtyChange }) {
  return (
    <div className="flex gap-3 py-4 border-b border-white/[0.06]">
      <div className="w-16 h-20 bg-[#111] shrink-0 overflow-hidden border border-white/[0.06]">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={16} className="text-stone/20" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-cream text-xs font-medium line-clamp-2 mb-1">{item.name}</p>
        <p className="text-stone/40 text-[10px] font-mono mb-3">{item.sku}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-white/[0.08]">
            <button
              onClick={() => onQtyChange(item, Math.max(1, item.quantity - 1))}
              className="w-7 h-7 flex items-center justify-center text-stone hover:text-cream transition-colors"
            >
              <Minus size={11} />
            </button>
            <span className="w-6 text-center text-xs font-mono text-cream">{item.quantity}</span>
            <button
              onClick={() => onQtyChange(item, Math.min(10, item.quantity + 1))}
              className="w-7 h-7 flex items-center justify-center text-stone hover:text-cream transition-colors"
            >
              <Plus size={11} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cream text-xs font-mono">{formatPrice(item.price * item.quantity)}</span>
            <button
              onClick={() => onRemove(item)}
              className="text-stone/40 hover:text-vermillion transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServerCartItem({ item, onRemove, onQtyChange, loading }) {
  return (
    <div className="flex gap-3 py-4 border-b border-white/[0.06]">
      <div className="w-16 h-20 bg-[#111] shrink-0 overflow-hidden border border-white/[0.06]">
        {item.variant?.image ? (
          <img src={item.variant.image} alt={item.nameSnapshot} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={16} className="text-stone/20" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-cream text-xs font-medium line-clamp-2 mb-1">{item.nameSnapshot}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {item.variant?.attributes && Object.entries(
            item.variant.attributes instanceof Map
              ? Object.fromEntries(item.variant.attributes)
              : item.variant.attributes
          ).map(([k, v]) => (
            <span key={k} className="text-[10px] text-stone/40 font-mono">{v}</span>
          ))}
        </div>

        {/* Price change warning */}
        {item.priceChanged && (
          <p className="text-[10px] text-yellow-500 mb-2">
            Price updated: {formatPrice(item.variant?.price)}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center border border-white/[0.08]">
            <button
              onClick={() => onQtyChange(item._id, item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-stone hover:text-cream transition-colors disabled:opacity-30"
            >
              <Minus size={11} />
            </button>
            <span className="w-6 text-center text-xs font-mono text-cream">{item.quantity}</span>
            <button
              onClick={() => onQtyChange(item._id, item.quantity + 1)}
              disabled={loading || item.quantity >= 10}
              className="w-7 h-7 flex items-center justify-center text-stone hover:text-cream transition-colors disabled:opacity-30"
            >
              <Plus size={11} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cream text-xs font-mono">{formatPrice(item.linePrice)}</span>
            <button
              onClick={() => onRemove(item._id)}
              disabled={loading}
              className="text-stone/40 hover:text-vermillion transition-colors disabled:opacity-30"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { cartOpen, closeCart }                 = useUIStore();
  const { isLoggedIn }                          = useAuthStore();
  const { items, addGuestItem, clearGuestCart,
          serverCart, setServerCart }            = useCartStore();
  const queryClient                             = useQueryClient();

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  // Fetch server cart
  const { isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn:  async () => {
      const { data } = await api.get('/cart');
      setServerCart(data.data);
      return data.data;
    },
    enabled:   isLoggedIn && cartOpen,
    staleTime: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) =>
      quantity === 0
        ? api.delete(`/cart/items/${itemId}`)
        : api.put(`/cart/items/${itemId}`, { quantity }),
    onSuccess: (res) => {
      setServerCart(res.data.data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update cart'),
  });

  const handleGuestQtyChange = (item, qty) => {
    if (qty === 0) {
      const updated = items.filter((i) => !(i.productId === item.productId && i.variantId === item.variantId));
      useCartStore.setState({ items: updated });
    } else {
      const updated = items.map((i) =>
        i.productId === item.productId && i.variantId === item.variantId
          ? { ...i, quantity: qty }
          : i
      );
      useCartStore.setState({ items: updated });
    }
  };

  // Totals
  const guestTotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const displayItems  = isLoggedIn ? serverCart?.items || [] : items;
  const displayTotal  = isLoggedIn ? serverCart?.total || 0 : guestTotal;
  const itemCount     = isLoggedIn ? serverCart?.itemCount || 0 : items.reduce((s, i) => s + i.quantity, 0);
  const stockWarnings = serverCart?.stockWarnings || [];

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-obsidian/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] bg-[#0d0d0d] border-l border-white/[0.07] flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={16} className="text-gold" />
                <span className="eyebrow text-stone/60 text-[10px]">Your Cart</span>
                {itemCount > 0 && (
                  <span className="w-5 h-5 bg-gold text-obsidian text-[10px] font-mono font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 text-stone hover:text-cream transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stock warnings */}
            {stockWarnings.length > 0 && (
              <div className="px-5 py-3 bg-yellow-500/5 border-b border-yellow-500/20">
                {stockWarnings.slice(0, 2).map((w, i) => (
                  <p key={i} className="text-[10px] text-yellow-500 font-mono">{w.message}</p>
                ))}
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5">
              {isLoading && isLoggedIn ? (
                <div className="space-y-4 py-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-16 h-20 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-7 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
                    <ShoppingBag size={24} className="text-stone/20" />
                  </div>
                  <p className="font-display text-xl text-cream mb-2">Your cart is empty</p>
                  <p className="text-stone text-sm mb-8">Discover our curated collection</p>
                  <button
                    onClick={closeCart}
                    className="btn-outline text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div>
                  {isLoggedIn
                    ? displayItems.map((item) => (
                        <ServerCartItem
                          key={item._id}
                          item={item}
                          loading={updateMutation.isPending}
                          onRemove={(id) => updateMutation.mutate({ itemId: id, quantity: 0 })}
                          onQtyChange={(id, qty) => updateMutation.mutate({ itemId: id, quantity: qty })}
                        />
                      ))
                    : items.map((item, i) => (
                        <GuestCartItem
                          key={i}
                          item={item}
                          onRemove={(it) => handleGuestQtyChange(it, 0)}
                          onQtyChange={handleGuestQtyChange}
                        />
                      ))
                  }
                </div>
              )}
            </div>

            {/* Footer */}
            {displayItems.length > 0 && (
              <div className="px-5 py-5 border-t border-white/[0.07] space-y-4 shrink-0">
                {/* Coupon hint */}
                {isLoggedIn && serverCart?.coupon && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone/50 font-mono">Coupon: {serverCart.coupon.code}</span>
                    <span className="text-emerald-400 font-mono">
                      -₹{serverCart.couponDiscount?.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Shipping hint */}
                {displayTotal < 499 && (
                  <div className="text-xs text-stone/50 text-center">
                    Add{' '}
                    <span className="text-cream">{formatPrice(499 - displayTotal)}</span>
                    {' '}more for free shipping
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-stone text-sm">Subtotal</span>
                  <span className="font-display text-xl text-cream">
                    {formatPrice(displayTotal)}
                  </span>
                </div>

                {/* CTA */}
                <div className="space-y-2">
                  <Link
                    to={isLoggedIn ? '/checkout' : '/login?redirect=/checkout'}
                    onClick={closeCart}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-3 group"
                  >
                    {isLoggedIn ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full btn-ghost text-stone text-xs py-2"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}