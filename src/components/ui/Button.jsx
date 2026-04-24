import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/formatters';
import Spinner from './Spinner';

const variants = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost:   'btn-ghost',
  danger:  'inline-flex items-center justify-center gap-2 bg-vermillion text-cream font-sans font-medium text-sm px-8 py-3.5 hover:bg-vermillion/80 active:scale-[0.98] transition-all duration-300 uppercase tracking-widest',
};

const Button = forwardRef(({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  icon,
  iconRight,
  className,
  ...props
}, ref) => {
  const sizeClass = size === 'sm' ? '!px-5 !py-2.5 !text-xs' : size === 'lg' ? '!px-10 !py-4 !text-base' : '';

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={cn(variants[variant], sizeClass, disabled && 'opacity-40 cursor-not-allowed', className)}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;