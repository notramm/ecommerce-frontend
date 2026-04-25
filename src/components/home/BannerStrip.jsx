import { motion } from 'framer-motion';
import { Truck, RotateCcw, Shield, Headphones } from 'lucide-react';

const PERKS = [
  { icon: Truck,       label: 'Free Delivery',   sub: 'On orders above ₹499' },
  { icon: RotateCcw,   label: '7-Day Returns',   sub: 'Hassle-free returns' },
  { icon: Shield,      label: 'Secure Payments', sub: '100% safe checkout' },
  { icon: Headphones,  label: '24/7 Support',    sub: 'Always here to help' },
];

export default function BannerStrip() {
  return (
    <section className="border-y border-white/[0.06] bg-[#0d0d0d]">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 py-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.06]">
          {PERKS.map(({ icon: Icon, label, sub }, i) => (
            <motion.div
              key={label}
              className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 group"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-gold/10 border border-gold/20 flex items-center justify-center transition-colors duration-300 group-hover:bg-gold/15">
                <Icon size={16} className="text-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-cream text-xs sm:text-sm font-medium truncate">{label}</p>
                <p className="text-stone text-[10px] sm:text-xs truncate hidden sm:block">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}