import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle } from 'lucide-react';
import { cn, formatPrice, formatDiscount } from '../../utils/formatters';

// ── Color swatch ──────────────────────────────────────────────────────────────
const COLOR_MAP = {
  black: '#0a0a0a', white: '#f5f0e8', red: '#c94a2e', blue: '#2563eb',
  green: '#16a34a', yellow: '#eab308', purple: '#9333ea', pink: '#ec4899',
  orange: '#f97316', grey: '#6b7280', gray: '#6b7280', navy: '#1e3a5f',
  brown: '#92400e', beige: '#d4b896', gold: '#c9a96e', silver: '#94a3b8',
};

function getSwatch(colorStr) {
  const key = Object.keys(COLOR_MAP).find((k) =>
    colorStr.toLowerCase().includes(k)
  );
  return key ? COLOR_MAP[key] : null;
}

// ── Attribute group ───────────────────────────────────────────────────────────
function AttributeSelector({ attrKey, values, selected, onSelect, soldOutValues }) {
  const isColor = attrKey.toLowerCase().includes('color') || attrKey.toLowerCase().includes('colour');

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="eyebrow text-stone/60 text-[10px]">{attrKey}</p>
        {selected && <p className="text-xs text-cream font-medium">{selected}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((val) => {
          const swatch    = isColor ? getSwatch(val) : null;
          const isSoldOut = soldOutValues?.includes(val);
          const isActive  = selected === val;

          if (isColor && swatch) {
            return (
              <button
                key={val}
                onClick={() => !isSoldOut && onSelect(attrKey, val)}
                disabled={isSoldOut}
                title={val}
                className={cn(
                  'relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 transition-all duration-200',
                  isActive  ? 'border-gold scale-110' : 'border-white/[0.1] hover:border-white/30',
                  isSoldOut && 'opacity-30 cursor-not-allowed'
                )}
                style={{ background: swatch }}
              >
                {isActive && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full border border-white/80" />
                  </span>
                )}
                {isSoldOut && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-px h-7 bg-white/40 rotate-45" />
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={val}
              onClick={() => !isSoldOut && onSelect(attrKey, val)}
              disabled={isSoldOut}
              className={cn(
                'relative px-3 sm:px-4 py-1.5 sm:py-2 border text-xs sm:text-sm font-sans transition-all duration-200',
                isActive
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-white/[0.1] text-stone hover:border-white/30 hover:text-cream',
                isSoldOut && 'opacity-30 cursor-not-allowed line-through'
              )}
            >
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Stock badge ───────────────────────────────────────────────────────────────
function StockBadge({ stock }) {
  if (stock === 0) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-vermillion font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-vermillion" />
        Out of stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-yellow-500 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        Only {stock} left
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      In stock
    </span>
  );
}

// ── Main variant selector ─────────────────────────────────────────────────────
export default function VariantSelector({ variants = [], selected, onSelect }) {
  // Build attribute → unique values map
  const attrMap = {};
  variants.forEach((v) => {
    if (!v.isActive) return;
    (v.attributes instanceof Map ? v.attributes : new Map(Object.entries(v.attributes || {}))).forEach((val, key) => {
      if (!attrMap[key]) attrMap[key] = new Set();
      attrMap[key].add(val);
    });
  });

  // Find sold-out values per attribute
  const soldOutMap = {};
  Object.keys(attrMap).forEach((key) => {
    soldOutMap[key] = [];
    attrMap[key].forEach((val) => {
      const hasStock = variants.some((v) => {
        const attrs = v.attributes instanceof Map ? v.attributes : new Map(Object.entries(v.attributes || {}));
        return attrs.get(key) === val && v.stock > 0 && v.isActive;
      });
      if (!hasStock) soldOutMap[key].push(val);
    });
  });

  // Handle attribute selection
  const handleAttrSelect = (key, val) => {
    const newAttrs = {
      ...(selected?.attributes instanceof Map
        ? Object.fromEntries(selected.attributes)
        : selected?.attributes || {}),
      [key]: val,
    };

    // Find matching variant
    const match = variants.find((v) => {
      if (!v.isActive) return false;
      const attrs = v.attributes instanceof Map ? v.attributes : new Map(Object.entries(v.attributes || {}));
      return Object.entries(newAttrs).every(([k, vv]) => attrs.get(k) === vv);
    });

    if (match) onSelect(match);
  };

  const currentAttrs = selected?.attributes instanceof Map
    ? Object.fromEntries(selected.attributes)
    : selected?.attributes || {};

  return (
    <div className="space-y-5">
      {/* Attributes */}
      {Object.entries(attrMap).map(([key, valSet]) => (
        <AttributeSelector
          key={key}
          attrKey={key}
          values={[...valSet]}
          selected={currentAttrs[key]}
          onSelect={handleAttrSelect}
          soldOutValues={soldOutMap[key]}
        />
      ))}

      {/* Selected variant info */}
      {selected && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selected._id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-between pt-2"
          >
            <div className="flex items-center gap-2">
              <Package size={13} className="text-stone/40" />
              <span className="text-xs text-stone/50 font-mono">SKU: {selected.sku}</span>
            </div>
            <StockBadge stock={selected.stock} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}