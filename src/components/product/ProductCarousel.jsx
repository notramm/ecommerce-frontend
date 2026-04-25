import { useRef }  from 'react';
import { motion }  from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y }   from 'swiper/modules';
import 'swiper/css';
import ProductCard             from './ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import { cn }                  from '../../utils/formatters';

export default function ProductCarousel({ title, eyebrow, products = [], loading, viewAllHref, className }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 sm:mb-8 px-5 sm:px-8 lg:px-16">
        <div>
          {eyebrow && <p className="eyebrow text-gold/50 mb-2 text-[10px] sm:text-xs">{eyebrow}</p>}
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-cream">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="hidden sm:flex items-center gap-2 text-xs text-stone hover:text-gold transition-colors uppercase tracking-widest mr-4"
            >
              View All
            </a>
          )}
          <button
            ref={prevRef}
            className="w-9 h-9 sm:w-10 sm:h-10 border border-white/[0.08] flex items-center justify-center text-stone hover:text-cream hover:border-gold/30 transition-all duration-200 disabled:opacity-20"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            ref={nextRef}
            className="w-9 h-9 sm:w-10 sm:h-10 border border-white/[0.08] flex items-center justify-center text-stone hover:text-cream hover:border-gold/30 transition-all duration-200 disabled:opacity-20"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-5 sm:px-8 lg:px-16">
          {[...Array(5)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (
        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={16}
          slidesPerView={1.5}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={{
            480:  { slidesPerView: 2.2, spaceBetween: 16 },
            640:  { slidesPerView: 2.5, spaceBetween: 20 },
            768:  { slidesPerView: 3.2, spaceBetween: 20 },
            1024: { slidesPerView: 4.2, spaceBetween: 24 },
            1280: { slidesPerView: 5,   spaceBetween: 24 },
          }}
          className="!pl-5 sm:!pl-8 lg:!pl-16 !pr-5 sm:!pr-8 lg:!pr-16"
        >
          {products.map((product, i) => (
            <SwiperSlide key={product._id}>
              <ProductCard product={product} priority={i < 3} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}