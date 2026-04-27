import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion }  from 'framer-motion';
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import OTPInput    from '../../components/shared/OTPInput';
import Spinner     from '../../components/ui/Spinner';
import { useEmailOTP } from '../../hooks/useAuth';
import { cn }      from '../../utils/formatters';

/**
 * Standalone OTP page — used when redirected from email flow
 * or as a dedicated step in registration.
 */
export default function OTPPage() {
  const location              = useLocation();
  const navigate              = useNavigate();
  const { email, step, verifyOTP, loading, sendOTP, setStep } = useEmailOTP();

  const [otpVal,  setOtpVal]  = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // If accessed directly without email, redirect
  useEffect(() => {
    if (!email && !location.state?.email) {
      navigate('/login', { replace: true });
    }
  }, [email, location.state, navigate]);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) { setCanResend(true); return; }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const handleVerify = async () => {
    if (otpVal.length < 6) return;
    await verifyOTP(otpVal);
  };

  const handleResend = async () => {
    if (!canResend) return;
    await sendOTP(email || location.state?.email);
    setTimeLeft(60);
    setCanResend(false);
    setOtpVal('');
  };

  const displayEmail = email || location.state?.email || '';

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-5">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone hover:text-cream transition-colors text-sm mb-10"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gold/10 border border-gold/20 flex items-center justify-center mb-5">
            <Sparkles size={22} className="text-gold" />
          </div>
          <p className="eyebrow text-gold/50 mb-3">Verification</p>
          <h1 className="font-display text-3xl text-cream mb-2">Check your inbox</h1>
          <p className="text-stone text-sm leading-relaxed">
            We sent a 6-digit OTP to<br />
            <span className="text-cream font-medium">{displayEmail}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-8">
          <OTPInput length={6} onComplete={setOtpVal} disabled={loading} />
        </div>

        {/* Verify button */}
        <motion.button
          onClick={handleVerify}
          disabled={loading || otpVal.length < 6}
          whileTap={{ scale: 0.97 }}
          className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-40 mb-5"
        >
          {loading ? <Spinner size="sm" /> : 'Verify OTP'}
        </motion.button>

        {/* Resend */}
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-stone/50 hover:text-stone transition-colors"
          >
            <RotateCcw size={11} /> Change email
          </button>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-gold hover:text-gold-light transition-colors"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-stone/30 font-mono">Resend in {timeLeft}s</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}