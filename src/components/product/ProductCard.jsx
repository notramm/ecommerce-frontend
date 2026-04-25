import { useState, useCallback } from 'react';
import { Link }    from 'react-router-dom';
import { motion }  from 'framer-motion';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { cn, formatPrice, formatDiscount } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { toast }   from 'sonner';
import api          from '../../api/axios';

export default function ProductCard({ product, priority = false, listView = false }) {
  const [wishlisted,  setWishlisted]  = useState(false);
  const [addingCart,  setAddingCart]  = useState(false);
  const [imgLoaded,   setImgLoaded]   = useState(false);
  const { isLoggedIn }                = useAuthStore();
  const { addGuestItem, setServerCart } = useCartStore();

  const image        = product?.images?.[0]?.url || product?.variants?.[0]?.images?.[0]?.url || null;
  const price        = product?.basePrice  || 0;
  const mrp          = product?.baseMrp    || 0;
  const discount     = mrp > price ? formatDiscount(mrp, price) : 0;
  const firstVariant = product?.variants?.[0];
  const inStock      = product?.totalStock > 0;

  const handleWishlist = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { toast.error('Sign in to add to wishlist'); return; }
    try {
      if (wishlisted) {
        await api.delete(`/users/wishlist/${product._id}`);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/users/wishlist', { productId: product._id });
        toast.success('Added to wishlist');
      }
      setWishlisted((p) => !p);
    } catch { toast.error('Failed'); }
  }, [wishlisted, isLoggedIn, product._id]);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    if (!inStock) { toast.error('Out of stock'); return; }

    if (!isLoggedIn) {
      addGuestItem({
        productId: product._id,
        variantId: firstVariant._id,
        quantity:  1,
        name:      product.name,
        price:     firstVariant.price,
        image:     image || '',
        sku:       firstVariant.sku,
      });
      toast.success('Added to cart');
      return;
    }

    setAddingCart(true);
    try {
      const { data } = await api.post('/cart/add', {
        productId: product._id,
        variantId: firstVariant._id,
        quantity:  1,
      });
      setServerCart(data.data);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setAddingCart(false);
    }
  }, [isLoggedIn, product, firstVariant, image, addGuestItem, setServerCart, inStock]);

  // ── List view ───────────────────────────────────────────────────────────────
  if (listView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="group"
      >
        <Link
          to={`/products/${product.slug}`}
          className="flex gap-4 sm:gap-6 p-4 sm:p-5 bg-[#0f0f0f] border border-white/[0.06] hover:border-gold/20 transition-all duration-300"
        >
          {/* Thumbnail */}
          <div className="relative w-24 sm:w-32 aspect-square shrink-0 overflow-hidden bg-[#111]">
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}
            {image ? (
              <img
                src={image}
                alt={product.name}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setImgLoaded(true)}
                className={cn(
                  'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
                  imgLoaded ? 'opacity-100' : 'opacity-0'
                )}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag size={20} className="text-stone/20" />
              </div>
            )}
            {discount > 0 && (
              <span className="absolute top-2 left-2 bg-vermillion text-cream text-[9px] font-mono px-1.5 py-0.5">
                -{discount}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
            <div>
              <p className="text-[10px] text-stone/40 font-mono uppercase tracking-widest mb-1">
                {product.brand || product.category?.name}
              </p>
              <h3 className="text-cream text-sm sm:text-base font-medium line-clamp-2 mb-2 group-hover:text-gold transition-colors duration-300">
                {product.name}
              </h3>
              {product.rating?.count > 0 && (
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={i < Math.round(product.rating.average) ? 'text-gold fill-gold' : 'text-stone/20'}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone/40 font-mono">
                    ({product.rating.count})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-cream font-mono text-base sm:text-lg">{formatPrice(price)}</span>
                {mrp > price && (
                  <span className="text-stone/40 text-xs font-mono line-through">{formatPrice(mrp)}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleWishlist}
                  whileTap={{ scale: 0.85 }}
                  className="w-8 h-8 border border-white/[0.08] flex items-center justify-center text-stone hover:text-cream hover:border-gold/30 transition-all"
                >
                  <Heart
                    size={13}
                    className={wishlisted ? 'fill-gold text-gold' : ''}
                  />
                </motion.button>
                <motion.button
                  onClick={handleAddToCart}
                  disabled={addingCart || !inStock}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-xs font-sans font-medium uppercase tracking-wider transition-all duration-200',
                    inStock
                      ? 'bg-cream text-obsidian hover:bg-gold'
                      : 'bg-white/[0.04] text-stone/40 cursor-not-allowed'
                  )}
                >
                  <ShoppingBag size={12} />
                  {addingCart ? '...' : inStock ? 'Add to Cart' : 'Sold Out'}
                </motion.button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // ── Grid view (original) ────────────────────────────────────────────────────
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-[#111] aspect-[3/4]">
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              onLoad={() => setImgLoaded(true)}
              className={cn(
                'w-full h-full object-cover transition-all duration-700 group-hover:scale-105',
                imgLoaded ? 'opacity-100' : 'opacity-0'
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag size={24} className="text-stone/20" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-vermillion text-cream text-[10px] font-mono font-medium px-2 py-1 uppercase tracking-wider">
                -{discount}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-gold text-obsidian text-[10px] font-mono font-medium px-2 py-1 uppercase tracking-wider">
                New
              </span>
            )}
            {!inStock && (
              <span className="bg-[#1a1a1a] text-stone text-[10px] font-mono font-medium px-2 py-1 uppercase tracking-wider border border-white/[0.08]">
                Sold Out
              </span>
            )}
          </div>

          <motion.button
            onClick={handleWishlist}
            whileTap={{ scale: 0.85 }}
            className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-obsidian/80 backdrop-blur-sm border border-white/[0.1] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:border-gold/30"
          >
            <Heart
              size={14}
              className={cn('transition-colors', wishlisted ? 'fill-gold text-gold' : 'text-stone hover:text-cream')}
            />
          </motion.button>

          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex gap-2">
            <motion.button
              onClick={handleAddToCart}
              disabled={addingCart || !inStock}
              whileTap={{ scale: 0.96 }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cream text-obsidian text-xs font-sans font-medium uppercase tracking-widest transition-colors hover:bg-gold disabled:opacity-50"
            >
              <ShoppingBag size={12} />
              {addingCart ? '...' : !inStock ? 'Sold Out' : 'Add to Cart'}
            </motion.button>
            <Link
              to={`/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="w-9 sm:w-10 flex items-center justify-center bg-obsidian/90 border border-white/[0.1] text-stone hover:text-cream transition-colors"
            >
              <Eye size={14} />
            </Link>
          </div>
        </div>

        <div className="pt-3 sm:pt-4 px-0.5">
          <p className="text-[10px] text-stone/50 uppercase tracking-widest mb-1 font-mono truncate">
            {product.brand || product.category?.name || 'LUXE'}
          </p>
          <p className="text-cream text-sm font-medium leading-snug line-clamp-1 mb-2 group-hover:text-gold transition-colors duration-300">
            {product.name}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-cream font-mono text-sm">{formatPrice(price)}</span>
            {mrp > price && (
              <span className="text-stone/40 text-xs font-mono line-through">{formatPrice(mrp)}</span>
            )}
            {product.rating?.count > 0 && (
              <span className="ml-auto text-[10px] text-stone/50 font-mono">
                ★ {Number(product.rating.average).toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}