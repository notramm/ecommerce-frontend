import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { cn } from '../../utils/formatters';

// ── Zoom overlay ──────────────────────────────────────────────────────────────
function ZoomOverlay({ image, onClose }) {
  const [pos,    setPos]    = useState({ x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);
  const imgRef              = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!zoomed) return;
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setPos({ x, y });
  }, [zoomed]);

  return (
    <motion.div
      className="fixed inset-0 z-[70] bg-obsidian/98 backdrop-blur-xl flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 p-2.5 border border-white/[0.1] text-stone hover:text-cream hover:border-gold/30 transition-all"
      >
        <X size={18} />
      </button>

      {/* Zoom toggle */}
      <button
        onClick={() => setZoomed(!zoomed)}
        className="absolute bottom-5 right-5 z-10 flex items-center gap-2 px-4 py-2.5 border border-white/[0.1] text-stone hover:text-cream hover:border-gold/30 transition-all text-xs font-mono"
      >
        {zoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
        {zoomed ? 'Zoom Out' : 'Zoom In'}
      </button>

      {/* Image */}
      <div
        ref={imgRef}
        className={cn(
          'relative max-w-4xl max-h-[85vh] w-full overflow-hidden',
          zoomed ? 'cursor-crosshair' : 'cursor-zoom-in'
        )}
        onMouseMove={handleMouseMove}
        onClick={() => setZoomed(!zoomed)}
      >
        <img
          src={image}
          alt="Product zoom"
          className="w-full h-full object-contain transition-transform duration-100"
          style={zoomed ? {
            transform:      'scale(2.5)',
            transformOrigin: `${pos.x}% ${pos.y}%`,
          } : { transform: 'scale(1)' }}
        />
      </div>
    </motion.div>
  );
}

// ── Main gallery ──────────────────────────────────────────────────────────────
export default function ImageGallery({ images = [], productName = '' }) {
  const [active,   setActive]   = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStart               = useRef(null);

  const safeImages = images.length
    ? images
    : [{ url: null, alt: productName }];

  const prev = () => setActive((p) => (p - 1 + safeImages.length) % safeImages.length);
  const next = () => setActive((p) => (p + 1) % safeImages.length);

  // Swipe support
  const onTouchStart  = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd    = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStart.current = null;
  };

  return (
    <>
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full">

        {/* Thumbnails — horizontal on mobile, vertical on desktop */}
        <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:max-h-[520px] lg:max-h-[600px] pb-1 sm:pb-0 sm:pr-0 shrink-0">
          {safeImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'relative shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] overflow-hidden border-2 transition-all duration-200',
                i === active
                  ? 'border-gold'
                  : 'border-white/[0.06] hover:border-white/[0.2] opacity-60 hover:opacity-100'
              )}
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.alt || productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1a1a1a]" />
              )}
            </button>
          ))}
        </div>

        {/* Main image */}
        <div
          className="relative flex-1 aspect-square sm:aspect-[4/5] bg-[#111] overflow-hidden group cursor-zoom-in"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setZoomOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {safeImages[active]?.url ? (
                <img
                  src={safeImages[active].url}
                  alt={safeImages[active].alt || productName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#111] flex items-center justify-center">
                  <span className="font-display text-6xl text-white/[0.03]">
                    {productName?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows — show when >1 image */}
          {safeImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-obsidian/70 backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-stone hover:text-cream hover:border-gold/30 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-obsidian/70 backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-stone hover:text-cream hover:border-gold/30 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={16} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {safeImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setActive(i); }}
                    className={cn(
                      'transition-all duration-300',
                      i === active
                        ? 'w-5 h-1.5 bg-gold'
                        : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1.5 bg-obsidian/70 backdrop-blur-sm border border-white/[0.1] px-2.5 py-1.5">
              <Expand size={12} className="text-stone" />
              <span className="text-[10px] text-stone font-mono">Zoom</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom overlay */}
      <AnimatePresence>
        {zoomOpen && (
          <ZoomOverlay
            image={safeImages[active]?.url}
            onClose={() => setZoomOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}