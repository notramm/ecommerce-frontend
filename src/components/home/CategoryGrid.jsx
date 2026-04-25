import { useQuery }  from '@tanstack/react-query';
import { Link }      from 'react-router-dom';
import { motion }    from 'framer-motion';
import { getCategoryTree } from '../../api/category.api';
import { Skeleton }  from '../ui/Skeleton';
import { cn }        from '../../utils/formatters';

const COLORS = ['from-[#1a1510]', 'from-[#10141a]', 'from-[#141014]', 'from-[#0e1410]', 'from-[#1a1010]', 'from-[#10181a]'];

export default function CategoryGrid() {
  const { data, isLoading } = useQuery({
    queryKey:  ['categories'],
    queryFn:   getCategoryTree,
    staleTime: 10 * 60 * 1000,
  });

  const categories = data?.data || [];
  const topLevel   = categories.filter((c) => !c.parent).slice(0, 6);

  return (
    <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 py-16 sm:py-20 lg:py-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
        <div>
          <p className="eyebrow text-gold/50 mb-2">Browse</p>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-cream">Shop by Category</h2>
        </div>
        <Link
          to="/categories"
          className="text-xs text-stone hover:text-gold transition-colors uppercase tracking-widest self-start sm:self-auto"
        >
          All Categories →
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-square" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {topLevel.map((cat, i) => (
            <CategoryCard key={cat._id} category={cat} colorClass={COLORS[i % COLORS.length]} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryCard({ category, colorClass, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/products?category=${category.slug}`}
        className="block group relative overflow-hidden aspect-square bg-[#111] border border-white/[0.06] hover:border-gold/20 transition-colors duration-300"
      >
        {/* Background gradient */}
        <div className={cn('absolute inset-0 bg-gradient-to-br to-[#111] opacity-60 transition-opacity duration-500 group-hover:opacity-80', colorClass)} />

        {/* Category image */}
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl sm:text-5xl text-white/[0.04] font-bold uppercase">
              {category.name[0]}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
          <p className="text-cream text-xs sm:text-sm font-sans font-medium leading-tight group-hover:text-gold transition-colors duration-300">
            {category.name}
          </p>
          {category.children?.length > 0 && (
            <p className="text-stone/40 text-[10px] mt-0.5 font-mono">
              {category.children.length} sub-categories
            </p>
          )}
        </div>

        {/* Hover line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gold/0 group-hover:bg-gold/40 transition-colors duration-500" />
      </Link>
    </motion.div>
  );
}