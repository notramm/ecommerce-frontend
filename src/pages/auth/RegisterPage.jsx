import { useState }       from 'react';
import { Link }           from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm }        from 'react-hook-form';
import { zodResolver }    from '@hookform/resolvers/zod';
import { z }              from 'zod';
import { Mail, Phone, ArrowRight, CheckCircle2, Sparkles, RotateCcw } from 'lucide-react';
import { useEmailOTP, usePhoneAuth, useGoogleAuth } from '../../hooks/useAuth';
import OTPInput  from '../../components/shared/OTPInput';
import Spinner   from '../../components/ui/Spinner';
import { cn }    from '../../utils/formatters';

const emailSchema   = z.object({
  email: z.string().email('Enter a valid email'),
  name:  z.string().min(2, 'At least 2 characters'),
});
const phoneSchema   = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit number'),
  name:  z.string().min(2, 'At least 2 characters'),
});

const features = [
  'Free delivery on orders above ₹499',
  'Easy 7-day returns',
  'Exclusive member offers',
  'Priority customer support',
];

function useResendTimer(seconds = 60) {
  const [timeLeft, setTimeLeft] = useState(0);
  const start = () => setTimeLeft(seconds);
  const { useEffect } = require('react');
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);
  return { timeLeft, canResend: timeLeft === 0, start };
}

const pageVariants = {
  initial: { opacity: 0, x: 40, filter: 'blur(8px)' },
  animate: { opacity: 1, x: 0,  filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, x: -40, filter: 'blur(8px)', transition: { duration: 0.3 } },
};

const staggerContainer = { animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function RegisterPage() {
  const [method,  setMethod]  = useState('email');
  const [otpVal,  setOtpVal]  = useState('');
  const { timeLeft, canResend, start } = useResendTimer(60);

  const emailHook  = useEmailOTP();
  const phoneHook  = usePhoneAuth();
  const { loading: gLoading, loginWithGoogle } = useGoogleAuth();

  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const phoneForm = useForm({ resolver: zodResolver(phoneSchema) });

  const currentHook = method === 'email' ? emailHook : phoneHook;
  const { step, loading } = currentHook;

  const handleEmailSubmit = async (d) => {
    await emailHook.sendOTP(d.email);
    start();
    // store name temporarily — will be sent on OTP verify
    sessionStorage.setItem('reg_name', d.name);
  };

  const handlePhoneSubmit = async (d) => {
    await phoneHook.sendOTP(d.phone);
    start();
    sessionStorage.setItem('reg_name', d.name);
  };

  const handleVerify = async () => {
    const name = sessionStorage.getItem('reg_name') || '';
    if (method === 'email') {
      await emailHook.verifyOTP(otpVal, name);
    } else {
      await phoneHook.verifyOTP(otpVal, name);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#080808] flex-col justify-between p-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.span
          className="font-display text-2xl text-cream"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          LUXE<span className="text-gold">.</span>
        </motion.span>

        <div className="relative z-10">
          <motion.p
            className="eyebrow text-gold/50 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Join the community
          </motion.p>
          <motion.h2
            className="font-display text-4xl text-cream leading-[1.1] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Unlock a world<br />
            <span className="italic text-gradient-gold">of premium</span>
          </motion.h2>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <CheckCircle2 size={16} className="text-gold shrink-0" />
                <span className="text-sm text-stone">{f}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.p
          className="text-xs text-stone/30 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Over 200,000 happy customers
        </motion.p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(140,132,121,0.04) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div
          className="relative z-10 w-full max-w-[420px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <span className="font-display text-3xl text-cream">LUXE<span className="text-gold">.</span></span>
          </div>

          <div className="mb-8">
            <p className="eyebrow text-gold/60 mb-3">Get started</p>
            <h2 className="font-display text-3xl text-cream font-medium">Create account</h2>
            <p className="text-stone text-sm mt-2">
              Already have one?{' '}
              <Link to="/login" className="text-gold hover:text-gold-light transition-colors underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>

          {/* Google */}
          <motion.button
            onClick={loginWithGoogle}
            disabled={gLoading}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#0f0f0f] border border-white/[0.08] text-cream text-sm font-sans transition-all duration-300 mb-6 hover:border-white/[0.15] hover:bg-white/[0.03] disabled:opacity-50"
          >
            {gLoading ? <Spinner size="sm" /> : (
              <>
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

          {/* Tab switcher */}
          <div className="flex bg-[#0f0f0f] border border-white/[0.06] p-1 mb-6 relative">
            <motion.div
              className="absolute top-1 bottom-1 bg-[#1a1a1a] border border-white/[0.08]"
              animate={{ left: method === 'email' ? '4px' : 'calc(50% + 2px)' }}
              style={{ width: 'calc(50% - 6px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
            {['email', 'phone'].map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                disabled={step !== 'email' && step !== 'phone'}
                className={cn(
                  'relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-sans font-medium transition-colors duration-300 tracking-widest uppercase disabled:cursor-not-allowed',
                  method === m ? 'text-cream' : 'text-stone/50 hover:text-stone'
                )}
              >
                {m === 'email' ? <Mail size={13} /> : <Phone size={13} />}
                {m === 'email' ? 'Email' : 'Phone'}
              </button>
            ))}
          </div>

          {/* Forms */}
          <div className="min-h-[240px]">
            <AnimatePresence mode="wait">

              {/* Email — initial step */}
              {method === 'email' && step === 'email' && (
                <motion.form
                  key="email-reg"
                  variants={pageVariants}
                  initial="initial" animate="animate" exit="exit"
                  onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <label className="eyebrow text-stone/60 block mb-1.5">Full Name</label>
                    <input
                      {...emailForm.register('name')}
                      type="text"
                      placeholder="Your full name"
                      autoFocus
                      className="w-full bg-[#0f0f0f] border border-white/[0.07] text-cream placeholder:text-stone/30 px-4 py-4 text-sm outline-none transition-all duration-300 focus:border-gold/40 focus:ring-1 focus:ring-gold/10"
                    />
                    {emailForm.formState.errors.name && (
                      <p className="text-xs text-vermillion/80 mt-1">{emailForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="eyebrow text-stone/60 block mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40" />
                      <input
                        {...emailForm.register('email')}
                        type="email"
                        placeholder="hello@example.com"
                        className="w-full bg-[#0f0f0f] border border-white/[0.07] text-cream placeholder:text-stone/30 pl-11 pr-4 py-4 text-sm outline-none transition-all duration-300 focus:border-gold/40 focus:ring-1 focus:ring-gold/10"
                      />
                    </div>
                    {emailForm.formState.errors.email && (
                      <p className="text-xs text-vermillion/80 mt-1">{emailForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-40 mt-2"
                  >
                    {loading ? <Spinner size="sm" /> : <><span>Send OTP</span><ArrowRight size={15} /></>}
                  </motion.button>
                </motion.form>
              )}

              {/* Phone — initial step */}
              {method === 'phone' && step === 'phone' && (
                <motion.form
                  key="phone-reg"
                  variants={pageVariants}
                  initial="initial" animate="animate" exit="exit"
                  onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <label className="eyebrow text-stone/60 block mb-1.5">Full Name</label>
                    <input
                      {...phoneForm.register('name')}
                      type="text"
                      placeholder="Your full name"
                      autoFocus
                      className="w-full bg-[#0f0f0f] border border-white/[0.07] text-cream placeholder:text-stone/30 px-4 py-4 text-sm outline-none transition-all duration-300 focus:border-gold/40 focus:ring-1 focus:ring-gold/10"
                    />
                    {phoneForm.formState.errors.name && (
                      <p className="text-xs text-vermillion/80 mt-1">{phoneForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="eyebrow text-stone/60 block mb-1.5">Mobile Number</label>
                    <div className="flex">
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
                        className="flex-1 bg-[#0f0f0f] border border-white/[0.07] text-cream placeholder:text-stone/30 px-4 py-4 text-sm font-mono outline-none transition-all duration-300 focus:border-gold/40 focus:ring-1 focus:ring-gold/10"
                      />
                    </div>
                    {phoneForm.formState.errors.phone && (
                      <p className="text-xs text-vermillion/80 mt-1">{phoneForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div id="recaptcha-container" />
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-40 mt-2"
                  >
                    {loading ? <Spinner size="sm" /> : <><span>Send OTP</span><ArrowRight size={15} /></>}
                  </motion.button>
                </motion.form>
              )}

              {/* OTP step — both methods */}
              {step === 'otp' && (
                <motion.div
                  key="verify-otp"
                  variants={pageVariants}
                  initial="initial" animate="animate" exit="exit"
                  className="space-y-7"
                >
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-2 mb-4">
                      <Sparkles size={13} className="text-gold" />
                      <span className="text-xs text-gold font-mono">
                        OTP sent to {method === 'email' ? emailHook.email : phoneHook.phone}
                      </span>
                    </div>
                    <p className="text-stone text-sm">Enter the 6-digit verification code</p>
                  </div>

                  <OTPInput length={6} onComplete={setOtpVal} />

                  <button
                    onClick={handleVerify}
                    disabled={loading || otpVal.length < 6}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-40"
                  >
                    {loading ? <Spinner size="sm" /> : <><span>Verify & Create Account</span><ArrowRight size={15} /></>}
                  </button>

                  <div className="flex items-center justify-between text-xs text-stone/50">
                    <button
                      onClick={() => {
                        method === 'email' ? emailHook.setStep('email') : phoneHook.setStep('phone');
                      }}
                      className="flex items-center gap-1.5 hover:text-stone transition-colors"
                    >
                      <RotateCcw size={12} />
                      Change {method === 'email' ? 'email' : 'number'}
                    </button>
                    {canResend ? (
                      <button
                        onClick={() => {
                          const name = sessionStorage.getItem('reg_name') || '';
                          if (method === 'email') emailHook.sendOTP(emailHook.email);
                          else phoneHook.sendOTP(phoneHook.phone.replace('+91', ''));
                          start();
                        }}
                        className="text-gold hover:text-gold-light transition-colors"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <span>Resend in {timeLeft}s</span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Profile completion step */}
              {step === 'profile' && (
                <motion.div
                  key="profile-step"
                  variants={pageVariants}
                  initial="initial" animate="animate" exit="exit"
                  className="space-y-5"
                >
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 mx-auto bg-gold/10 border border-gold/20 flex items-center justify-center mb-3">
                      <Sparkles size={20} className="text-gold" />
                    </div>
                    <p className="text-sm text-stone">Almost done! What's your name?</p>
                  </div>
                  <div>
                    <label className="eyebrow text-stone/60 block mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      autoFocus
                      onChange={(e) => sessionStorage.setItem('reg_name_final', e.target.value)}
                      className="w-full bg-[#0f0f0f] border border-white/[0.07] text-cream placeholder:text-stone/30 px-4 py-4 text-sm outline-none transition-all duration-300 focus:border-gold/40"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const name = sessionStorage.getItem('reg_name_final') || '';
                      if (method === 'email') emailHook.completeProfile(name);
                      else phoneHook.completeProfile(name);
                    }}
                    disabled={loading}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-40"
                  >
                    {loading ? <Spinner size="sm" /> : <><span>Enter LUXE</span><ArrowRight size={15} /></>}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <p className="text-xs text-stone/30 text-center mt-8 leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-2 hover:text-stone/60 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-stone/60 transition-colors">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}