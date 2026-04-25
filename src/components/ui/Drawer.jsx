import { useEffect }    from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X }            from 'lucide-react';
import { cn }           from '../../utils/formatters';

export default function Drawer({
  open,
  onClose,
  title,
  children,
  side      = 'left',
  className,
}) {
  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const xFrom = side === 'left' ? '-100%' : '100%';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-obsidian/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              'fixed top-0 bottom-0 z-50 flex flex-col',
              'bg-[#0d0d0d] border-[var(--border)]',
              side === 'left'
                ? 'left-0 border-r w-[85vw] max-w-[340px]'
                : 'right-0 border-l w-[85vw] max-w-[400px]',
              className
            )}
            initial={{ x: xFrom }}
            animate={{ x: 0 }}
            exit={{ x: xFrom }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
              <span className="eyebrow text-stone/50 text-[10px]">{title}</span>
              <button
                onClick={onClose}
                className="p-1.5 text-stone hover:text-cream transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}