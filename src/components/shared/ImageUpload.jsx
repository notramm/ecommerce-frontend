import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence }        from 'framer-motion';
import { Upload, X, Image, Loader2 }      from 'lucide-react';
import { cn }                             from '../../utils/formatters';
import { toast }                          from 'sonner';

const DEFAULT_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp';
const MAX_SIZE_MB    = 5;

export default function ImageUpload({
  onUpload,
  onRemove,
  value       = [],       // array of { url, publicId } or File preview URLs
  maxFiles    = 5,
  accept      = DEFAULT_ACCEPT,
  label       = 'Upload Images',
  hint        = `JPG, PNG, WebP · Max ${MAX_SIZE_MB}MB each`,
  className,
  disabled    = false,
}) {
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews,  setPreviews]  = useState([]);
  const inputRef                   = useRef(null);

  const handleFiles = useCallback(async (files) => {
    const valid = Array.from(files).filter((f) => {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name} exceeds ${MAX_SIZE_MB}MB limit`);
        return false;
      }
      return true;
    });

    if (!valid.length) return;

    const totalAfter = previews.length + value.length + valid.length;
    if (totalAfter > maxFiles) {
      toast.error(`Max ${maxFiles} images allowed`);
      return;
    }

    // Generate local previews
    const newPreviews = valid.map((f) => ({
      url:  URL.createObjectURL(f),
      file: f,
      name: f.name,
    }));
    setPreviews((p) => [...p, ...newPreviews]);

    // Call parent handler
    if (onUpload) {
      setUploading(true);
      try {
        await onUpload(valid);
      } finally {
        setUploading(false);
      }
    }
  }, [previews, value, maxFiles, onUpload]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const removePreview = (idx) => {
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const removeExisting = (idx) => {
    onRemove?.(idx);
  };

  const allImages = [
    ...value.map((v) => ({ url: v?.url || v, existing: true })),
    ...previews,
  ];

  const canAddMore = allImages.length < maxFiles && !disabled;

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <p className="eyebrow text-stone/50 text-[10px]">{label}</p>
      )}

      {/* Existing + preview images */}
      {allImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {allImages.map((img, i) => (
              <motion.div
                key={img.url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative group w-16 h-16 sm:w-20 sm:h-20 border border-white/[0.08] overflow-hidden bg-[#111]"
              >
                <img
                  src={img.url}
                  alt={`Upload ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => img.existing ? removeExisting(i - previews.length) : removePreview(i - value.length)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-vermillion/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-cream" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-obsidian/70 text-[8px] text-gold text-center py-0.5 font-mono">
                    Primary
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add more button (inline) */}
          {canAddMore && (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-16 h-16 sm:w-20 sm:h-20 border border-dashed border-white/[0.1] flex items-center justify-center text-stone/40 hover:text-cream hover:border-gold/30 transition-all"
            >
              <Upload size={16} />
            </button>
          )}
        </div>
      )}

      {/* Drop zone — shown when no images or can add more, and no inline button */}
      {allImages.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed',
            'transition-all duration-200 cursor-pointer',
            dragging
              ? 'border-gold/50 bg-gold/5'
              : 'border-white/[0.1] hover:border-gold/30 hover:bg-white/[0.02]',
            disabled && 'opacity-40 cursor-not-allowed'
          )}
        >
          {uploading ? (
            <Loader2 size={24} className="text-stone/40 animate-spin" />
          ) : (
            <div className="w-12 h-12 border border-white/[0.1] flex items-center justify-center">
              <Image size={20} className="text-stone/30" />
            </div>
          )}
          <div className="text-center">
            <p className="text-stone text-sm">{uploading ? 'Uploading...' : 'Click or drag to upload'}</p>
            {hint && <p className="text-stone/30 text-[10px] mt-1">{hint}</p>}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}