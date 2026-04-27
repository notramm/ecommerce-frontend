import { useEffect }    from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X }            from 'lucide-react';
import { cn }           from '../../utils/formatters';

export default function Modal({
  open,
  onClose,
  title,
  children,
  size      = 'md',
  className,
}) {
  const sizes = {
    sm:  'max-w-sm',
    md:  'max-w-md',
    lg:  'max-w-lg',
    xl:  'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              'relative w-full bg-[#0d0d0d] border border-white/[0.08]',
              'flex flex-col max-h-[90vh]',
              sizes[size] || sizes.md,
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/[0.07] shrink-0">
                <p className="font-display text-lg text-cream">{title}</p>
                <button
                  onClick={onClose}
                  className="p-1.5 text-stone hover:text-cream transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* No title — show close button absolutely */}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 text-stone hover:text-cream transition-colors z-10"
              >
                <X size={16} />
              </button>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}