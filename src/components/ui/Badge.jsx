import { cn } from '../../utils/formatters';

const VARIANTS = {
  default:  'bg-white/[0.06] text-stone border-white/[0.08]',
  gold:     'bg-gold/10 text-gold border-gold/25',
  success:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning:  'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  error:    'bg-vermillion/10 text-vermillion border-vermillion/20',
  info:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  outline:  'bg-transparent text-stone border-white/[0.12]',
};

const SIZES = {
  xs: 'text-[9px] px-1.5 py-0.5',
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export default function Badge({
  children,
  variant = 'default',
  size    = 'sm',
  dot     = false,
  className,
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-mono border leading-none',
      VARIANTS[variant] || VARIANTS.default,
      SIZES[size]       || SIZES.sm,
      className
    )}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          variant === 'success' ? 'bg-emerald-400' :
          variant === 'warning' ? 'bg-yellow-500'  :
          variant === 'error'   ? 'bg-vermillion'  :
          variant === 'gold'    ? 'bg-gold'        :
          'bg-stone'
        )} />
      )}
      {children}
    </span>
  );
}