import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate }  from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useDebounce  from '../../hooks/useDebounce';
import useUIStore   from '../../store/uiStore';
import { getSearchSuggestions } from '../../api/product.api';
import { Skeleton } from '../ui/Skeleton';
import { cn }       from '../../utils/formatters';

const TRENDING = ['iPhone 15', 'Nike Air Max', 'MacBook Pro', 'Samsung TV', 'Sony Headphones'];

export default function SearchBar() {
  const { searchOpen, closeSearch } = useUIStore();
  const [query,  setQuery]  = useState('');
  const inputRef            = useRef(null);
  const navigate            = useNavigate();
  const debounced           = useDebounce(query, 350);

  const { data, isLoading } = useQuery({
    queryKey:  ['suggestions', debounced],
    queryFn:   () => getSearchSuggestions(debounced),
    enabled:   debounced.length >= 2,
    staleTime: 30000,
  });

  const suggestions = data?.data;

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  const handleSearch = (q) => {
    if (!q.trim()) return;
    navigate(`/products?q=${encodeURIComponent(q.trim())}`);
    closeSearch();
    setQuery('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch(query);
    if (e.key === 'Escape') closeSearch();
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[60] bg-obsidian/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28">
            {/* Close */}
            <div className="flex justify-end mb-6">
              <button
                onClick={closeSearch}
                className="flex items-center gap-2 text-stone hover:text-cream transition-colors text-sm"
              >
                <X size={16} /> Close
              </button>
            </div>

            {/* Input */}
            <motion.div
              className="relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/50" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                type="text"
                placeholder="Search products, brands, categories..."
                className="w-full bg-[#111] border border-white/[0.08] focus:border-gold/40 text-cream placeholder:text-stone/30 pl-12 pr-12 py-4 text-base sm:text-lg font-sans outline-none transition-all duration-300"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone hover:text-cream transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mt-6"
            >
              {/* Loading */}
              {isLoading && debounced.length >= 2 && (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              )}

              {/* Suggestions */}
              {!isLoading && suggestions && debounced.length >= 2 && (
                <div className="space-y-1">
                  {/* Products */}
                  {suggestions.products?.slice(0, 4).map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => {
                        navigate(`/products/${p.slug}`);
                        closeSearch();
                      }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-white/[0.04] transition-colors text-left group"
                    >
                      {p.image && (
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover shrink-0 border border-white/[0.06]" />
                      )}
                      <span className="text-sm text-stone group-hover:text-cream transition-colors flex-1 truncate">
                        {p.name}
                      </span>
                      <ArrowRight size={12} className="text-stone/30 shrink-0" />
                    </button>
                  ))}

                  {/* Brands */}
                  {suggestions.brands?.map((b) => (
                    <button
                      key={b.name}
                      onClick={() => { navigate(`/products?brand=${b.name}`); closeSearch(); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.04] transition-colors text-left group"
                    >
                      <span className="eyebrow text-stone/30 text-[9px] w-14 shrink-0">Brand</span>
                      <span className="text-sm text-stone group-hover:text-cream transition-colors">
                        {b.name}
                      </span>
                    </button>
                  ))}

                  {/* Categories */}
                  {suggestions.categories?.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => { navigate(`/products?category=${c.slug}`); closeSearch(); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.04] transition-colors text-left group"
                    >
                      <span className="eyebrow text-stone/30 text-[9px] w-14 shrink-0">Category</span>
                      <span className="text-sm text-stone group-hover:text-cream transition-colors">
                        {c.name}
                      </span>
                    </button>
                  ))}

                  {/* See all */}
                  <button
                    onClick={() => handleSearch(query)}
                    className="w-full flex items-center justify-between p-3 mt-2 border border-gold/20 bg-gold/5 hover:bg-gold/10 transition-colors group"
                  >
                    <span className="text-sm text-gold">See all results for "{debounced}"</span>
                    <ArrowRight size={14} className="text-gold" />
                  </button>
                </div>
              )}

              {/* No results */}
              {!isLoading && debounced.length >= 2 &&
                !suggestions?.products?.length &&
                !suggestions?.brands?.length &&
                !suggestions?.categories?.length && (
                <div className="text-center py-10">
                  <p className="text-stone text-sm">No results for "{debounced}"</p>
                  <button
                    onClick={() => handleSearch(query)}
                    className="text-gold text-xs mt-2 hover:underline"
                  >
                    Search anyway →
                  </button>
                </div>
              )}

              {/* Trending — shown when no query */}
              {!query && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={13} className="text-stone/40" />
                    <p className="eyebrow text-stone/40 text-[10px]">Trending Searches</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleSearch(t)}
                        className="px-3 py-1.5 border border-white/[0.07] text-xs text-stone hover:text-cream hover:border-gold/30 transition-all duration-200"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}