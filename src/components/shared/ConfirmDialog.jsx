import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn }               from '../../utils/formatters';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title       = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  loading      = false,
}) {
  const variants = {
    danger:  'bg-vermillion/10 border-vermillion/30 text-vermillion hover:bg-vermillion/20',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20',
    primary: 'bg-gold text-obsidian hover:bg-gold-light',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <motion.div
            className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading ? onClose : undefined}
          />
          <motion.div
            className="relative w-full max-w-sm bg-[#0d0d0d] border border-white/[0.08] p-6"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Icon */}
            <div className={cn(
              'w-11 h-11 flex items-center justify-center border mb-4',
              variant === 'danger'  ? 'border-vermillion/20 bg-vermillion/10' :
              variant === 'warning' ? 'border-yellow-500/20 bg-yellow-500/10'  :
              'border-gold/20 bg-gold/10'
            )}>
              <AlertTriangle size={18} className={
                variant === 'danger'  ? 'text-vermillion' :
                variant === 'warning' ? 'text-yellow-500'  :
                'text-gold'
              } />
            </div>

            <h3 className="font-display text-xl text-cream mb-2">{title}</h3>
            <p className="text-stone text-sm leading-relaxed mb-6">{description}</p>

            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 border text-sm font-sans font-medium transition-colors disabled:opacity-40',
                  variants[variant] || variants.danger
                )}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {confirmLabel}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 border border-white/[0.08] text-stone hover:text-cream text-sm transition-colors disabled:opacity-40"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}