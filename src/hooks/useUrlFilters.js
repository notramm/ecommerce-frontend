import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Syncs filter state with URL search params.
 * Every filter change is reflected in the URL — shareable, back-button safe.
 */
export default function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const get = useCallback((key, fallback = '') =>
    searchParams.get(key) || fallback,
  [searchParams]);

  const getNumber = useCallback((key, fallback = null) => {
    const v = searchParams.get(key);
    return v !== null ? Number(v) : fallback;
  }, [searchParams]);

  const set = useCallback((updates, replace = false) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '' || v === undefined) {
          next.delete(k);
        } else {
          next.set(k, String(v));
        }
      });
      // Always reset page on filter change
      if (!('page' in updates)) next.delete('page');
      return next;
    }, { replace });
  }, [setSearchParams]);

  const clear = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const filters = {
    q:           get('q'),
    category:    get('category'),
    brand:       get('brand'),
    minPrice:    getNumber('minPrice'),
    maxPrice:    getNumber('maxPrice'),
    rating:      getNumber('rating'),
    sort:        get('sort', 'relevance'),
    inStock:     get('inStock') === 'true',
    isFeatured:  get('isFeatured') === 'true',
    isNewArrival:get('isNewArrival') === 'true',
    isBestSeller:get('isBestSeller') === 'true',
    tags:        get('tags'),
    page:        getNumber('page', 1),
  };

  const activeFilterCount = [
    filters.category, filters.brand, filters.minPrice,
    filters.maxPrice, filters.rating, filters.inStock,
    filters.isFeatured, filters.isNewArrival, filters.isBestSeller,
    filters.tags,
  ].filter(Boolean).length;

  return { filters, set, clear, activeFilterCount };
}