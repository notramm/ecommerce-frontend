import { useState, useRef, useEffect } from 'react';
import { Link }           from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm }        from 'react-hook-form';
import { zodResolver }    from '@hookform/resolvers/zod';
import { z }              from 'zod';
import { Mail, Phone, ArrowRight, RotateCcw, Chrome, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useEmailOTP, usePhoneAuth, useGoogleAuth } from '../../hooks/useAuth';
import OTPInput           from '../../components/shared/OTPInput';
import Spinner            from '../../components/ui/Spinner';
import { cn }             from '../../utils/formatters';

// ── Schemas ───────────────────────────────────────────────────────────────────
const emailSchema   = z.object({ email: z.string().email('Enter a valid email') });
const phoneSchema   = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit number') });
const profileSchema = z.object({ name: z.string().min(2, 'Name must be at least 2 characters') });
const otpSchema     = z.object({ otp: z.string().length(6, 'Enter 6-digit OTP') });

// ── Animation Variants ────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, x: 40, filter: 'blur(8px)' },
  animate: { opacity: 1, x: 0,  filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, x: -40, filter: 'blur(8px)',
    transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

// ── Floating orbs background ──────────────────────────────────────────────────
function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gold gradient orb top-right */}
      <motion.div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Stone gradient orb bottom-left */}
      <motion.div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(140,132,121,0.05) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1], rotate: [0, -15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(245,240,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,232,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
}

// ── Tab Switcher ──────────────────────────────────────────────────────────────
function AuthTabs({ active, onChange }) {
  return (
    <div className="flex relative bg-[#0f0f0f] border border-white/[0.06] p-1">
      {/* sliding indicator */}
      <motion.div
        className="absolute top-1 bottom-1 bg-[#1a1a1a] border border-white/[0.08]"
        animate={{ left: active === 'email' ? '4px' : 'calc(50% + 2px)' }}
        style={{ width: 'calc(50% - 6px)' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
      {['email', 'phone'].map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            'relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-sans font-medium transition-colors duration-300',
            'tracking-widest uppercase',
            active === tab ? 'text-cream' : 'text-stone/50 hover:text-stone'
          )}
        >
          {tab === 'email' ? <Mail size={13} /> : <Phone size={13} />}
          {tab === 'email' ? 'Email' : 'Phone'}
        </button>
      ))}
    </div>
  );
}

// ── Timer hook ────────────────────────────────────────────────────────────────
function useResendTimer(seconds = 60) {
  const [timeLeft, setTimeLeft] = useState(0);
  const start = () => setTimeLeft(seconds);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);
  return { timeLeft, canResend: timeLeft === 0, start };
}

// ── Email OTP Flow ────────────────────────────────────────────────────────────
function EmailFlow() {
  const { step, email, loading, sendOTP, verifyOTP, completeProfile, setStep } = useEmailOTP();
  const [otpVal, setOtpVal]   = useState('');
  const [nameVal, setNameVal] = useState('');
  const { timeLeft, canResend, start } = useResendTimer(60);

  const emailForm   = useForm({ resolver: zodResolver(emailSchema) });
  const profileForm = useForm({ resolver: zodResolver(profileSchema) });

  const handleSendOTP = async (d) => { await sendOTP(d.email); start(); };
  const handleVerify  = async ()  => { if (otpVal.length === 6) await verifyOTP(otpVal); };
  const handleProfile = async (d) => { await completeProfile(d.name); };

  return (
    <AnimatePresence mode="wait">
      {/* Step: Email Input */}
      {step === 'email' && (
        <motion.div key="email" variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <motion.form
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            onSubmit={emailForm.handleSubmit(handleSendOTP)}
            className="space-y-5"
          >
            <motion.div variants={staggerItem}>
              <label className="eyebrow text-stone/60 block mb-2">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40" />
                <input
                  {...emailForm.register('email')}
                  type="email"
                  placeholder="hello@example.com"
                  autoFocus
                  className={cn(
                    'w-full bg-[#0f0f0f] border text-cream placeholder:text-stone/30',
                    'pl-11 pr-4 py-4 text-sm font-sans outline-none transition-all duration-300',
                    'focus:border-gold/40 focus:ring-1 focus:ring-gold/10',
                    emailForm.formState.errors.email
                      ? 'border-vermillion/50' : 'border-white/[0.07] hover:border-white/[0.12]'
                  )}
                />
              </div>
              {emailForm.formState.errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-vermillion/80 mt-1.5"
                >
                  {emailForm.formState.errors.email.message}
                </motion.p>
              )}
            </motion.div>

            <motion.button
              variants={staggerItem}
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full btn-primary flex items-center justify-center gap-3 py-4 disabled:opacity-40"
            >
              {loading ? <Spinner size="sm" /> : (
                <>
                  <span>Continue with Email</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      )}

      {/* Step: OTP */}
      {step === 'otp' && (
        <motion.div key="otp" variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-7">
            <motion.div variants={staggerItem} className="text-center">
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-2 mb-4">
                <Sparkles size={13} className="text-gold" />
                <span className="text-xs text-gold font-mono">OTP sent to {email}</span>
              </div>
              <p className="text-stone text-sm">
                Enter the 6-digit code from your inbox
              </p>
            </motion.div>

            <motion.div variants={staggerItem}>
              <OTPInput length={6} onComplete={setOtpVal} />
            </motion.div>

            <motion.button
              variants={staggerItem}
              onClick={handleVerify}
              disabled={loading || otpVal.length < 6}
              whileTap={{ scale: 0.97 }}
              className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-40"
            >
              {loading ? <Spinner size="sm" /> : (
                <>
                  <span>Verify OTP</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>

            <motion.div variants={staggerItem} className="flex items-center justify-between text-xs text-stone/50">
              <button
                onClick={() => setStep('email')}
                className="flex items-center gap-1.5 hover:text-stone transition-colors"
              >
                <RotateCcw size={12} /> Change email
              </button>
              {canResend ? (
                <button
                  onClick={() => { sendOTP(email); start(); }}
                  className="text-gold hover:text-gold-light transition-colors"
                >
                  Resend OTP
                </button>
              ) : (
                <span>Resend in {timeLeft}s</span>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Step: Profile */}
      {step === 'profile' && (
        <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <motion.form
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            onSubmit={profileForm.handleSubmit(handleProfile)}
            className="space-y-5"
          >
            <motion.div variants={staggerItem} className="text-center mb-6">
              <div className="w-14 h-14 mx-auto bg-gold/10 border border-gold/20 flex items-center justify-center mb-3">
                <Sparkles size={20} className="text-gold" />
              </div>
              <p className="text-sm text-stone">Almost there — what should we call you?</p>
            </motion.div>

            <motion.div variants={staggerItem}>
              <label className="eyebrow text-stone/60 block mb-2">Full Name</label>
              <input
                {...profileForm.register('name')}
                type="text"
                placeholder="Your full name"
                autoFocus
                className={cn(
                  'w-full bg-[#0f0f0f] border text-cream placeholder:text-stone/30',
                  'px-4 py-4 text-sm font-sans outline-none transition-all duration-300',
                  'focus:border-gold/40 focus:ring-1 focus:ring-gold/10 border-white/[0.07]'
                )}
              />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-vermillion/80 mt-1.5">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </motion.div>

            <motion.button
              variants={staggerItem}
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-40"
            >
              {loading ? <Spinner size="sm" /> : (
                <>
                  <span>Enter LUXE</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Phone Flow ────────────────────────────────────────────────────────────────
function PhoneFlow() {
  const { step, phone, loading, sendOTP, verifyOTP, completeProfile, setStep } = usePhoneAuth();
  const [otpVal,  setOtpVal]  = useState('');
  const [nameVal, setNameVal] = useState('');
  const { timeLeft, canResend, start } = useResendTimer(60);

  const phoneForm   = useForm({ resolver: zodResolver(phoneSchema) });
  const profileForm = useForm({ resolver: zodResolver(profileSchema) });

  const handleSend    = async (d) => { await sendOTP(d.phone); start(); };
  const handleVerify  = async ()  => { if (otpVal.length === 6) await verifyOTP(otpVal); };
  const handleProfile = async (d) => { await completeProfile(d.name); };

  return (
    <AnimatePresence mode="wait">
      {/* Step: Phone Input */}
      {step === 'phone' && (
        <motion.div key="phone" variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <motion.form
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            onSubmit={phoneForm.handleSubmit(handleSend)}
            className="space-y-5"
          >
            <motion.div variants={staggerItem}>
              <label className="eyebrow text-stone/60 block mb-2">Mobile Number</label>
              <div className="flex">
                {/* Country code */}
                <div className="flex items-center gap-2 bg-[#0f0f0f] border border-white/[0.07] border-r-0 px-4 shrink-0">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-sm text-stone font-mono">+91</span>
                </div>
                <input
                  {...phoneForm.register('phone')}
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  maxLength={10}
                  autoFocus
                  className={cn(
                    'flex-1 bg-[#0f0f0f] border text-cream placeholder:text-stone/30',
                    'px-4 py-4 text-sm font-mono outline-none transition-all duration-300',
                    'focus:border-gold/40 focus:ring-1 focus:ring-gold/10',
                    phoneForm.formState.errors.phone
                      ? 'border-vermillion/50' : 'border-white/[0.07] hover:border-white/[0.12]'
                  )}
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-vermillion/80 mt-1.5"
                >
                  {phoneForm.formState.errors.phone.message}
                </motion.p>
              )}
            </motion.div>

            {/* Invisible recaptcha container */}
            <div id="recaptcha-container" />

            <motion.button
              variants={staggerItem}
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-40"
            >
              {loading ? <Spinner size="sm" /> : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      )}

      {/* Step: OTP */}
      {step === 'otp' && (
        <motion.div key="phone-otp" variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-7">
            <motion.div variants={staggerItem} className="text-center">
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-2 mb-4">
                <Phone size={13} className="text-gold" />
                <span className="text-xs text-gold font-mono">{phone}</span>
              </div>
              <p className="text-stone text-sm">Enter the OTP sent to your phone</p>
            </motion.div>

            <motion.div variants={staggerItem}>
              <OTPInput length={6} onComplete={setOtpVal} />
            </motion.div>

            <motion.button
              variants={staggerItem}
              onClick={handleVerify}
              disabled={loading || otpVal.length < 6}
              whileTap={{ scale: 0.97 }}
              className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-40"
            >
              {loading ? <Spinner size="sm" /> : (
                <>
                  <span>Verify OTP</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>

            <motion.div variants={staggerItem} className="flex items-center justify-between text-xs text-stone/50">
              <button
                onClick={() => setStep('phone')}
                className="flex items-center gap-1.5 hover:text-stone transition-colors"
              >
                <RotateCcw size={12} /> Change number
              </button>
              {canResend ? (
                <button
                  onClick={() => { sendOTP(phone.replace('+91', '')); start(); }}
                  className="text-gold hover:text-gold-light transition-colors"
                >
                  Resend OTP
                </button>
              ) : (
                <span>Resend in {timeLeft}s</span>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Step: Profile */}
      {step === 'profile' && (
        <motion.div key="phone-profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <motion.form
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            onSubmit={profileForm.handleSubmit(handleProfile)}
            className="space-y-5"
          >
            <motion.div variants={staggerItem} className="text-center mb-6">
              <div className="w-14 h-14 mx-auto bg-gold/10 border border-gold/20 flex items-center justify-center mb-3">
                <Sparkles size={20} className="text-gold" />
              </div>
              <p className="text-sm text-stone">One last thing — what's your name?</p>
            </motion.div>

            <motion.div variants={staggerItem}>
              <label className="eyebrow text-stone/60 block mb-2">Full Name</label>
              <input
                {...profileForm.register('name')}
                type="text"
                placeholder="Your full name"
                autoFocus
                className="w-full bg-[#0f0f0f] border border-white/[0.07] text-cream placeholder:text-stone/30 px-4 py-4 text-sm font-sans outline-none transition-all duration-300 focus:border-gold/40 focus:ring-1 focus:ring-gold/10"
              />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-vermillion/80 mt-1.5">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </motion.div>

            <motion.button
              variants={staggerItem}
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-40"
            >
              {loading ? <Spinner size="sm" /> : (
                <>
                  <span>Enter LUXE</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState('email'); // email | phone
  const { loading: gLoading, loginWithGoogle } = useGoogleAuth();

  const handleTabChange = (tab) => setAuthMethod(tab);

  return (
    <div className="min-h-screen bg-obsidian flex">

      {/* ── Left Panel — Decorative ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#080808]">
        <AuthBackground />

        {/* Editorial content */}
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-display text-2xl tracking-tight text-cream">
              LUXE<span className="text-gold">.</span>
            </span>
          </motion.div>

          {/* Center editorial block */}
          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <p className="eyebrow text-gold/60 mb-6">Curated Commerce</p>
            </motion.div>

            <motion.h1
              className="heading-lg text-cream mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              Where luxury<br />
              <span className="italic text-gradient-gold">meets simplicity</span>
            </motion.h1>

            <motion.p
              className="text-stone text-base leading-relaxed mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              Discover a curated collection of premium products, delivered with the care
              and attention they deserve.
            </motion.p>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {[
                { num: '50K+',  label: 'Products' },
                { num: '200K+', label: 'Customers' },
                { num: '4.9★',  label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label} className="border-l border-white/[0.06] pl-4">
                  <p className="font-display text-2xl text-cream">{stat.num}</p>
                  <p className="text-xs text-stone/60 mt-1 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom quote */}
          <motion.div
            className="border-l-2 border-gold/30 pl-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <p className="text-sm text-stone/60 italic leading-relaxed">
              "The details are not the details.<br />
              They make the design."
            </p>
            <p className="text-xs text-stone/40 mt-2 uppercase tracking-widest">— Charles Eames</p>
          </motion.div>
        </div>

        {/* Vertical text */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
          <p className="eyebrow text-stone/20 whitespace-nowrap">Est. 2024 — Premium Commerce</p>
        </div>
      </div>

      {/* ── Right Panel — Auth Form ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <AuthBackground />

        <motion.div
          className="relative z-10 w-full max-w-[420px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <span className="font-display text-3xl tracking-tight text-cream">
              LUXE<span className="text-gold">.</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="eyebrow text-gold/60 mb-3">Welcome</p>
            <h2 className="font-display text-3xl text-cream font-medium">Sign in to continue</h2>
            <p className="text-stone text-sm mt-2">
              New here?{' '}
              <Link to="/register" className="text-gold hover:text-gold-light transition-colors underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>

          {/* Google OAuth */}
          <motion.button
            onClick={loginWithGoogle}
            disabled={gLoading}
            whileTap={{ scale: 0.97 }}
            whileHover={{ borderColor: 'rgba(201,169,110,0.3)' }}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#0f0f0f] border border-white/[0.08] text-cream text-sm font-sans transition-all duration-300 mb-6 hover:bg-white/[0.03] disabled:opacity-50"
          >
            {gLoading ? <Spinner size="sm" /> : (
              <>
                {/* Google icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-stone/40 uppercase tracking-widest font-mono">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Auth Method Tabs */}
          <div className="mb-6">
            <AuthTabs active={authMethod} onChange={handleTabChange} />
          </div>

          {/* Auth Forms */}
          <div className="min-h-[200px]">
            <AnimatePresence mode="wait">
              {authMethod === 'email' ? (
                <motion.div
                  key="email-flow"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <EmailFlow />
                </motion.div>
              ) : (
                <motion.div
                  key="phone-flow"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PhoneFlow />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Terms */}
          <motion.p
            className="text-xs text-stone/30 text-center mt-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            By continuing, you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-2 hover:text-stone/60 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-stone/60 transition-colors">Privacy Policy</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}