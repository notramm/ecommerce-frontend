import { useQuery }      from '@tanstack/react-query';
import { getFeaturedProducts, getNewArrivals, getBestSellers } from '../../api/product.api';
import ProductCarousel   from '../product/ProductCarousel';

export default function FeaturedProducts() {
  const { data: featuredData, isLoading: fl } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn:  getFeaturedProducts,
    staleTime: 5 * 60 * 1000,
  });

  const { data: newData, isLoading: nl } = useQuery({
    queryKey: ['products', 'new'],
    queryFn:  getNewArrivals,
    staleTime: 5 * 60 * 1000,
  });

  const { data: bsData, isLoading: bl } = useQuery({
    queryKey: ['products', 'bestsellers'],
    queryFn:  getBestSellers,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-16 sm:space-y-20 lg:space-y-24 py-8">
      <ProductCarousel
        title="Featured"
        eyebrow="Hand-picked"
        products={featuredData?.data?.products || []}
        loading={fl}
        viewAllHref="/products?isFeatured=true"
      />
      <ProductCarousel
        title="New Arrivals"
        eyebrow="Just Landed"
        products={newData?.data?.products || []}
        loading={nl}
        viewAllHref="/products?isNewArrival=true"
      />
      <ProductCarousel
        title="Best Sellers"
        eyebrow="Community Favorites"
        products={bsData?.data?.products || []}
        loading={bl}
        viewAllHref="/products?isBestSeller=true"
      />
    </div>
  );
}