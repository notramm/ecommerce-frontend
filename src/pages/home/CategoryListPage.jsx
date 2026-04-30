import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategories } from '../../api/category.api';
import PageWrapper from '../../components/layout/PageWrapper';

export default function CategoryListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categories = Array.isArray(data) ? data : [];
  const topLevel = categories.filter((c) => !c.parent);

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 py-12">
        <p className="eyebrow text-gold/50 mb-2">Browse</p>
        <h1 className="font-display text-3xl text-cream mb-10">All Categories</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {topLevel.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="block group relative aspect-square bg-[#111] border border-white/[0.06] hover:border-gold/20 transition-all overflow-hidden"
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-6xl text-white/[0.04]">{cat.name[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <p className="text-cream text-sm font-medium group-hover:text-gold transition-colors">{cat.name}</p>
                    {cat.children?.length > 0 && (
                      <p className="text-stone/40 text-[10px] font-mono">{cat.children.length} sub-categories</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}