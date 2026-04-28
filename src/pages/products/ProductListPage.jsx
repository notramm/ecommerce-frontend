import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation }      from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Search, ChevronRight } from 'lucide-react';
import { useInfiniteQuery }  from '@tanstack/react-query';
import PageWrapper           from '../../components/layout/PageWrapper';
import ProductGrid           from '../../components/product/ProductGrid';
import ProductFilters        from '../../components/product/ProductFilters';
import ProductSort           from '../../components/product/ProductSort';
import Drawer                from '../../components/ui/Drawer';
import useUrlFilters         from '../../hooks/useUrlFilters';
import useMediaQuery         from '../../hooks/useMediaQuery';
import useInfiniteScroll     from '../../hooks/useInfiniteScroll';
import { getProducts }       from '../../api/product.api';
import { cn, formatPrice }   from '../../utils/formatters';
import { Skeleton }          from '../../components/ui/Skeleton';

const PAGE_SIZE = 24;

// ── Active filter pills ───────────────────────────────────────────────────────
function FilterPills({ filters, onRemove, onClear }) {
  const pills = [];

  if (filters.category)    pills.push({ key: 'category',    label: filters.category });
  if (filters.brand)       pills.push({ key: 'brand',       label: filters.brand });
  if (filters.minPrice)    pills.push({ key: 'minPrice',    label: `Min ₹${filters.minPrice.toLocaleString()}` });
  if (filters.maxPrice)    pills.push({ key: 'maxPrice',    label: `Max ₹${filters.maxPrice.toLocaleString()}` });
  if (filters.rating)      pills.push({ key: 'rating',      label: `${filters.rating}+ Stars` });
  if (filters.inStock)     pills.push({ key: 'inStock',     label: 'In Stock' });
  if (filters.isNewArrival)pills.push({ key: 'isNewArrival',label: 'New Arrivals' });
  if (filters.isBestSeller)pills.push({ key: 'isBestSeller',label: 'Best Sellers' });
  if (filters.isFeatured)  pills.push({ key: 'isFeatured',  label: 'Featured' });
  if (filters.q)           pills.push({ key: 'q',           label: `"${filters.q}"` });

  if (!pills.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 py-3"
    >
      {pills.map((p) => (
        <span
          key={p.key}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono text-stone border border-white/[0.08] px-2.5 py-1.5 bg-white/[0.02]"
        >
          {p.label}
          <button
            onClick={() => onRemove(p.key)}
            className="text-stone/40 hover:text-vermillion transition-colors"
          >
            <X size={10} />
          </button>
        </span>
      ))}

      <button
        onClick={onClear}
        className="text-[10px] text-stone/40 hover:text-vermillion transition-colors uppercase tracking-widest ml-1"
      >
        Clear all
      </button>
    </motion.div>
  );
}

// ── Results count ─────────────────────────────────────────────────────────────
function ResultsHeader({ total, loading, q }) {
  if (loading) return <Skeleton className="h-5 w-40" />;
  return (
    <p className="text-sm text-stone">
      {q && (
        <span>Results for <span className="text-cream italic">"{q}"</span> — </span>
      )}
      <span className="text-cream font-medium">{total?.toLocaleString()}</span>
      {' '}product{total !== 1 ? 's' : ''}
    </p>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb({ category, brand, q }) {
  const segments = [
    { label: 'Home',    href: '/' },
    { label: 'Products',href: '/products' },
  ];
  if (category) segments.push({ label: category });
  if (brand)    segments.push({ label: brand });
  if (q)        segments.push({ label: `Search: ${q}` });

  return (
    <nav className="flex items-center gap-1.5 text-[11px] font-mono text-stone/40 mb-4">
      {segments.map((s, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={10} className="text-stone/20" />}
          {s.href ? (
            <a href={s.href} className="hover:text-stone transition-colors">{s.label}</a>
          ) : (
            <span className="text-stone/60 capitalize">{s.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProductListPage() {
  const { filters, set, clear, activeFilterCount } = useUrlFilters();
  const [view,         setView]         = useState('grid');
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const isDesktop                        = useMediaQuery('(min-width: 1024px)');
  const sentinelRef                      = useRef(null);

  // Close drawer on desktop
  useEffect(() => {
    if (isDesktop) setDrawerOpen(false);
  }, [isDesktop]);

  // Build API params from filters
  const buildParams = useCallback((pageParam = 1) => ({
    page:        pageParam,
    limit:       PAGE_SIZE,
    ...(filters.q           && { q:            filters.q }),
    ...(filters.category    && { category:     filters.category }),
    ...(filters.brand       && { brand:        filters.brand }),
    ...(filters.minPrice    && { minPrice:      filters.minPrice }),
    ...(filters.maxPrice    && { maxPrice:      filters.maxPrice }),
    ...(filters.rating      && { rating:        filters.rating }),
    ...(filters.inStock     && { inStock:       'true' }),
    ...(filters.isNewArrival && { isNewArrival: 'true' }),
    ...(filters.isBestSeller && { isBestSeller: 'true' }),
    ...(filters.isFeatured  && { isFeatured:   'true' }),
    ...(filters.tags        && { tags:          filters.tags }),
    sort:                       filters.sort || 'relevance',
  }), [filters]);

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey:       ['products', 'list', filters],
    queryFn:        ({ pageParam = 1 }) => getProducts(buildParams(pageParam)),
    getNextPageParam: (last, all) => {
      const meta = last?.data?.data?.meta;
      return meta?.hasNextPage ? all.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime:       2 * 60 * 1000,
  });

  // Flatten pages
  const products = data?.pages?.flatMap((p) => p.data?.data?.products || []) || [];
  const total    = data?.pages?.[0]?.data?.data?.meta?.total || 0;
  const isFirstLoad = isLoading;

  // Infinite scroll sentinel
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const infiniteRef = useInfiniteScroll(handleLoadMore, hasNextPage && !isFetchingNextPage);

  // Filter handlers
  const handleFilter = useCallback((updates) => {
    set(updates);
    if (!isDesktop) setDrawerOpen(false);
  }, [set, isDesktop]);

  const handleRemovePill = useCallback((key) => {
    set({ [key]: null });
  }, [set]);

  const handleSort = useCallback((sortVal) => {
    set({ sort: sortVal });
  }, [set]);

  // Page title
  const pageTitle = filters.q
    ? `Search: "${filters.q}"`
    : filters.category
      ? filters.category.replace(/-/g, ' ')
      : 'All Products';

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 pt-6 sm:pt-8 pb-20">

        {/* Breadcrumb */}
        <Breadcrumb
          category={filters.category}
          brand={filters.brand}
          q={filters.q}
        />

        {/* Page title */}
        <div className="mb-6 sm:mb-8">
          <motion.h1
            className="font-display text-2xl sm:text-3xl lg:text-4xl text-cream capitalize mb-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {pageTitle}
          </motion.h1>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 mb-6 sm:mb-8">
          {/* Top row: count + sort + filter toggle */}
          <div className="flex items-center justify-between gap-4">
            <ResultsHeader total={total} loading={isFirstLoad} q={filters.q} />

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className={cn(
                  'lg:hidden flex items-center gap-2 px-3 py-2.5 border text-xs font-sans transition-all duration-200',
                  activeFilterCount > 0
                    ? 'border-gold/40 bg-gold/5 text-gold'
                    : 'border-white/[0.08] text-stone hover:border-white/[0.15] hover:text-cream'
                )}
              >
                <SlidersHorizontal size={13} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 bg-gold text-obsidian text-[9px] font-mono font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <ProductSort
                sort={filters.sort}
                onSort={handleSort}
                view={view}
                onView={setView}
              />
            </div>
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <FilterPills
              filters={filters}
              onRemove={handleRemovePill}
              onClear={clear}
            />
          )}
        </div>

        {/* Body — sidebar + grid */}
        <div className="flex gap-8 xl:gap-10 items-start">

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-[calc(var(--nav-height)+24px)]">
            <ProductFilters
              filters={filters}
              onFilter={set}
              onClear={clear}
              activeCount={activeFilterCount}
            />
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={JSON.stringify(filters)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ProductGrid
                  products={products}
                  loading={isFirstLoad}
                  view={view}
                  onClear={clear}
                />
              </motion.div>
            </AnimatePresence>

            {/* Load more sentinel */}
            <div ref={infiniteRef} className="mt-10" />

            {/* Loading more indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-3 text-stone text-sm">
                  <span className="w-4 h-4 border border-stone/30 border-t-gold rounded-full animate-spin" />
                  Loading more products...
                </div>
              </div>
            )}

            {/* End of results */}
            {!hasNextPage && products.length > 0 && !isFirstLoad && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 py-12 border-t border-white/[0.06] mt-10"
              >
                <div className="w-8 h-px bg-gold/30" />
                <p className="text-stone/40 text-xs font-mono uppercase tracking-widest">
                  All {total} products shown
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
        side="left"
      >
        <ProductFilters
          filters={filters}
          onFilter={handleFilter}
          onClear={() => { clear(); setDrawerOpen(false); }}
          activeCount={activeFilterCount}
        />

        {/* Apply button */}
        <div className="sticky bottom-0 pt-4 mt-4 border-t border-white/[0.06] bg-[#0d0d0d]">
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-full btn-primary py-3.5 text-center"
          >
            Show {total} Results
          </button>
        </div>
      </Drawer>
    </PageWrapper>
  );
}