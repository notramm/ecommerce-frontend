import { cn } from '../../utils/formatters';

export default function Spinner({ size = 'md', className }) {
  const s = { sm: 'w-4 h-4 border', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-2' };
  return (
    <span className={cn(
      s[size],
      'rounded-full border-gold/20 border-t-gold animate-spin inline-block',
      className
    )} />
  );
}