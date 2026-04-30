import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getActiveBanners } from "../../api/banner.api";

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const item = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Hero() {
  const { data } = useQuery({
    queryKey: ["banners", "hero"],
    queryFn: () => getActiveBanners("hero"),
    staleTime: 5 * 60 * 1000,
  });

  const banner = data?.data?.data?.banners?.[0];
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0f0d08] to-[#0a0a0a]">
      {/* Ambient background — pure CSS, no GSAP */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #c9a96e 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #8c8479 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,240,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,232,1) 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      {/* Content */}
      {banner?.imageUrl ? (
        <img src={banner.imageUrl} className="w-full h-full object-cover" />
      ) : (
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-0 min-h-screen lg:min-h-0 py-28 lg:py-0 lg:h-screen lg:pt-20">
            {/* Left — Text */}
            <motion.div
              className="flex flex-col justify-center lg:h-full max-w-xl w-full"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              <motion.p
                variants={item}
                className="eyebrow text-gold/60 mb-6 sm:mb-8"
              >
                New Collection — SS25
              </motion.p>

              <div className="overflow-hidden mb-3">
                <motion.h1
                  variants={item}
                  className="font-display text-[clamp(2.8rem,5.5vw,5rem)] text-cream leading-[1.0] tracking-[-0.02em]"
                >
                  Crafted for the
                </motion.h1>
              </div>
              <div className="overflow-hidden mb-6 sm:mb-8">
                <motion.h1
                  variants={item}
                  className="font-display text-[clamp(2.8rem,5.5vw,5rem)] italic text-gradient-gold leading-[1.1] tracking-[-0.02em]"
                >
                  Extraordinary
                </motion.h1>
              </div>

              <motion.p
                variants={item}
                className="text-stone text-base sm:text-lg leading-relaxed mb-10 max-w-sm"
              >
                Discover pieces that transcend trends — built to last, designed
                to inspire.
              </motion.p>

              <motion.div
                variants={item}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <Link
                  to="/products?isNewArrival=true"
                  className="btn-primary flex items-center gap-3 group"
                >
                  Explore Collection
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  to="/products"
                  className="btn-ghost text-stone hover:text-cream text-sm flex items-center gap-2 tracking-widest uppercase"
                >
                  View All
                </Link>
              </motion.div>

              <motion.div
                variants={item}
                className="flex items-center gap-8 mt-14 pt-10 border-t border-white/[0.06]"
              >
                {[
                  { num: "50K+", label: "Products" },
                  { num: "200K+", label: "Happy Customers" },
                  { num: "4.9/5", label: "Avg. Rating" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl sm:text-3xl text-cream leading-none">
                      {s.num}
                    </p>
                    <p className="text-[10px] text-stone/50 uppercase tracking-widest mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Visual card */}
            <motion.div
              className="relative w-full lg:w-auto flex justify-center lg:h-full lg:flex lg:items-center"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="relative w-[280px] sm:w-[340px] lg:w-[380px] xl:w-[420px]">
                {/* Back card */}
                <div className="absolute inset-0 translate-x-6 translate-y-6 sm:translate-x-8 sm:translate-y-8 bg-[#1a1a1a] border border-white/[0.05]" />

                {/* Front card — subtle float via CSS animation */}
                <div
                  className="relative bg-[#111] border border-white/[0.08] overflow-hidden"
                  style={{ animation: "float 5s ease-in-out infinite" }}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#1a1a1a] via-[#141410] to-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-20"
                      style={{
                        background:
                          "radial-gradient(circle, #c9a96e 0%, transparent 70%)",
                      }}
                    />
                    <div className="text-center relative z-10">
                      <p className="font-display text-5xl sm:text-7xl text-gold/20 font-bold">
                        SS
                      </p>
                      <p className="font-display text-5xl sm:text-7xl text-gold/20 font-bold">
                        '25
                      </p>
                    </div>
                    <div className="absolute top-4 left-4 sm:top-5 sm:left-5 bg-gold text-obsidian text-[10px] font-mono font-medium px-2.5 py-1.5 uppercase tracking-widest">
                      New Arrival
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 border-t border-white/[0.06]">
                    <p className="eyebrow text-stone/40 mb-1.5 text-[10px]">
                      LUXE Originals
                    </p>
                    <p className="font-display text-base sm:text-lg text-cream">
                      Editorial Piece No. 01
                    </p>
                    <p className="text-gold text-sm font-mono mt-1">₹12,499</p>
                  </div>
                </div>

                {/* Floating badge */}
                <div
                  className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 bg-obsidian border border-gold/30 px-3 sm:px-4 py-2 sm:py-3"
                  style={{ animation: "float 4s ease-in-out infinite 1s" }}
                >
                  <p className="eyebrow text-gold text-[10px]">Free Shipping</p>
                  <p className="text-cream text-xs sm:text-sm font-display">
                    Above ₹499
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <p className="eyebrow text-stone/30 text-[10px]">Scroll to explore</p>
        <ChevronDown size={16} className="text-stone/30 animate-bounce" />
      </motion.div>
    </section>
  );
}
