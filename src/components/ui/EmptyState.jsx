import { Link }   from 'react-router-dom';
import { motion } from 'framer-motion';
import { PackageSearch, Search, SlidersHorizontal } from 'lucide-react';
import { cn }     from '../../utils/formatters';

const CONFIGS = {
  products: {
    icon: PackageSearch,
    title: 'No products found',
    sub:   'Try adjusting your filters or search terms.',
  },
  search: {
    icon: Search,
    title: 'No results found',
    sub:   'We couldn\'t find anything matching your search.',
  },
  filters: {
    icon: SlidersHorizontal,
    title: 'No matches',
    sub:   'Try removing some filters to see more results.',
  },
};

export default function EmptyState({ type = 'products', onReset, className }) {
  const { icon: Icon, title, sub } = CONFIGS[type] || CONFIGS.products;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}
    >
      <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
        <Icon size={24} className="text-stone/30" />
      </div>
      <h3 className="font-display text-xl text-cream mb-2">{title}</h3>
      <p className="text-stone text-sm mb-8 max-w-xs">{sub}</p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onReset && (
          <button onClick={onReset} className="btn-outline text-sm">
            Clear Filters
          </button>
        )}
        <Link to="/" className="btn-ghost text-sm">
          ← Back to Home
        </Link>
      </div>
    </motion.div>
  );
}