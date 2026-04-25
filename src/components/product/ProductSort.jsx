import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LayoutGrid, List } from 'lucide-react';
import { SORT_OPTIONS } from '../../utils/constants';
import { cn }           from '../../utils/formatters';
import useClickOutside  from '../../hooks/useClickOutside';

export default function ProductSort({ sort, onSort, view, onView }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const current = SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Sort dropdown */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 border text-xs sm:text-sm font-sans transition-all duration-200',
            open
              ? 'border-gold/40 bg-gold/5 text-cream'
              : 'border-white/[0.08] text-stone hover:border-white/[0.15] hover:text-cream'
          )}
        >
          <span className="hidden sm:inline text-[10px] text-stone/40 uppercase tracking-widest mr-1">Sort:</span>
          <span className="max-w-[100px] sm:max-w-none truncate">{current.label}</span>
          <ChevronDown
            size={13}
            className={cn('shrink-0 transition-transform duration-300', open && 'rotate-180')}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full mt-1 w-52 bg-[#111] border border-white/[0.08] z-30 shadow-card overflow-hidden"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onSort(opt.value); setOpen(false); }}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors',
                    opt.value === sort
                      ? 'bg-gold/10 text-gold'
                      : 'text-stone hover:text-cream hover:bg-white/[0.04]'
                  )}
                >
                  {opt.label}
                  {opt.value === sort && <span className="text-[10px] text-gold">✓</span>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View toggle */}
      <div className="hidden sm:flex items-center border border-white/[0.08]">
        {[
          { value: 'grid', icon: LayoutGrid },
          { value: 'list', icon: List },
        ].map(({ value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onView(value)}
            className={cn(
              'w-9 h-9 flex items-center justify-center transition-colors duration-200',
              view === value
                ? 'bg-gold/10 text-gold'
                : 'text-stone/50 hover:text-stone'
            )}
            aria-label={value}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}