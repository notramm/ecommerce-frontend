import { useState }  from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Banknote, Wallet, ChevronDown, Info } from 'lucide-react';
import { cn, formatPrice } from '../../utils/formatters';

const METHODS = [
  {
    id:       'razorpay',
    label:    'Pay Online',
    sub:      'UPI, Credit/Debit Card, Net Banking, Wallets',
    icon:     CreditCard,
    badge:    'Instant',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id:       'cod',
    label:    'Cash on Delivery',
    sub:      'Pay when your order arrives at your door',
    icon:     Banknote,
    badge:    'COD',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
];

export default function PaymentSelector({
  selected,
  onSelect,
  walletBalance  = 0,
  walletAmount   = 0,
  onWalletChange,
  total          = 0,
}) {
  const [walletOpen, setWalletOpen] = useState(false);
  const maxWallet    = Math.min(walletBalance, total);
  const effectiveTotal = Math.max(0, total - walletAmount);

  return (
    <div className="space-y-4">
      {/* Wallet section */}
      {walletBalance > 0 && (
        <motion.div
          layout
          className={cn(
            'border p-4 transition-all duration-300',
            walletAmount > 0
              ? 'border-gold/30 bg-gold/5'
              : 'border-white/[0.07] bg-[#0f0f0f]'
          )}
        >
          <button
            onClick={() => setWalletOpen(!walletOpen)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-9 h-9 flex items-center justify-center border transition-colors duration-300',
                walletAmount > 0 ? 'border-gold/30 bg-gold/10' : 'border-white/[0.1]'
              )}>
                <Wallet size={16} className={walletAmount > 0 ? 'text-gold' : 'text-stone'} />
              </div>
              <div className="text-left">
                <p className={cn('text-sm font-medium', walletAmount > 0 ? 'text-gold' : 'text-cream')}>
                  LUXE Wallet
                </p>
                <p className="text-[10px] text-stone/50 font-mono">
                  Balance: {formatPrice(walletBalance)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {walletAmount > 0 && (
                <span className="text-gold text-sm font-mono">-{formatPrice(walletAmount)}</span>
              )}
              <ChevronDown
                size={14}
                className={cn('text-stone/40 transition-transform duration-300', walletOpen && 'rotate-180')}
              />
            </div>
          </button>

          <AnimatePresence>
            {walletOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  <p className="text-xs text-stone/60">
                    Use your wallet balance to reduce payment amount
                  </p>

                  {/* Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-stone/40">
                      <span>₹0</span>
                      <span>{formatPrice(maxWallet)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={maxWallet}
                      step={10}
                      value={walletAmount}
                      onChange={(e) => onWalletChange(Number(e.target.value))}
                      className="w-full accent-gold h-1.5 cursor-pointer"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone/40">Applying:</span>
                      <span className="text-gold font-mono text-sm">{formatPrice(walletAmount)}</span>
                    </div>
                  </div>

                  {/* Quick options */}
                  <div className="flex gap-2">
                    {[0, Math.floor(maxWallet / 2), maxWallet].map((v) => (
                      <button
                        key={v}
                        onClick={() => onWalletChange(v)}
                        className={cn(
                          'flex-1 py-1.5 text-[10px] font-mono border transition-all',
                          walletAmount === v
                            ? 'border-gold/40 bg-gold/10 text-gold'
                            : 'border-white/[0.07] text-stone hover:border-white/20'
                        )}
                      >
                        {v === 0 ? 'None' : v === maxWallet ? 'Full' : '50%'}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Payment methods */}
      {(effectiveTotal > 0 || walletAmount === 0) && METHODS.map((method) => {
        const isSelected = selected === method.id;
        const Icon       = method.icon;

        return (
          <motion.div
            key={method.id}
            layout
            onClick={() => onSelect(method.id)}
            className={cn(
              'border p-4 cursor-pointer transition-all duration-300',
              isSelected
                ? 'border-gold/50 bg-gold/5'
                : 'border-white/[0.07] hover:border-white/[0.15] bg-[#0f0f0f]'
            )}
            whileHover={{ y: -1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-4">
              {/* Radio */}
              <div className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0',
                isSelected ? 'border-gold' : 'border-white/[0.2]'
              )}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-gold"
                  />
                )}
              </div>

              {/* Icon */}
              <div className={cn(
                'w-9 h-9 flex items-center justify-center border transition-colors duration-300',
                isSelected ? 'border-gold/30 bg-gold/10' : 'border-white/[0.1]'
              )}>
                <Icon size={16} className={isSelected ? 'text-gold' : 'text-stone'} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={cn('text-sm font-medium', isSelected ? 'text-cream' : 'text-stone')}>
                    {method.label}
                  </p>
                  <span className={cn(
                    'text-[9px] font-mono border px-1.5 py-0.5',
                    method.badgeClass
                  )}>
                    {method.badge}
                  </span>
                </div>
                <p className="text-[11px] text-stone/40 leading-snug">{method.sub}</p>
              </div>
            </div>

            {/* Razorpay method icons */}
            {isSelected && method.id === 'razorpay' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2"
              >
                {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'Wallets'].map((m) => (
                  <span
                    key={m}
                    className="text-[10px] font-mono text-stone/30 border border-white/[0.05] px-2 py-1"
                  >
                    {m}
                  </span>
                ))}
              </motion.div>
            )}

            {/* COD note */}
            {isSelected && method.id === 'cod' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-white/[0.06]"
              >
                <div className="flex items-start gap-2 text-xs text-stone/50">
                  <Info size={12} className="shrink-0 mt-0.5 text-blue-400/50" />
                  <p>
                    Pay in cash when your order is delivered.
                    Please keep exact change ready to help our delivery agent.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Fully paid by wallet */}
      {effectiveTotal === 0 && walletAmount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20">
          <Wallet size={15} className="text-emerald-400 shrink-0" />
          <p className="text-emerald-400 text-sm">
            Your wallet covers the full amount — no additional payment needed!
          </p>
        </div>
      )}
    </div>
  );
}