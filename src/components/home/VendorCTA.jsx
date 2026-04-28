import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Store,
  TrendingUp,
  DollarSign,
  Package,
  ArrowRight,
  CheckCircle2,
  Users,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const PERKS = [
  { icon: TrendingUp, label: "Sell to 200K+ customers" },
  { icon: DollarSign, label: "Fast, transparent payouts" },
  { icon: Package, label: "Easy product management" },
  { icon: Users, label: "Dedicated seller support" },
];

const STEPS = [
  { n: "01", label: "Register", sub: "Create your store in minutes" },
  { n: "02", label: "Upload KYC", sub: "Verify your identity & bank" },
  { n: "03", label: "List Products", sub: "Add your first product" },
  { n: "04", label: "Start Selling", sub: "Reach millions instantly" },
];

export default function VendorCTA() {
  const { user, isLoggedIn } = useAuthStore();
  const isVendor = user?.role === "vendor";

  // If already a vendor, show vendor dashboard CTA instead
  if (isVendor) {
    return (
      <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 py-8">
        <div className="bg-gradient-to-br from-[#141008] via-[#0f0c06] to-[#0a0a0a] border border-gold/20 p-8 sm:p-12 text-center">
          <p className="eyebrow text-gold/50 mb-3">Vendor Account</p>
          <h2 className="font-display text-2xl sm:text-3xl text-cream mb-3">
            Welcome back to your store
          </h2>
          <p className="text-stone text-sm mb-6">
            Manage your products, orders, and payouts.
          </p>
          <Link
            to="/vendor/dashboard"
            className="btn-primary inline-flex items-center gap-3"
          >
            Open Vendor Dashboard
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 py-8 sm:py-10">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#141008] via-[#0f0c06] to-[#0a0a0a] border border-gold/15">
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.06] pointer-events-none"
          style={{
            background: "radial-gradient(circle, #c9a96e 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-[0.04] pointer-events-none"
          style={{
            background: "radial-gradient(circle, #c9a96e 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 p-8 sm:p-10 lg:p-14">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 sm:mb-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gold/15 border border-gold/25 flex items-center justify-center">
                  <Store size={18} className="text-gold" />
                </div>
                <p className="eyebrow text-gold/60">Sell on LUXE</p>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-cream leading-tight mb-4">
                Turn your passion
                <br />
                <span className="italic text-gradient-gold">into profit</span>
              </h2>
              <p className="text-stone text-sm sm:text-base leading-relaxed">
                Join thousands of vendors already selling on LUXE. Simple setup,
                powerful tools, real-time analytics, and transparent payouts.
                Start for free today.
              </p>
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              <Link
                to={isLoggedIn ? "/vendor/register" : "/register"}
                className="btn-primary flex items-center justify-center gap-3 group py-4 px-8 text-base"
              >
                <Store size={17} />
                Become a Vendor
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              {/* NO nested Link — plain div */}
              <div className="flex items-center justify-center gap-1.5 text-xs">
                <span className="text-stone/50">Already a vendor?</span>
                <Link
                  to="/login"
                  className="text-gold hover:text-gold-light underline underline-offset-2"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12">
            {PERKS.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] px-4 py-3"
              >
                <Icon size={15} className="text-gold shrink-0" />
                <span className="text-stone text-xs sm:text-sm">{label}</span>
              </motion.div>
            ))}
          </div>

          {/* How it works */}
          <div>
            <p className="eyebrow text-stone/30 text-[10px] mb-6">
              How it works
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {STEPS.map(({ n, label, sub }, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden sm:block absolute top-4 left-full w-full h-px bg-white/[0.06] z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="w-8 h-8 border border-gold/30 bg-gold/10 flex items-center justify-center text-gold font-mono text-xs mb-3">
                      {n}
                    </div>
                    <p className="text-cream text-sm font-medium mb-1">
                      {label}
                    </p>
                    <p className="text-stone/50 text-xs leading-snug">{sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12">
            {[
              { num: "5,000+", label: "Active Vendors" },
              { num: "₹2Cr+", label: "Paid Out Monthly" },
              { num: "4.8★", label: "Vendor Rating" },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="font-display text-2xl text-cream leading-none">
                  {num}
                </p>
                <p className="text-stone/40 text-xs mt-1 uppercase tracking-widest">
                  {label}
                </p>
              </div>
            ))}
            <div className="sm:ml-auto flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-stone/50 text-xs">
                Free to register · No monthly fees
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
