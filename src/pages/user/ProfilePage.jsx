import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Save,
  Loader2,
  Shield,
  CheckCircle2,
  Mail,
  Phone,
  X,
  ArrowRight,
} from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import DashboardShell from "../../components/layout/DashboardShell";
import OTPInput from "../../components/shared/OTPInput";
import useAuthStore from "../../store/authStore";
import {
  updateProfile,
  sendEmailChangeOTP,
  verifyEmailChangeOTP,
  sendPhoneChangeOTP,
  verifyPhoneChangeOTP,
} from "../../api/user.api";
import { cn } from "../../utils/formatters";
import { toast } from "sonner";

const nameSchema = z.object({
  name: z.string().min(2, "At least 2 characters").max(50),
});

const emailSchema = z.object({
  email: z.string().email("Enter valid email"),
});

const phoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit number"),
});

// ── Change Email Modal ─────────────────────────────────────────────────────────
function ChangeEmailModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("input"); // input | otp
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  const startTimer = () => {
    setTimer(60);
    const t = setInterval(
      () =>
        setTimer((p) => {
          if (p <= 1) {
            clearInterval(t);
            return 0;
          }
          return p - 1;
        }),
      1000,
    );
  };

  const handleSend = async (d) => {
    setLoading(true);
    try {
      await sendEmailChangeOTP(d.email);
      setEmail(d.email);
      setStep("otp");
      startTimer();
      toast.success("OTP sent to new email");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      await verifyEmailChangeOTP(otp);
      toast.success("Email updated successfully");
      onSuccess({ email });
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-obsidian/80 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-sm bg-[#0d0d0d] border border-white/[0.08] p-6 space-y-5"
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-cream">Change Email</p>
          <button
            onClick={onClose}
            className="text-stone hover:text-cream transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "input" ? (
            <motion.form
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit(handleSend)}
              className="space-y-4"
            >
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
                  New Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40"
                  />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="new@email.com"
                    className={cn(
                      "w-full bg-[#0a0a0a] border text-cream placeholder:text-stone/20 pl-9 pr-4 py-3 text-sm outline-none transition-all focus:border-gold/40",
                      errors.email
                        ? "border-vermillion/40"
                        : "border-white/[0.07]",
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-vermillion/80 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ArrowRight size={14} />
                )}
                Send OTP
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="bg-gold/5 border border-gold/20 px-4 py-3 text-xs text-gold/80 font-mono text-center">
                OTP sent to {email}
              </div>
              <OTPInput length={6} onComplete={setOtp} />
              <button
                onClick={handleVerify}
                disabled={loading || otp.length < 6}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                Verify & Update
              </button>
              <div className="flex justify-between text-xs text-stone/40">
                <button
                  onClick={() => setStep("input")}
                  className="hover:text-stone transition-colors"
                >
                  ← Change email
                </button>
                {timer > 0 ? (
                  <span>Resend in {timer}s</span>
                ) : (
                  <button
                    onClick={() => handleSend({ email })}
                    className="text-gold hover:text-gold-light"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Change Phone Modal ─────────────────────────────────────────────────────────
function ChangePhoneModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(phoneSchema),
  });

  const startTimer = () => {
    setTimer(60);
    const t = setInterval(
      () =>
        setTimer((p) => {
          if (p <= 1) {
            clearInterval(t);
            return 0;
          }
          return p - 1;
        }),
      1000,
    );
  };

  const handleSend = async (d) => {
    setLoading(true);
    try {
      await sendPhoneChangeOTP(d.phone);
      setPhone(d.phone);
      setStep("otp");
      startTimer();
      toast.success("OTP sent to new phone number");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      await verifyPhoneChangeOTP(otp);
      toast.success("Phone updated successfully");
      onSuccess({ phone });
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-obsidian/80 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-sm bg-[#0d0d0d] border border-white/[0.08] p-6 space-y-5"
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-lg text-cream">Change Phone</p>
          <button
            onClick={onClose}
            className="text-stone hover:text-cream transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "input" ? (
            <motion.form
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit(handleSend)}
              className="space-y-4"
            >
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
                  New Mobile Number
                </label>
                <div className="flex">
                  <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-white/[0.07] border-r-0 px-3 shrink-0">
                    <span>🇮🇳</span>
                    <span className="text-xs text-stone font-mono">+91</span>
                  </div>
                  <input
                    {...register("phone")}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    className={cn(
                      "flex-1 bg-[#0a0a0a] border text-cream placeholder:text-stone/20 px-4 py-3 text-sm font-mono outline-none focus:border-gold/40",
                      errors.phone
                        ? "border-vermillion/40"
                        : "border-white/[0.07]",
                    )}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[10px] text-vermillion/80 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ArrowRight size={14} />
                )}
                Send OTP
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="bg-gold/5 border border-gold/20 px-4 py-3 text-xs text-gold/80 font-mono text-center">
                OTP sent to +91 {phone}
              </div>
              <OTPInput length={6} onComplete={setOtp} />
              <button
                onClick={handleVerify}
                disabled={loading || otp.length < 6}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                Verify & Update
              </button>
              <div className="flex justify-between text-xs text-stone/40">
                <button
                  onClick={() => setStep("input")}
                  className="hover:text-stone transition-colors"
                >
                  ← Change number
                </button>
                {timer > 0 ? (
                  <span>Resend in {timer}s</span>
                ) : (
                  <button
                    onClick={() => handleSend({ phone })}
                    className="text-gold hover:text-gold-light"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Main ProfilePage ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [emailModal, setEmailModal] = useState(false);
  const [phoneModal, setPhoneModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user?.name || "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      updateUser(res.data.data.user || res.data.data);
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Update failed"),
  });

  const providers = [
    ...new Map(
      (user?.authProviders || []).map((p) => [
        `${p.provider}-${p.providerId}`,
        p,
      ]),
    ).values(),
  ];

  return (
    <PageWrapper>
      <DashboardShell title="My Profile" subtitle="Account">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Personal info ─────────────────────────────────────────────── */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
            <p className="eyebrow text-stone/40 text-[10px] mb-5">
              Personal Information
            </p>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-display text-2xl overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.[0]?.toUpperCase()
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold flex items-center justify-center cursor-pointer hover:bg-gold-light transition-colors">
                  <Camera size={11} className="text-obsidian" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setAvatarPreview(URL.createObjectURL(f));
                    }}
                  />
                </label>
              </div>
              <div>
                <p className="text-cream text-sm font-medium">{user?.name}</p>
                <p className="text-stone/40 text-xs font-mono capitalize">
                  {user?.role}
                </p>
              </div>
            </div>

            {/* Name form */}
            <form onSubmit={handleSubmit(mutate)} className="space-y-4">
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
                  Full Name
                </label>
                <input
                  {...register("name")}
                  className={cn(
                    "w-full bg-[#0a0a0a] border text-cream placeholder:text-stone/25 px-4 py-3 text-sm outline-none transition-all focus:border-gold/40",
                    errors.name
                      ? "border-vermillion/40"
                      : "border-white/[0.07]",
                  )}
                />
                {errors.name && (
                  <p className="text-[10px] text-vermillion/80 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email field — click to change */}
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-[#0a0a0a] border border-white/[0.07] px-4 py-3 text-sm text-stone/60 font-mono">
                    {user?.email || "—"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailModal(true)}
                    className="px-3 border border-white/[0.08] text-stone/50 hover:text-gold hover:border-gold/30 transition-all text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Mail size={12} />
                    {user?.email ? "Change" : "Add"}
                  </button>
                </div>
                {user?.isEmailVerified && (
                  <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verified
                  </p>
                )}
              </div>

              {/* Phone field — click to change */}
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-1.5">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-[#0a0a0a] border border-white/[0.07] px-4 py-3 text-sm text-stone/60 font-mono">
                    {user?.phone ? `+91 ${user.phone}` : "—"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhoneModal(true)}
                    className="px-3 border border-white/[0.08] text-stone/50 hover:text-gold hover:border-gold/30 transition-all text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Phone size={12} />
                    {user?.phone ? "Change" : "Add"}
                  </button>
                </div>
                {user?.isPhoneVerified && (
                  <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Verified
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isPending || !isDirty}
                whileTap={{ scale: 0.97 }}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save Name
              </motion.button>
            </form>
          </div>

          {/* ── Account security ──────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Verification status */}
            <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
              <p className="eyebrow text-stone/40 text-[10px] mb-4">
                Verification Status
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: "Email",
                    verified: user?.isEmailVerified,
                    value: user?.email,
                  },
                  {
                    label: "Phone",
                    verified: user?.isPhoneVerified,
                    value: user?.phone ? `+91 ${user.phone}` : null,
                  },
                ].map(({ label, verified, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Shield
                        size={13}
                        className={
                          verified ? "text-emerald-400" : "text-stone/30"
                        }
                      />
                      <span className="text-sm text-stone">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {value && (
                        <span className="text-[10px] text-stone/30 font-mono">
                          {value}
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-mono border px-2 py-0.5",
                          verified
                            ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5"
                            : "text-stone/40 border-white/[0.07]",
                        )}
                      >
                        {verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked providers — deduped */}
            <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 sm:p-6">
              <p className="eyebrow text-stone/40 text-[10px] mb-4">
                Linked Accounts
              </p>
              {providers.length === 0 ? (
                <p className="text-stone/40 text-xs">No providers linked</p>
              ) : (
                <div className="space-y-2">
                  {providers.map((p) => (
                    <div
                      key={`${p.provider}-${p.providerId}`}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className="w-7 h-7 bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xs font-mono text-stone/50">
                        {p.provider[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-stone capitalize flex-1">
                        {p.provider}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Connected
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet */}
            <div className="bg-gradient-to-br from-[#141008] to-[#0a0a0a] border border-gold/15 p-5 sm:p-6">
              <p className="eyebrow text-gold/40 text-[10px] mb-2">
                Wallet Balance
              </p>
              <p className="font-display text-3xl text-gold">
                ₹{(user?.walletBalance || 0).toLocaleString()}
              </p>
              <p className="text-stone/40 text-xs mt-1">
                Available for checkout
              </p>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {emailModal && (
            <ChangeEmailModal
              onClose={() => setEmailModal(false)}
              onSuccess={(updates) => updateUser(updates)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {phoneModal && (
            <ChangePhoneModal
              onClose={() => setPhoneModal(false)}
              onSuccess={(updates) => updateUser(updates)}
            />
          )}
        </AnimatePresence>
      </DashboardShell>
    </PageWrapper>
  );
}
