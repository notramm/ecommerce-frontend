import { Star } from 'lucide-react';
import { cn }   from '../../utils/formatters';

export default function RatingStars({ value = 0, count = 0, size = 'sm', showCount = true }) {
  const sizes = { sm: 12, md: 16, lg: 20 };
  const px    = sizes[size] || 12;
  const filled = Math.round(value);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={px}
            className={i < filled ? 'fill-gold text-gold' : 'text-stone/20'}
          />
        ))}
      </div>
      {showCount && (
        <span className={cn(
          'font-mono text-stone/50',
          size === 'lg' ? 'text-sm' : 'text-[10px]'
        )}>
          {value > 0 ? `${Number(value).toFixed(1)}` : '—'}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
}