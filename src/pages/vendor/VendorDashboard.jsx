import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import DashboardShell from "../../components/layout/DashboardShell";
import { Skeleton } from "../../components/ui/Skeleton";
import { getVendorDashboard, getSalesAnalytics } from "../../api/vendor.api";
import { cn, formatPrice } from "../../utils/formatters";
import { useState } from "react";

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent = false, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "border p-4 sm:p-5",
        accent
          ? "bg-gradient-to-br from-[#141008] to-[#0a0a0a] border-gold/20"
          : "bg-[#0d0d0d] border-white/[0.07]",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="eyebrow text-stone/40 text-[10px]">{label}</p>
        <div
          className={cn(
            "w-8 h-8 flex items-center justify-center border",
            accent ? "border-gold/25 bg-gold/10" : "border-white/[0.08]",
          )}
        >
          <Icon size={15} className={accent ? "text-gold" : "text-stone/50"} />
        </div>
      </div>
      <p
        className={cn(
          "font-display text-2xl sm:text-3xl mb-0.5",
          accent ? "text-gold" : "text-cream",
        )}
      >
        {value}
      </p>
      {sub && <p className="text-stone/40 text-xs font-mono">{sub}</p>}
    </motion.div>
  );
}

// ── Mini chart (CSS bars) ─────────────────────────────────────────────────────
function RevenueChart({ data = [] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.revenue || 0), 1);

  return (
    <div className="flex items-end gap-1 h-20">
      {data.slice(-14).map((d, i) => {
        const h = ((d.revenue || 0) / max) * 100;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/[0.08] px-2 py-1 text-[9px] text-cream font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {formatPrice(d.revenue)}
            </div>
            <motion.div
              className="w-full bg-gold/30 hover:bg-gold/60 transition-colors cursor-default"
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(h, 3)}%` }}
              transition={{
                delay: i * 0.03,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function VendorDashboard() {
  const [period, setPeriod] = useState("monthly");

  const { data: dashData, isLoading } = useQuery({
    queryKey: ["vendor-dashboard"],
    queryFn: async () => {
      const { data } = await getVendorDashboard();
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["vendor-analytics", period],
    queryFn: async () => {
      const { data } = await getSalesAnalytics(period);
      console.log('FULL DATA:', JSON.stringify(data.data, null, 2));
      return data.data;
    },

    staleTime: 5 * 60 * 1000,
  });

  const summary = dashData?.summary || {};
  const orderStats = dashData?.orderStats || {};
  const topProducts = dashData?.topProducts || [];
  const vendor = dashData?.vendor || {};
  const chartData = analyticsData?.data || [];

  const stats = [
    {
      label: "Today's Revenue",
      value: formatPrice(summary.today?.revenue || 0),
      sub: `${summary.today?.orderCount || 0} orders`,
      icon: DollarSign,
      accent: true,
    },
    {
      label: "This Month",
      value: formatPrice(summary.thisMonth?.revenue || 0),
      sub: `${summary.thisMonth?.orderCount || 0} orders`,
      icon: TrendingUp,
    },
    {
      label: "Pending Payout",
      value: formatPrice(vendor.pendingPayout || 0),
      sub: "Available to withdraw",
      icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: (vendor.totalOrders || 0).toString(),
      sub: "All time",
      icon: ShoppingBag,
    },
  ];

  return (
    <PageWrapper>
      <DashboardShell title="Dashboard" subtitle="Vendor Overview">
        {/* KYC warning */}
        {vendor.kycStatus && vendor.kycStatus !== "approved" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 bg-yellow-500/5 border border-yellow-500/20 p-4 mb-6 flex-col sm:flex-row"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={15} className="text-yellow-500 shrink-0" />
              <p className="text-yellow-500/80 text-sm">
                {vendor.kycStatus === "pending"
                  ? "KYC under review — listing restricted until approved"
                  : "Complete your KYC to start listing products"}
              </p>
            </div>
            <Link
              to="/vendor/kyc"
              className="btn-outline text-xs whitespace-nowrap border-yellow-500/30 text-yellow-500 hover:border-yellow-500/60 shrink-0"
            >
              {vendor.kycStatus === "pending" ? "View Status" : "Complete KYC"}
            </Link>
          </motion.div>
        )}

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} index={i} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue chart */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <p className="eyebrow text-stone/40 text-[10px] mb-1">
                  Revenue Trend
                </p>
                <p className="text-cream text-sm font-medium">
                  {formatPrice(summary.allTime?.revenue || 0)} total
                </p>
              </div>
              <div className="flex gap-1">
                {["daily", "weekly", "monthly"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-mono border transition-all capitalize",
                      period === p
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-white/[0.07] text-stone/50 hover:text-cream",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length > 0 ? (
              <RevenueChart data={chartData} />
            ) : (
              <div className="h-20 flex items-center justify-center text-stone/30 text-xs">
                No data for this period
              </div>
            )}
          </div>

          {/* Top products */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="eyebrow text-stone/40 text-[10px]">Top Products</p>
              <Link
                to="/vendor/products"
                className="text-[10px] text-gold/60 hover:text-gold transition-colors"
              >
                View All →
              </Link>
            </div>
            {topProducts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-stone/40 text-xs">No products yet</p>
                <Link
                  to="/vendor/products"
                  className="text-gold text-xs mt-1 block hover:underline"
                >
                  Add your first product →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[10px] font-mono text-stone/30 w-4 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="w-10 h-10 bg-[#111] border border-white/[0.06] shrink-0 overflow-hidden">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={14} className="text-stone/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-xs font-medium truncate">
                        {p.name}
                      </p>
                      <p className="text-stone/40 text-[10px] font-mono">
                        {p.units} units
                      </p>
                    </div>
                    <p className="text-cream text-xs font-mono shrink-0">
                      {formatPrice(p.revenue)}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Order status breakdown */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
            <p className="eyebrow text-stone/40 text-[10px] mb-5">
              Order Breakdown
            </p>
            {Object.entries(orderStats).length === 0 ? (
              <p className="text-stone/40 text-xs text-center py-6">
                No orders yet
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(orderStats).map(
                  ([status, { count, revenue }]) => (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-xs text-stone capitalize flex-1">
                        {status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-mono text-stone/50">
                        {count}
                      </span>
                      <span className="text-xs font-mono text-cream">
                        {formatPrice(revenue)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
            <p className="eyebrow text-stone/40 text-[10px] mb-5">
              Quick Actions
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Add New Product",
                  href: "/vendor/products",
                  icon: Package,
                },
                {
                  label: "View Orders",
                  href: "/vendor/orders",
                  icon: ShoppingBag,
                },
                {
                  label: "Request Payout",
                  href: "/vendor/payouts",
                  icon: DollarSign,
                },
                {
                  label: "Create Coupon",
                  href: "/vendor/coupons",
                  icon: TrendingUp,
                },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className="flex items-center gap-3 p-3 border border-white/[0.06] hover:border-gold/20 hover:bg-gold/3 transition-all group"
                >
                  <Icon
                    size={14}
                    className="text-stone/50 group-hover:text-gold transition-colors"
                  />
                  <span className="text-sm text-stone group-hover:text-cream transition-colors">
                    {label}
                  </span>
                  <ArrowUpRight
                    size={12}
                    className="ml-auto text-stone/20 group-hover:text-gold transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DashboardShell>
    </PageWrapper>
  );
}
