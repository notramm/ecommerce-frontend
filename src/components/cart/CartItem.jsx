import { useState }  from 'react';
import { Link }      from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, AlertTriangle } from 'lucide-react';
import { cn, formatPrice } from '../../utils/formatters';

export default function CartItem({ item, onUpdate, onRemove, isUpdating }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    onRemove(item._id);
  };

  const image      = item.variant?.image || item.imageSnapshot || null;
  const attrs      = item.variant?.attributes instanceof Map
    ? Object.fromEntries(item.variant.attributes)
    : item.variant?.attributes || {};

  return (
    <AnimatePresence>
      {!removing && (
        <motion.div
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="flex gap-4 sm:gap-5 py-5 sm:py-6 border-b border-white/[0.06]">

            {/* Image */}
            <Link
              to={`/products/${item.product?.slug || '#'}`}
              className="shrink-0 w-20 h-24 sm:w-24 sm:h-28 bg-[#111] border border-white/[0.06] overflow-hidden block"
            >
              {image ? (
                <img
                  src={image}
                  alt={item.nameSnapshot}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={20} className="text-stone/20" />
                </div>
              )}
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                {/* Name */}
                <Link
                  to={`/products/${item.product?.slug || '#'}`}
                  className="text-cream text-sm sm:text-base font-medium line-clamp-2 hover:text-gold transition-colors duration-200 block mb-1.5"
                >
                  {item.nameSnapshot}
                </Link>

                {/* Attributes */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(attrs).map(([k, v]) => (
                    <span
                      key={k}
                      className="text-[10px] text-stone/40 font-mono border border-white/[0.06] px-2 py-0.5"
                    >
                      {k}: {v}
                    </span>
                  ))}
                </div>

                {/* Price change warning */}
                {item.priceChanged && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-[10px] text-yellow-500 font-mono mb-2"
                  >
                    <AlertTriangle size={10} />
                    Price updated to {formatPrice(item.variant?.price)}
                  </motion.div>
                )}
              </div>

              {/* Bottom row */}
              <div className="flex items-end justify-between gap-4 flex-wrap">

                {/* Qty controls */}
                <div className="flex items-center border border-white/[0.1]">
                  <button
                    onClick={() => onUpdate(item._id, item.quantity - 1)}
                    disabled={isUpdating || item.quantity <= 1}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-stone hover:text-cream transition-colors disabled:opacity-30"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 sm:w-10 text-center text-sm font-mono text-cream tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdate(item._id, item.quantity + 1)}
                    disabled={isUpdating || item.quantity >= 10 || item.quantity >= (item.variant?.stock || 10)}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-stone hover:text-cream transition-colors disabled:opacity-30"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Price + remove */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-right">
                    <p className="text-cream font-mono text-sm sm:text-base">
                      {formatPrice(item.linePrice)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-stone/40 text-[10px] font-mono">
                        {formatPrice(item.variant?.price)} each
                      </p>
                    )}
                    {item.lineSavings > 0 && (
                      <p className="text-emerald-400 text-[10px] font-mono">
                        Save {formatPrice(item.lineSavings)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleRemove}
                    className="text-stone/30 hover:text-vermillion transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}