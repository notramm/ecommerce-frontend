import { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  MapPin,
  CreditCard,
  ShoppingBag,
  ChevronRight,
  Loader2,
} from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import AddressSelector from "../../components/checkout/AddressSelector";
import PaymentSelector from "../../components/checkout/PaymentSelector";
import OrderSummary from "../../components/checkout/OrderSummary";
import { useServerCart } from "../../hooks/useCart";
import useAuthStore from "../../store/authStore";
import { getAddresses } from "../../api/user.api";
import { initiateOrder, verifyPayment } from "../../api/order.api";
import { loadRazorpay, openRazorpayCheckout } from "../../utils/razorpay";
import { cn, formatPrice } from "../../utils/formatters";
import { toast } from "sonner";

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Review", icon: ShoppingBag },
];

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center mb-8 sm:mb-10">
      {STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  borderColor:
                    done || active ? "#c9a96e" : "rgba(255,255,255,0.1)",
                  backgroundColor: done
                    ? "#c9a96e"
                    : active
                      ? "rgba(201,169,110,0.1)"
                      : "transparent",
                }}
                transition={{ duration: 0.3 }}
                className="w-9 h-9 sm:w-10 sm:h-10 border-2 flex items-center justify-center"
              >
                {done ? (
                  <Check size={14} className="text-obsidian" strokeWidth={3} />
                ) : (
                  <Icon
                    size={14}
                    className={active ? "text-gold" : "text-stone/30"}
                  />
                )}
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-mono uppercase tracking-wider hidden sm:block",
                  active
                    ? "text-gold"
                    : done
                      ? "text-stone/50"
                      : "text-stone/25",
                )}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <motion.div
                className="w-16 sm:w-24 h-px mx-2 sm:mx-3"
                animate={{
                  backgroundColor: done ? "#c9a96e" : "rgba(255,255,255,0.08)",
                }}
                transition={{ duration: 0.4 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step wrapper ──────────────────────────────────────────────────────────────
function StepSection({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-6 sm:mb-8">
        <p className="eyebrow text-gold/50 text-[10px] mb-2">{subtitle}</p>
        <h2 className="font-display text-xl sm:text-2xl text-cream">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// ── Main checkout page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [walletAmount, setWalletAmount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [note, setNote] = useState("");

  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: serverCart } = useServerCart();

  // Get addresses for preview in summary
  const { data: addressData } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await getAddresses();
      return data.data.addresses;
    },
    staleTime: 5 * 60 * 1000,
  });
  const addresses = addressData || [];
  const selectedAddrObj = addresses.find((a) => a._id === selectedAddr);
  const walletBalance = user?.walletBalance || 0;
  const cartTotal = serverCart?.total || 0;
  const effectiveTotal = Math.max(0, cartTotal - walletAmount);

  // Guard: empty cart
  useEffect(() => {
    if (serverCart && serverCart.items?.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
    }
  }, [serverCart, navigate]);

  const canProceedStep1 = !!selectedAddr;
  const canProceedStep2 = !!paymentMethod || effectiveTotal === 0;

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddr) {
      toast.error("Select a delivery address");
      return;
    }

    setPlacing(true);
    try {
      const orderPayload = {
        addressId: selectedAddr,
        paymentMethod: effectiveTotal === 0 ? "razorpay" : paymentMethod,
        walletAmount,
        customerNote: note,
      };

      const { data } = await initiateOrder(orderPayload);
      const order = data.data;

      // ── COD or fully paid by wallet ───────────────────────────────────────
      if (order.isCOD || order.status === "confirmed") {
        const successId = order._id || order.orderId;
        navigate(`/order/success/${successId}`, {
          state: {
            orderCode: order.orderCode || order.orderId || order._id,
            paymentMethod,
          },
        });
        return;
      }

      // ── Razorpay payment ──────────────────────────────────────────────────
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Payment service unavailable. Please try again.");
        setPlacing(false);
        return;
      }

      const rzpResponse = await openRazorpayCheckout({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount * 100, // paise
        orderId: order.razorpayOrderId,
        description: `Order ${order.orderCode}`,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: { orderId: order.orderId },
      });

      // ── Verify payment ────────────────────────────────────────────────────
      const verifyRes = await verifyPayment({
        orderId: order.orderId,
        razorpayOrderId: rzpResponse.razorpay_order_id,
        razorpayPaymentId: rzpResponse.razorpay_payment_id,
        razorpaySignature: rzpResponse.razorpay_signature,
      });

      const successId = verifyRes.data.data._id || verifyRes.data.data.orderId;
      navigate(`/order/success/${successId}`, {
        state: {
          orderCode:
            verifyRes.data.data.orderCode || verifyRes.data.data.orderId,
          paymentMethod: "razorpay",
        },
      });
    } catch (err) {
      if (err.message === "Payment cancelled by user") {
        toast.info("Payment cancelled");
      } else {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Order placement failed",
        );
      }
    } finally {
      setPlacing(false);
    }
  }, [
    selectedAddr,
    paymentMethod,
    walletAmount,
    note,
    user,
    effectiveTotal,
    navigate,
  ]);

  return (
    <PageWrapper noFooter>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <p className="eyebrow text-gold/50 mb-1.5 text-[10px] sm:text-xs">
              Checkout
            </p>
            <h1 className="font-display text-2xl sm:text-3xl text-cream">
              Complete Order
            </h1>
          </div>
          <Link
            to="/cart"
            className="flex items-center gap-2 text-xs text-stone hover:text-cream transition-colors"
          >
            ← Back to cart
          </Link>
        </div>

        {/* Step indicator */}
        <StepBar current={step} />

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 xl:gap-12 items-start">
          {/* Left — Steps */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* Step 1 — Address */}
              {step === 1 && (
                <StepSection
                  key="step1"
                  title="Delivery Address"
                  subtitle="Step 1 of 3"
                >
                  <AddressSelector
                    selectedId={selectedAddr}
                    onSelect={setSelectedAddr}
                  />
                  <motion.button
                    onClick={() => canProceedStep1 && setStep(2)}
                    disabled={!canProceedStep1}
                    whileTap={canProceedStep1 ? { scale: 0.97 } : {}}
                    className={cn(
                      "w-full btn-primary py-4 sm:py-5 mt-6 flex items-center justify-center gap-3",
                      !canProceedStep1 && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    Continue to Payment
                    <ChevronRight size={15} />
                  </motion.button>
                </StepSection>
              )}

              {/* Step 2 — Payment */}
              {step === 2 && (
                <StepSection
                  key="step2"
                  title="Payment Method"
                  subtitle="Step 2 of 3"
                >
                  <PaymentSelector
                    selected={paymentMethod}
                    onSelect={setPaymentMethod}
                    walletBalance={walletBalance}
                    walletAmount={walletAmount}
                    onWalletChange={setWalletAmount}
                    total={cartTotal}
                  />

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-outline px-5 py-4 text-sm"
                    >
                      ← Back
                    </button>
                    <motion.button
                      onClick={() => canProceedStep2 && setStep(3)}
                      disabled={!canProceedStep2}
                      whileTap={canProceedStep2 ? { scale: 0.97 } : {}}
                      className={cn(
                        "flex-1 btn-primary py-4 flex items-center justify-center gap-3",
                        !canProceedStep2 && "opacity-40 cursor-not-allowed",
                      )}
                    >
                      Review Order
                      <ChevronRight size={15} />
                    </motion.button>
                  </div>
                </StepSection>
              )}

              {/* Step 3 — Review */}
              {step === 3 && (
                <StepSection
                  key="step3"
                  title="Review & Place Order"
                  subtitle="Step 3 of 3"
                >
                  {/* Address review */}
                  {selectedAddrObj && (
                    <div className="bg-[#0f0f0f] border border-white/[0.07] p-4 sm:p-5 mb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin size={13} className="text-gold" />
                            <p className="eyebrow text-gold/50 text-[10px]">
                              Delivering to
                            </p>
                          </div>
                          <p className="text-cream text-sm font-medium mb-0.5">
                            {selectedAddrObj.fullName}
                          </p>
                          <p className="text-stone text-xs">
                            {selectedAddrObj.line1}
                            {selectedAddrObj.line2
                              ? `, ${selectedAddrObj.line2}`
                              : ""}
                            , {selectedAddrObj.city}, {selectedAddrObj.state}{" "}
                            {selectedAddrObj.pincode}
                          </p>
                          <p className="text-stone/50 text-xs font-mono mt-0.5">
                            {selectedAddrObj.phone}
                          </p>
                        </div>
                        <button
                          onClick={() => setStep(1)}
                          className="text-[10px] text-gold/60 hover:text-gold transition-colors shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment review */}
                  <div className="bg-[#0f0f0f] border border-white/[0.07] p-4 sm:p-5 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard size={13} className="text-gold" />
                        <div>
                          <p className="eyebrow text-gold/50 text-[10px] mb-1">
                            Payment
                          </p>
                          <p className="text-cream text-sm">
                            {paymentMethod === "razorpay"
                              ? "Online Payment (Razorpay)"
                              : "Cash on Delivery"}
                          </p>
                          {walletAmount > 0 && (
                            <p className="text-stone/50 text-xs font-mono mt-0.5">
                              + {formatPrice(walletAmount)} from wallet
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        className="text-[10px] text-gold/60 hover:text-gold transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Order note */}
                  <div className="mb-6">
                    <label className="eyebrow text-stone/40 text-[10px] block mb-2">
                      Order Note (optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Any special instructions for your order..."
                      rows={2}
                      maxLength={300}
                      className="w-full bg-[#0f0f0f] border border-white/[0.07] focus:border-gold/30 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="btn-outline px-5 py-4 text-sm"
                    >
                      ← Back
                    </button>
                    <motion.button
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      whileTap={!placing ? { scale: 0.97 } : {}}
                      className="flex-1 btn-primary py-4 sm:py-5 flex items-center justify-center gap-3 disabled:opacity-60 relative overflow-hidden"
                    >
                      {placing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {paymentMethod === "razorpay"
                            ? "Preparing Payment..."
                            : "Placing Order..."}
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          {paymentMethod === "cod"
                            ? `Place Order — COD ${formatPrice(effectiveTotal || cartTotal)}`
                            : effectiveTotal === 0
                              ? "Place Order — Free via Wallet"
                              : `Pay ${formatPrice(effectiveTotal)}`}
                        </>
                      )}
                    </motion.button>
                  </div>

                  <p className="text-[10px] text-stone/30 text-center mt-4">
                    By placing this order, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="underline hover:text-stone/60 transition-colors"
                    >
                      Terms & Conditions
                    </Link>
                  </p>
                </StepSection>
              )}
            </AnimatePresence>
          </div>

          {/* Right — Order summary (sticky) */}
          <div className="lg:sticky lg:top-[calc(var(--nav-height)+24px)]">
            <OrderSummary
              cart={serverCart}
              paymentMethod={paymentMethod}
              walletAmount={walletAmount}
              selectedAddress={selectedAddrObj}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
