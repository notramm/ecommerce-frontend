import { useState, useCallback, useEffect } from 'react';
import { useParams, Link }   from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery }          from '@tanstack/react-query';
import {
  ShoppingBag, Heart, Share2, ChevronRight,
  Truck, RotateCcw, Shield, Minus, Plus,
  Check, Info
} from 'lucide-react';
import PageWrapper           from '../../components/layout/PageWrapper';
import ImageGallery          from '../../components/product/ImageGallery';
import VariantSelector       from '../../components/product/VariantSelector';
import RatingStars           from '../../components/product/RatingStars';
import ReviewsSection        from '../../components/product/ReviewsSection';
import ProductCarousel       from '../../components/product/ProductCarousel';
import { Skeleton }          from '../../components/ui/Skeleton';
import { getProductBySlug, getProducts } from '../../api/product.api';
import { cn, formatPrice, formatDiscount } from '../../utils/formatters';
import useAuthStore          from '../../store/authStore';
import useCartStore          from '../../store/cartStore';
import useUIStore            from '../../store/uiStore';
import api                   from '../../api/axios';
import { toast }             from 'sonner';

// ── Add to cart button with animation ─────────────────────────────────────────
function AddToCartButton({ onClick, loading, disabled, inStock }) {
  const [justAdded, setJustAdded] = useState(false);

  const handle = async () => {
    if (justAdded || loading || disabled) return;
    await onClick();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <motion.button
      onClick={handle}
      disabled={loading || disabled || !inStock}
      whileTap={!disabled && inStock ? { scale: 0.97 } : {}}
      className={cn(
        'relative flex-1 flex items-center justify-center gap-3 py-4 sm:py-5',
        'font-sans text-sm font-medium uppercase tracking-widest overflow-hidden',
        'transition-all duration-500',
        justAdded
          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
          : inStock
            ? 'bg-gold text-obsidian hover:bg-gold-light active:bg-gold-dark'
            : 'bg-white/[0.04] text-stone/40 border border-white/[0.06] cursor-not-allowed'
      )}
    >
      {/* Ripple on add */}
      <AnimatePresence>
        {justAdded && (
          <motion.div
            className="absolute inset-0 bg-emerald-500/20"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="w-5 h-5 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
          </motion.div>
        ) : justAdded ? (
          <motion.div
            key="added"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Check size={16} />
            Added to Cart!
          </motion.div>
        ) : (
          <motion.div
            key="default"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <ShoppingBag size={16} />
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ── Detail skeleton ────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div className="flex gap-4">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-16 h-16 shrink-0" />)}
        </div>
        <Skeleton className="flex-1 aspect-[4/5]" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

// ── Info accordion item ────────────────────────────────────────────────────────
function InfoItem({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 py-4 border-b border-white/[0.06] last:border-b-0">
      <div className="w-8 h-8 bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-gold" />
      </div>
      <div>
        <p className="text-cream text-sm font-medium mb-0.5">{title}</p>
        <p className="text-stone text-xs">{description}</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { slug }                             = useParams();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity,         setQuantity]       = useState(1);
  const [wishlisted,       setWishlisted]     = useState(false);
  const [cartLoading,      setCartLoading]    = useState(false);
  const { isLoggedIn }                        = useAuthStore();
  const { addGuestItem, setServerCart }       = useCartStore();
  const { openCart }                          = useUIStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn:  async () => {
    const { data } = await getProductBySlug(slug);
    return data?.data;
  },
    staleTime: 5 * 60 * 1000,
    enabled:   !!slug,
  });

  const product = data?.product;

  // Related products
  const { data: relatedData } = useQuery({
    queryKey: ['related', product?.category?._id],
    queryFn:  async () => {
      const { data } = await getProducts({

      category: product.category?.slug,
      limit:    8,
      status:   'active',
    });
    return data?.data;
  },
    enabled:   !!product?.category?._id,
    staleTime: 5 * 60 * 1000,
  });

  const related = relatedData?.products?.filter((p) => p._id !== product?._id) || [];

  // Set first variant on load
  useEffect(() => {
  if (product?.variants?.[0] && !selectedVariant) {
    setSelectedVariant(product.variants[0]);
  }
}, [product]);

  if (!selectedVariant && product?.variants?.[0]) {
    
  }

  const price    = selectedVariant?.price || product?.basePrice || 0;
  const mrp      = selectedVariant?.mrp   || product?.baseMrp   || 0;
  const discount = mrp > price ? formatDiscount(mrp, price) : 0;
  const inStock  = (selectedVariant?.stock || 0) > 0;

  // All images (product + variant)
  const allImages = [
    ...(product?.images || []),
    ...(selectedVariant?.images || []),
  ];

  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant) { toast.error('Please select a variant'); return; }

    if (!isLoggedIn) {
      addGuestItem({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
        name:      product.name,
        price:     selectedVariant.price,
        image:     allImages[0]?.url || '',
        sku:       selectedVariant.sku,
      });
      toast.success('Added to cart');
      openCart();
      return;
    }

    setCartLoading(true);
    try {
      const { data: cartData } = await api.post('/cart/add', {
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
      });
      setServerCart(cartData.data);
      openCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      throw err;
    } finally {
      setCartLoading(false);
    }
  }, [selectedVariant, isLoggedIn, product, quantity, allImages, addGuestItem, setServerCart, openCart]);

  const handleWishlist = async () => {
    if (!isLoggedIn) { toast.error('Sign in to wishlist'); return; }
    try {
      if (wishlisted) {
        await api.delete(`/users/wishlist/${product._id}`);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/users/wishlist', { productId: product._id });
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch { toast.error('Failed'); }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product?.name, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  // Error state
  if (error) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <p className="font-display text-2xl text-cream mb-3">Product not found</p>
          <p className="text-stone text-sm mb-8">This product may have been removed or is unavailable.</p>
          <Link to="/products" className="btn-outline">Browse Products</Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {isLoading ? (
        <DetailSkeleton />
      ) : (
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 pt-6 sm:pt-8 pb-20">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] font-mono text-stone/40 mb-6 sm:mb-8 flex-wrap">
            <Link to="/" className="hover:text-stone transition-colors">Home</Link>
            <ChevronRight size={10} className="text-stone/20" />
            <Link to="/products" className="hover:text-stone transition-colors">Products</Link>
            {product?.category && (
              <>
                <ChevronRight size={10} className="text-stone/20" />
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="hover:text-stone transition-colors capitalize"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={10} className="text-stone/20" />
            <span className="text-stone/60 truncate max-w-[200px]">{product?.name}</span>
          </nav>

          {/* Main content — 2 columns on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20 mb-16 sm:mb-20">

            {/* Left — Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <ImageGallery images={allImages} productName={product?.name} />
            </motion.div>

            {/* Right — Product info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5 sm:gap-6 lg:sticky lg:top-[calc(var(--nav-height)+24px)] lg:self-start"
            >
              {/* Brand + badges */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {product?.brand && (
                    <Link
                      to={`/products?brand=${product.brand}`}
                      className="eyebrow text-gold/60 hover:text-gold transition-colors text-[10px] sm:text-xs"
                    >
                      {product.brand}
                    </Link>
                  )}
                  {product?.isNewArrival && (
                    <span className="bg-gold/10 border border-gold/30 text-gold text-[10px] font-mono px-2 py-0.5">
                      New
                    </span>
                  )}
                  {product?.isBestSeller && (
                    <span className="bg-white/[0.04] border border-white/[0.1] text-stone/60 text-[10px] font-mono px-2 py-0.5">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleWishlist}
                    whileTap={{ scale: 0.85 }}
                    className="w-9 h-9 border border-white/[0.08] flex items-center justify-center text-stone hover:text-cream hover:border-gold/30 transition-all"
                  >
                    <Heart
                      size={15}
                      className={wishlisted ? 'fill-gold text-gold' : ''}
                    />
                  </motion.button>
                  <motion.button
                    onClick={handleShare}
                    whileTap={{ scale: 0.85 }}
                    className="w-9 h-9 border border-white/[0.08] flex items-center justify-center text-stone hover:text-cream hover:border-gold/30 transition-all"
                  >
                    <Share2 size={15} />
                  </motion.button>
                </div>
              </div>

              {/* Product name */}
              <div>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-cream leading-tight mb-3">
                  {product?.name}
                </h1>
                <RatingStars
                  value={product?.rating?.average || 0}
                  count={product?.rating?.count || 0}
                  size="md"
                />
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-3xl sm:text-4xl text-cream">
                  {formatPrice(price)}
                </span>
                {mrp > price && (
                  <>
                    <span className="text-stone/40 text-base sm:text-lg font-mono line-through">
                      {formatPrice(mrp)}
                    </span>
                    <span className="bg-vermillion/10 border border-vermillion/30 text-vermillion text-xs font-mono px-2 py-0.5">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.06]" />

              {/* Variants */}
              {product?.variants?.length > 0 && (
                <VariantSelector
                  variants={product.variants}
                  selected={selectedVariant}
                  onSelect={setSelectedVariant}
                />
              )}

              {/* Quantity */}
              <div>
                <p className="eyebrow text-stone/60 text-[10px] mb-3">Quantity</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-white/[0.1]">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-stone hover:text-cream transition-colors disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 sm:w-12 text-center text-sm font-mono text-cream">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 10, q + 1))}
                      disabled={quantity >= (selectedVariant?.stock || 10)}
                      className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-stone hover:text-cream transition-colors disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {selectedVariant && (
                    <span className="text-xs text-stone/40 font-mono">
                      {selectedVariant.stock > 0
                        ? `${selectedVariant.stock} available`
                        : 'Out of stock'}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3">
                <AddToCartButton
                  onClick={handleAddToCart}
                  loading={cartLoading}
                  disabled={!inStock || !selectedVariant}
                  inStock={inStock}
                />
                <Link
                  to={isLoggedIn ? '/checkout' : '/login?redirect=/checkout'}
                  onClick={() => {
                    if (!isLoggedIn) return;
                    // Quick buy — add to cart first
                    if (selectedVariant && inStock) {
                      api.post('/cart/add', {
                        productId: product._id,
                        variantId: selectedVariant._id,
                        quantity,
                      }).catch(() => {});
                    }
                  }}
                  className={cn(
                    'px-4 sm:px-6 py-4 sm:py-5 border flex items-center justify-center',
                    'text-xs font-sans font-medium uppercase tracking-widest transition-all duration-300',
                    inStock
                      ? 'border-gold/30 text-gold hover:bg-gold/5 hover:border-gold/50'
                      : 'border-white/[0.06] text-stone/40 cursor-not-allowed pointer-events-none'
                  )}
                >
                  Buy Now
                </Link>
              </div>

              {/* Delivery info */}
              <div className="bg-[#0f0f0f] border border-white/[0.06] p-4 sm:p-5">
                <InfoItem
                  icon={Truck}
                  title={product?.isFreeShipping ? 'Free Delivery' : `Delivery: ₹${product?.shippingCharge || 49}`}
                  description="Estimated delivery in 3-7 business days"
                />
                <InfoItem
                  icon={RotateCcw}
                  title="7-Day Easy Returns"
                  description="No questions asked return policy"
                />
                <InfoItem
                  icon={Shield}
                  title="Secure & Authentic"
                  description="100% genuine product guaranteed"
                />
              </div>

              {/* Short description */}
              {product?.shortDesc && (
                <p className="text-stone text-sm leading-relaxed">{product.shortDesc}</p>
              )}

              {/* Tags */}
              {product?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.slice(0, 6).map((tag) => (
                    <Link
                      key={tag}
                      to={`/products?tags=${tag}`}
                      className="text-[10px] font-mono text-stone/40 border border-white/[0.06] px-2.5 py-1.5 hover:border-gold/20 hover:text-stone transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Description section */}
          {product?.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-16 sm:mb-20 max-w-3xl"
            >
              <p className="eyebrow text-gold/50 mb-4">About this product</p>
              <div className="text-stone text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </motion.div>
          )}

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <ReviewsSection
              productId={product?._id}
              rating={product?.rating?.average || 0}
              ratingCount={product?.rating?.count || 0}
            />
          </motion.div>

          {/* Related products */}
          {related.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-16 sm:mt-20"
            >
              <ProductCarousel
                title="You may also like"
                eyebrow="Related"
                products={related}
                viewAllHref={`/products?category=${product?.category?.slug}`}
              />
            </motion.div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}