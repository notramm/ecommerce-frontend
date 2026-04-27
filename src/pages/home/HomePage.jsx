import { useRef }        from 'react';
import { motion }        from 'framer-motion';
import Hero              from '../../components/home/Hero';
import BannerStrip       from '../../components/home/BannerStrip';
import CategoryGrid      from '../../components/home/CategoryGrid';
import FeaturedProducts  from '../../components/home/FeaturedProducts';
import DealOfDay         from '../../components/home/DealOfDay';
import Testimonials      from '../../components/home/Testimonials';
import VendorCTA         from '../../components/home/VendorCTA';
import PageWrapper       from '../../components/layout/PageWrapper';

const fadeUp = {
  initial:  { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

function MarqueeStrip() {
  const BRANDS = ['APPLE','SAMSUNG','SONY','NIKE','ADIDAS','PUMA',"LEVI'S",'ZARA','H&M','BOAT'];
  return (
    <div className="border-y border-white/[0.04] py-4 overflow-hidden bg-[#080808]">
      <motion.div
        className="flex items-center gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
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
            <button className="btn-primary whitespace-nowrap">Claim Offer</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <PageWrapper>
      <Hero />
      <BannerStrip />
      <MarqueeStrip />

      <motion.div {...fadeUp}>
        <CategoryGrid />
      </motion.div>

      <motion.div {...fadeUp}>
        <FeaturedProducts />
      </motion.div>

      <motion.div {...fadeUp}>
        <DealOfDay />
      </motion.div>

      <motion.div {...fadeUp}>
        <EditorialBanner />
      </motion.div>

      <motion.div {...fadeUp}>
        <VendorCTA />
      </motion.div>

      <motion.div {...fadeUp}>
        <Testimonials />
      </motion.div>
    </PageWrapper>
  );
}