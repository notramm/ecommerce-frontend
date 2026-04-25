import { useState }  from 'react';
import { Link }      from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import PageWrapper   from '../../components/layout/PageWrapper';
import { useWishlist } from '../../hooks/useCart';
import { Skeleton }  from '../../components/ui/Skeleton';
import { cn, formatPrice, formatDiscount } from '../../utils/formatters';
import RatingStars   from '../../components/product/RatingStars';
import { toast }     from 'sonner';

// ── Variant picker mini modal ─────────────────────────────────────────────────
function VariantPicker({ product, onSelect, onClose }) {
  const [selected, setSelected] = useState(product.variants?.[0]?._id || null);
  const activeVariants = product.variants?.filter((v) => v.isActive && v.stock > 0) || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-x-0 bottom-0 z-20 bg-[#111] border border-white/[0.1] p-4 shadow-card"
    >
      <p className="eyebrow text-stone/50 text-[10px] mb-3">Select Variant</p>
      {activeVariants.length === 0 ? (
        <p className="text-stone text-xs text-center py-2">All variants out of stock</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {activeVariants.map((v) => {
              const attrs = v.attributes instanceof Map
                ? Object.fromEntries(v.attributes)
                : v.attributes || {};
              const label = Object.values(attrs).join(' / ') || v.sku;
              return (
                <button
                  key={v._id}
                  onClick={() => setSelected(v._id)}
                  className={cn(
                    'px-3 py-1.5 text-[10px] font-mono border transition-all',
                    selected === v._id
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-white/[0.1] text-stone hover:border-white/30'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSelect(selected)}
              disabled={!selected}
              className="flex-1 bg-gold text-obsidian text-xs font-medium py-2.5 uppercase tracking-widest hover:bg-gold-light disabled:opacity-40 transition-colors"
            >
              Move to Cart
            </button>
            <button
              onClick={onClose}
              className="px-4 border border-white/[0.1] text-stone hover:text-cream transition-colors text-xs"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ── Wishlist card ─────────────────────────────────────────────────────────────
function WishlistCard({ item, onRemove, onMove, isRemoving, isMoving }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const product   = item.product;
  const variant   = item.variant;
  const image     = product?.image || product?.images?.[0]?.url;
  const price     = variant?.price  || product?.basePrice  || 0;
  const mrp       = variant?.mrp    || product?.baseMrp    || 0;
  const discount  = mrp > price ? formatDiscount(mrp, price) : 0;
  const inStock   = product?.inStock !== false;

  const handleMove = (variantId) => {
    if (!variantId) { toast.error('Select a variant'); return; }
    onMove({ productId: product._id, variantId });
    setPickerOpen(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.25 } }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-[#0f0f0f] border border-white/[0.06] hover:border-gold/15 transition-colors duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#111]">
        {image ? (
          <img
            src={image}
            alt={product?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={24} className="text-stone/15" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-vermillion text-cream text-[9px] font-mono px-1.5 py-0.5">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <span className="bg-[#1a1a1a] text-stone/60 text-[9px] font-mono px-1.5 py-0.5 border border-white/[0.06]">
              Sold Out
            </span>
          )}
        </div>

        {/* Remove */}
        <button
          onClick={() => onRemove(product._id)}
          disabled={isRemoving}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-obsidian/80 backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-stone hover:text-vermillion hover:border-vermillion/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Remove from wishlist"
        >
          <Trash2 size={13} />
        </button>

        {/* Move to cart overlay */}
        {inStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <button
              onClick={() => setPickerOpen(true)}
              disabled={isMoving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-cream text-obsidian text-xs font-medium uppercase tracking-widest hover:bg-gold transition-colors"
            >
              <ShoppingBag size={12} />
              Move to Cart
            </button>
          </div>
        )}

        {/* Variant picker */}
        <AnimatePresence>
          {pickerOpen && (
            <VariantPicker
              product={product}
              onSelect={handleMove}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <p className="text-[10px] text-stone/40 font-mono uppercase tracking-widest mb-1 truncate">
          {product?.brand || 'LUXE'}
        </p>
        <Link
          to={`/products/${product?.slug}`}
          className="text-cream text-xs sm:text-sm font-medium line-clamp-2 hover:text-gold transition-colors duration-200 block mb-2"
        >
          {product?.name}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-cream font-mono text-sm">{formatPrice(price)}</span>
            {mrp > price && (
              <span className="text-stone/30 text-[10px] font-mono line-through ml-2">
                {formatPrice(mrp)}
              </span>
            )}
          </div>
          {product?.rating?.average > 0 && (
            <RatingStars value={product.rating.average} showCount={false} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyWishlist() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 sm:py-32 text-center px-6"
    >
      <motion.div
        className="w-20 h-20 sm:w-24 sm:h-24 bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-6 sm:mb-8"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Heart size={32} className="text-stone/15" />
      </motion.div>
      <h2 className="font-display text-2xl sm:text-3xl text-cream mb-3">Nothing saved yet</h2>
      <p className="text-stone text-sm max-w-xs mb-8 sm:mb-10 leading-relaxed">
        Save products you love for later. Your wishlist is waiting.
      </p>
      <Link to="/products" className="btn-primary flex items-center gap-3 group">
        Discover Products
        <ArrowLeft size={15} className="rotate-180 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { data, isLoading, removeItem, moveToCart, isRemoving, isMoving } = useWishlist();

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 pt-6 sm:pt-8 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <p className="eyebrow text-gold/50 mb-2 text-[10px] sm:text-xs">Saved</p>
            <div className="flex items-baseline gap-3">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-cream">
                Wishlist
              </h1>
              {total > 0 && (
                <span className="text-stone/40 font-mono text-sm">{total} item{total !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 text-xs text-stone hover:text-cream transition-colors"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Continue shopping</span>
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            {/* Batch actions */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.06]">
              <p className="text-xs text-stone/50">
                {items.filter((i) => i.product?.inStock !== false).length} items available
              </p>
            </div>

            {/* Grid */}
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
            >
              <AnimatePresence>
                {items.map((item) => (
                  <WishlistCard
                    key={item._id}
                    item={item}
                    onRemove={removeItem}
                    onMove={moveToCart}
                    isRemoving={isRemoving}
                    isMoving={isMoving}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}