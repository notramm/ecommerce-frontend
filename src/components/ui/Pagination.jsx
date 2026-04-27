import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/formatters';

export default function Pagination({ page, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - delta && i <= page + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 flex items-center justify-center border border-white/[0.08] text-stone hover:text-cream hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dot-${i}`} className="w-9 h-9 flex items-center justify-center text-stone/30 text-sm">
            ···
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-9 h-9 flex items-center justify-center text-sm font-mono transition-all duration-200 border',
              p === page
                ? 'border-gold/50 bg-gold/10 text-gold'
                : 'border-white/[0.08] text-stone hover:text-cream hover:border-white/20'
            )}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="w-9 h-9 flex items-center justify-center border border-white/[0.08] text-stone hover:text-cream hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}