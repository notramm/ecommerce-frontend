import { useRef, useState } from 'react';
import { cn } from '../../utils/formatters';

export default function OTPInput({ length = 6, onComplete, disabled }) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const refs          = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx]  = val.slice(-1);
    setOtp(next);

    if (val && idx < length - 1) refs.current[idx + 1]?.focus();

    const full = next.join('');
    if (full.length === length) onComplete?.(full);
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, length).split('');
    const next   = [...otp];
    pasted.forEach((c, i) => { if (/\d/.test(c)) next[i] = c; });
    setOtp(next);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
    if (next.join('').length === length) onComplete?.(next.join(''));
  };

  return (
    <div className="flex gap-3 justify-center">
      {otp.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (refs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-xl font-display font-medium',
            'bg-surface border border-[var(--border)] text-cream',
            'focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20',
            'transition-all duration-200',
            digit && 'border-gold/40 text-gold',
            disabled && 'opacity-40 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  );
}