import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/formatters';

const Input = forwardRef(({
  label,
  error,
  hint,
  type      = 'text',
  className,
  containerClass,
  prefix,
  suffix,
  ...props
}, ref) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClass)}>
      {label && (
        <label className="eyebrow text-stone/70">{label}</label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-4 text-stone pointer-events-none">{prefix}</div>
        )}

        <input
          ref={ref}
          type={inputType}
          className={cn(
            'input-field',
            prefix   && 'pl-10',
            (suffix || isPassword) && 'pr-12',
            error    && '!border-vermillion/60 !ring-vermillion/10',
            className
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 text-stone hover:text-cream transition-colors"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {suffix && !isPassword && (
          <div className="absolute right-4 text-stone">{suffix}</div>
        )}
      </div>

      {error && <p className="text-xs text-vermillion/80 mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-stone/50">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;