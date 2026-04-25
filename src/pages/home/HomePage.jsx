import { useEffect, useRef } from 'react';
import { gsap }     from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero          from '../../components/home/Hero';
import BannerStrip   from '../../components/home/BannerStrip';
import CategoryGrid  from '../../components/home/CategoryGrid';
import FeaturedProducts from '../../components/home/FeaturedProducts';
import DealOfDay     from '../../components/home/DealOfDay';
import Testimonials  from '../../components/home/Testimonials';
import PageWrapper   from '../../components/layout/PageWrapper';
import { motion }    from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

// Generic scroll-reveal hook for section wrappers
function useScrollReveal(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const els = ref.current.querySelectorAll('.reveal');
    const ctx  = gsap.context(() => {
      els.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start:   'top 88%',
              once:    true,
            },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [ref]);
}

// Brand marquee strip
function MarqueeStrip() {
  const BRANDS = ['APPLE', 'SAMSUNG', 'SONY', 'NIKE', 'ADIDAS', 'PUMA', 'LEVI\'S', 'ZARA', 'H&M', 'BOAT'];
  return (
    <div className="border-y border-white/[0.04] py-4 overflow-hidden bg-[#080808]">
      <motion.div
        className="flex items-center gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {[...BRANDS, ...BRANDS].map((b, i) => (
          <span key={i} className="font-display text-sm sm:text-base tracking-[0.3em] text-stone/20 uppercase shrink-0">
            {b}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// Editorial mid section
function EditorialBanner() {
  return (
    <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 py-8">
      <div className="relative overflow-hidden bg-[#0d0d0d] border border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute right-0 top-0 w-1/2 h-full opacity-[0.04]"
            style={{ background: 'linear-gradient(to left, #c9a96e, transparent)' }}
          />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10 lg:p-14">
          <div>
            <p className="eyebrow text-gold/50 mb-3">Exclusive for members</p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-cream leading-tight">
              Get 10% off your<br className="hidden sm:block" />
              <span className="italic text-gradient-gold"> first order</span>
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent border border-white/[0.1] focus:border-gold/40 text-cream placeholder:text-stone/30 px-5 py-3 text-sm outline-none transition-all duration-300 w-full sm:w-64"
            />
            <button className="btn-primary whitespace-nowrap">
              Claim Offer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const mainRef = useRef(null);
  useScrollReveal(mainRef);

  return (
    <PageWrapper>
      {/* Hero — full height, no padding needed */}
      <Hero />

      {/* Perks strip */}
      <BannerStrip />

      {/* Brand marquee */}
      <MarqueeStrip />

      {/* Main content */}
      <div ref={mainRef}>
        {/* Categories */}
        <div className="reveal">
          <CategoryGrid />
        </div>

        {/* Featured, New, Best Sellers */}
        <div className="reveal">
          <FeaturedProducts />
        </div>

        {/* Deal of the day */}
        <div className="reveal">
          <DealOfDay />
        </div>

        {/* Editorial CTA */}
        <div className="reveal">
          <EditorialBanner />
        </div>

        {/* Testimonials */}
        <div className="reveal">
          <Testimonials />
        </div>
      </div>
    </PageWrapper>
  );
}