import { useRef, useState, useCallback } from 'react';
import { cn } from '../../utils/formatters';

export default function OTPInput({ length = 6, onComplete, disabled }) {
  const [otp,  setOtp]  = useState(() => Array(length).fill(''));
  const refs            = useRef([]);

  const handleChange = useCallback((val, idx) => {
    if (!/^\d*$/.test(val)) return;
    setOtp((prev) => {
      const next  = [...prev];
      next[idx]   = val.slice(-1);
      const full  = next.join('');
      if (full.length === length && !next.includes('')) onComplete?.(full);
      return next;
    });
    if (val && idx < length - 1) {
      setTimeout(() => refs.current[idx + 1]?.focus(), 0);
    }
  }, [length, onComplete]);

  const handleKeyDown = useCallback((e, idx) => {
    if (e.key === 'Backspace') {
      if (otp[idx]) {
        setOtp((prev) => { const n = [...prev]; n[idx] = ''; return n; });
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft'  && idx > 0)           refs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < length - 1)  refs.current[idx + 1]?.focus();
  }, [otp, length]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text    = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next    = Array(length).fill('');
    text.split('').forEach((c, i) => { next[i] = c; });
    setOtp(next);
    const focusIdx = Math.min(text.length, length - 1);
    setTimeout(() => refs.current[focusIdx]?.focus(), 0);
    if (text.length === length) onComplete?.(text);
  }, [length, onComplete]);

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {otp.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          disabled={disabled}
          className={cn(
            'w-11 h-13 text-center text-lg font-display font-medium',
            'bg-[#0f0f0f] border text-cream',
            'outline-none transition-all duration-200 focus:ring-1',
            digit
              ? 'border-gold/50 text-gold focus:border-gold focus:ring-gold/20'
              : 'border-white/[0.07] focus:border-gold/40 focus:ring-gold/10',
            disabled && 'opacity-40 cursor-not-allowed'
          )}
          style={{ height: '52px' }}
        />
      ))}
    </div>
  );
}