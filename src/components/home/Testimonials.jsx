import { useRef }   from 'react';
import { motion }   from 'framer-motion';
import { Star }     from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const REVIEWS = [
  { name: 'Anika Sharma',    role: 'Mumbai',    rating: 5, text: 'Absolutely love the quality. Packaging was exquisite and delivery was lightning fast. Will definitely order again.' },
  { name: 'Rohit Mehta',     role: 'Delhi',     rating: 5, text: 'The curation is incredible. Every product feels intentional. This is how online shopping should feel.' },
  { name: 'Priya Nair',      role: 'Bangalore', rating: 5, text: 'Customer support was outstanding. Had an issue with my order and it was resolved within hours.' },
  { name: 'Karan Joshi',     role: 'Pune',      rating: 5, text: 'Premium experience from start to finish. The app is beautiful, the products are stunning.' },
  { name: 'Meera Iyer',      role: 'Chennai',   rating: 5, text: 'Finally an e-commerce platform that respects aesthetics. My wishlist is growing dangerously long.' },
  { name: 'Arjun Kapoor',    role: 'Hyderabad', rating: 5, text: 'The attention to detail is remarkable. From the website design to the physical packaging — pure luxury.' },
];

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 mb-10 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-gold/50 mb-2">Testimonials</p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-cream">
              What our customers say
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="fill-gold text-gold" />
            ))}
            <span className="text-stone text-sm ml-1">4.9 / 5</span>
          </div>
        </div>
      </div>

      {/* Carousel — two rows scrolling opposite directions */}
      <div className="space-y-4">
        {[
          { slides: REVIEWS.slice(0, 3),    delay: 0,    reverse: false },
          { slides: REVIEWS.slice(3),        delay: 500,  reverse: true },
        ].map((row, ri) => (
          <Swiper
            key={ri}
            modules={[Autoplay]}
            slidesPerView={1.1}
            spaceBetween={16}
            loop
            autoplay={{
              delay:               0,
              disableOnInteraction: false,
              reverseDirection:    row.reverse,
            }}
            speed={4000}
            breakpoints={{
              480:  { slidesPerView: 1.5, spaceBetween: 16 },
              640:  { slidesPerView: 2,   spaceBetween: 20 },
              768:  { slidesPerView: 2.5, spaceBetween: 20 },
              1024: { slidesPerView: 3,   spaceBetween: 24 },
              1280: { slidesPerView: 3.5, spaceBetween: 24 },
            }}
            className="!pl-5 sm:!pl-8 lg:!pl-16"
          >
            {[...row.slides, ...row.slides].map((r, i) => (
              <SwiperSlide key={i}>
                <ReviewCard review={r} />
              </SwiperSlide>
            ))}
          </Swiper>
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="bg-[#0f0f0f] border border-white/[0.06] p-5 sm:p-6 h-full">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} size={11} className="fill-gold text-gold" />
        ))}
      </div>
      <p className="text-stone text-sm leading-relaxed mb-5 line-clamp-3">
        "{review.text}"
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
        <div className="w-8 h-8 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-sm font-display">
          {review.name[0]}
        </div>
        <div>
          <p className="text-cream text-xs font-medium">{review.name}</p>
          <p className="text-stone/40 text-[10px] font-mono">{review.role}</p>
        </div>
      </div>
    </div>
  );
}