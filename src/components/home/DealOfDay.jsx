import { useState, useEffect, useCallback } from 'react';
import { Link }    from 'react-router-dom';
import { motion }  from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../api/product.api';
import { formatPrice, formatDiscount } from '../../utils/formatters';

// Countdown
function useCountdown(target) {
  const calc = useCallback(() => {
    const diff  = Math.max(0, target - Date.now());
    const h     = Math.floor(diff / 3600000);
    const m     = Math.floor((diff % 3600000) / 60000);
    const s     = Math.floor((diff % 60000) / 1000);
    return { h, m, s };
  }, [target]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);

  return time;
}

function TimeBlock({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl sm:text-4xl text-cream tabular-nums leading-none mb-1">
        {String(value).padStart(2, '0')}
      </div>
      <p className="eyebrow text-stone/40 text-[9px] sm:text-[10px]">{label}</p>
    </div>
  );
}

export default function DealOfDay() {
  const midnight  = new Date();
  midnight.setHours(23, 59, 59, 999);
  const { h, m, s } = useCountdown(midnight.getTime());

  // Get a sale product for display
  const { data } = useQuery({
    queryKey:  ['deal-product'],
    queryFn:   async () => {
    const { data } = await getProducts({ sort: 'price_asc', limit: 1, minPrice: 100 }); return data.data;
  },
    staleTime: 10 * 60 * 1000,
  });

  const product   = data?.products?.[0];
  const price     = product?.basePrice || 999;
  const mrp       = product?.baseMrp   || 1499;
  const discount  = formatDiscount(mrp, price);
  const image     = product?.images?.[0]?.url;

  return (
    <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 py-8 sm:py-10">
      <div className="bg-[#0d0d0d] border border-white/[0.06] overflow-hidden">
        <div className="flex flex-col lg:flex-row">

          {/* Left — Product visual */}
          <div className="relative lg:w-[45%] aspect-square lg:aspect-auto lg:min-h-[420px] bg-[#111] overflow-hidden shrink-0">
            {image ? (
              <img
                src={image}
                alt={product?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-32 h-32 sm:w-48 sm:h-48 rounded-full opacity-30"
                  style={{ background: 'radial-gradient(circle, #c9a96e 0%, transparent 70%)' }}
                />
              </div>
            )}
            {/* Sale badge */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-vermillion text-cream px-3 py-1.5 sm:px-4 sm:py-2">
              <p className="eyebrow text-[10px]">Limited Offer</p>
              <p className="font-display text-xl sm:text-2xl leading-none">-{discount}%</p>
            </div>
          </div>

          {/* Right — Info */}
          <div className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-2 mb-4 sm:mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Zap size={14} className="text-gold" />
              <p className="eyebrow text-gold/70 text-[10px] sm:text-xs">Deal of the Day</p>
            </motion.div>

            <motion.h2
              className="font-display text-2xl sm:text-3xl lg:text-4xl text-cream mb-2 sm:mb-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {product?.name || 'Featured Deal'}
            </motion.h2>

            <motion.div
              className="flex items-baseline gap-3 mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <span className="font-display text-3xl sm:text-4xl text-gold">{formatPrice(price)}</span>
              <span className="text-stone/40 font-mono text-sm line-through">{formatPrice(mrp)}</span>
            </motion.div>

            {/* Countdown */}
            <motion.div
              className="mb-8 sm:mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="eyebrow text-stone/40 mb-4 text-[10px]">Offer Ends In</p>
              <div className="flex items-center gap-3 sm:gap-5">
                <TimeBlock value={h} label="Hours" />
                <span className="font-display text-2xl text-stone/30 mb-4">:</span>
                <TimeBlock value={m} label="Mins" />
                <span className="font-display text-2xl text-stone/30 mb-4">:</span>
                <TimeBlock value={s} label="Secs" />
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              {product ? (
                <Link
                  to={`/products/${product.slug}`}
                  className="btn-primary inline-flex items-center gap-3 group"
                >
                  Grab This Deal
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link to="/products" className="btn-primary inline-flex items-center gap-3">
                  Shop Deals
                  <ArrowRight size={15} />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}