import { useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Home,
  ShoppingBag,
  Check,
} from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../../api/order.api";
import { cn, formatPrice, formatDate } from "../../utils/formatters";
import { Skeleton } from "../../components/ui/Skeleton";
import useAuthStore from '../../store/authStore';

// ── Confetti (pure CSS + JS) ──────────────────────────────────────────────────
function Confetti() {
  const ref = useRef(null);

  useEffect(() => {
    const colors = ["#c9a96e", "#e0c896", "#f5f0e8", "#8c8479", "#c94a2e"];
    const particles = 60;

    const items = Array.from({ length: particles }, (_, i) => {
      const el = document.createElement("div");
      const size = Math.random() * 8 + 4;
      el.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -10px;
        opacity: 1;
        transform: rotate(${Math.random() * 360}deg);
      `;
      ref.current?.appendChild(el);
      return el;
    });

    gsap.to(items, {
      y: () => window.innerHeight * 0.8 + Math.random() * 200,
      x: () => (Math.random() - 0.5) * 400,
      rotation: () => Math.random() * 720,
      opacity: 0,
      duration: () => 1.5 + Math.random() * 1.5,
      delay: () => Math.random() * 0.5,
      ease: "power2.out",
      stagger: 0.02,
      onComplete: () => items.forEach((el) => el.remove()),
    });
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    />
  );
}

// ── Order item preview ────────────────────────────────────────────────────────
function OrderItemPreview({ item }) {
  const image = item.image || null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.05] last:border-b-0">
      <div className="w-12 h-14 bg-[#111] border border-white/[0.06] shrink-0 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={14} className="text-stone/20" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-cream text-xs font-medium line-clamp-1">
          {item.name}
        </p>
        <p className="text-stone/40 text-[10px] font-mono mt-0.5">
          Qty: {item.quantity}
        </p>
      </div>
      <span className="text-cream text-xs font-mono shrink-0">
        {formatPrice(item.total)}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrderSuccessPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const checkRef = useRef(null);
  const circleRef = useRef(null);
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { getOrderById } = await import("../../api/order.api");
      const { data } = await getOrderById(id);

      // Handle multiple response shapes safely
      return (
        data?.data?.order || // { data: { order: {...} } }
        data?.data || // { data: {...} }
        data?.order || // { order: {...} }
        data || // {...}
        null
      );
    },
    staleTime: Infinity,
    retry: 2,
    enabled: !!id,
  });

  const order = data;
  // Animate checkmark on mount
  useEffect(() => {
    if (!checkRef.current || !circleRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(circleRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 0.2,
      });
      gsap.from(checkRef.current, {
        strokeDashoffset: 100,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.6,
      });
    });
    return () => ctx.revert();
  }, []);

  // Status timeline
  const STATUS_STEPS = [
    { key: "confirmed", label: "Order Confirmed", icon: CheckCircle2 },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Package },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Package },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const currentStatusIdx = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.status)
    : 0;

  return (
    <PageWrapper noFooter>
      <Confetti />
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {/* Success animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 sm:mb-12"
        >
          {/* Check circle */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div
              ref={circleRef}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center"
            >
              <svg
                viewBox="0 0 52 52"
                className="w-10 h-10 sm:w-12 sm:h-12"
                fill="none"
              >
                <polyline
                  ref={checkRef}
                  points="14 27 22 35 38 19"
                  stroke="#4ade80"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="50"
                  strokeDashoffset="0"
                />
              </svg>
            </div>
          </div>

          <p className="eyebrow text-gold/50 mb-3 text-xs">
            {state?.paymentMethod === "cod"
              ? "Order Placed"
              : "Payment Successful"}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-cream mb-3">
            Thank you!
          </h1>
          <p className="text-stone text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
            Your order has been confirmed and will be delivered soon.
          </p>

          {/* Order ID */}
          {(state?.orderCode || id) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="inline-flex items-center gap-2 mt-5 bg-gold/10 border border-gold/25 px-4 sm:px-5 py-2.5 sm:py-3"
            >
              <span className="text-stone/50 text-xs">Order ID:</span>
              <span className="text-gold font-mono text-sm font-medium">
                {state?.orderCode || id}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Order details */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="space-y-4"
            >
              {/* Delivery info */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5">
                <p className="eyebrow text-stone/40 text-[10px] mb-4">
                  Delivery Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-stone/30 mb-1">
                      Delivering to
                    </p>
                    <p className="text-cream text-sm font-medium">
                      {order.deliveryAddress?.fullName}
                    </p>
                    <p className="text-stone/60 text-xs mt-0.5 leading-relaxed">
                      {order.deliveryAddress?.line1},
                      {order.deliveryAddress?.line2
                        ? ` ${order.deliveryAddress.line2},`
                        : ""}{" "}
                      {order.deliveryAddress?.city},{" "}
                      {order.deliveryAddress?.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone/30 mb-1">
                      Estimated Delivery
                    </p>
                    <p className="text-cream text-sm">
                      {order.estimatedDelivery
                        ? formatDate(order.estimatedDelivery, "dd MMM yyyy")
                        : "3-7 business days"}
                    </p>
                    <p className="text-[10px] text-stone/30 mt-2">Payment</p>
                    <p className="text-cream text-sm capitalize">
                      {order.isCOD ? "Cash on Delivery" : "Online (Paid)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order status timeline */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5">
                <p className="eyebrow text-stone/40 text-[10px] mb-5">
                  Order Status
                </p>
                <div className="flex items-start">
                  {STATUS_STEPS.slice(0, 4).map((s, i) => {
                    const done = i <= currentStatusIdx;
                    const active = i === currentStatusIdx;
                    return (
                      <div
                        key={s.key}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div className="flex items-center w-full">
                          <div className="flex-1 h-0.5 bg-white/[0.06] first:bg-transparent" />
                          <motion.div
                            animate={{
                              backgroundColor: done ? "#c9a96e" : "transparent",
                              borderColor: done
                                ? "#c9a96e"
                                : "rgba(255,255,255,0.1)",
                            }}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10"
                          >
                            {done && (
                              <Check
                                size={10}
                                className="text-obsidian"
                                strokeWidth={3}
                              />
                            )}
                          </motion.div>
                          <div className="flex-1 h-0.5 bg-white/[0.06] last:bg-transparent" />
                        </div>
                        <p
                          className={cn(
                            "text-[9px] sm:text-[10px] mt-2 text-center font-mono px-1",
                            active
                              ? "text-gold"
                              : done
                                ? "text-stone/50"
                                : "text-stone/20",
                          )}
                        >
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              <div className="bg-[#0d0d0d] border border-white/[0.07] p-5">
                <p className="eyebrow text-stone/40 text-[10px] mb-4">
                  Items ({order.items?.length})
                </p>
                {order.items?.slice(0, 3).map((item) => (
                  <OrderItemPreview key={item._id || item.sku} item={item} />
                ))}
                {order.items?.length > 3 && (
                  <p className="text-center text-xs text-stone/40 mt-3">
                    +{order.items.length - 3} more items
                  </p>
                )}

                {/* Total */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.06]">
                  <span className="text-stone text-sm">Total Paid</span>
                  <span className="font-display text-xl text-cream">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <Link
            to="/orders"
            className="flex-1 btn-primary py-4 flex items-center justify-center gap-3 group"
          >
            Track My Order
            <ArrowRight
              size={15}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            to="/"
            className="flex-1 btn-outline py-4 flex items-center justify-center gap-3"
          >
            <Home size={15} />
            Back to Home
          </Link>
        </motion.div>

        {/* Email confirmation note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[11px] text-stone/30 mt-6"
        >
          A confirmation has been sent to{" "}
          {user?.email || "your registered email"}. Order updates will be sent
          via SMS and email.
        </motion.p>
      </div>
    </PageWrapper>
  );
}
