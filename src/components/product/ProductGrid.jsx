import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import EmptyState  from '../ui/EmptyState';
import { cn }      from '../../utils/formatters';

const GRID_CLASSES = {
  grid: 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6',
  list: 'grid grid-cols-1 gap-4',
};

export default function ProductGrid({ products, loading, view = 'grid', onClear }) {
  if (!loading && products.length === 0) {
    return (
      <EmptyState
        type="filters"
        onReset={onClear}
      />
    );
  }

  return (
    <div className={cn(GRID_CLASSES[view])}>
      {loading
        ? [...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((p, i) => (
            <ProductCard
              key={p._id}
              product={p}
              priority={i < 4}
              listView={view === 'list'}
            />
          ))
      }
    </div>
  );
}