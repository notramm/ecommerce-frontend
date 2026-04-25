import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z }      from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Camera, X, Loader2 } from 'lucide-react';
import { getProductReviews, createReview } from '../../api/review.api';
import ReviewCard  from './ReviewCard';
import RatingStars from './RatingStars';
import { Skeleton } from '../ui/Skeleton';
import { cn }       from '../../utils/formatters';
import useAuthStore from '../../store/authStore';
import { toast }    from 'sonner';
import { getPagination } from '../../utils/formatters';

const schema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title:  z.string().max(100).optional(),
  body:   z.string().min(10, 'Write at least 10 characters'),
});

// ── Star input ────────────────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={cn(
              'transition-colors duration-150',
              n <= (hover || value) ? 'fill-gold text-gold' : 'text-stone/20'
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ── Rating distribution bar ───────────────────────────────────────────────────
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-stone/50 font-mono w-3 text-right">{star}</span>
      <Star size={10} className="text-stone/30 shrink-0" />
      <div className="flex-1 h-1.5 bg-white/[0.05] overflow-hidden">
        <motion.div
          className="h-full bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-stone/30 font-mono w-6">{count}</span>
    </div>
  );
}

// ── Main reviews section ──────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest' },
  { value: 'oldest',  label: 'Oldest' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest',  label: 'Lowest Rated' },
  { value: 'helpful', label: 'Most Helpful' },
];

export default function ReviewsSection({ productId, orderId, rating, ratingCount }) {
  const [sort,          setSort]          = useState('newest');
  const [filterRating,  setFilterRating]  = useState(null);
  const [page,          setPage]          = useState(1);
  const [showForm,      setShowForm]      = useState(false);
  const [starValue,     setStarValue]     = useState(0);
  const formRef                            = useRef(null);
  const { isLoggedIn }                    = useAuthStore();
  const queryClient                        = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey:  ['reviews', productId, sort, filterRating, page],
    queryFn:   () => getProductReviews(productId, {
      sort,
      rating: filterRating || undefined,
      page,
      limit: 5,
    }),
    staleTime: 2 * 60 * 1000,
    enabled:   !!productId,
  });

  const reviews     = data?.data?.reviews || [];
  const meta        = data?.data?.meta;
  const distribution = data?.data?.distribution || {};

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, title: '', body: '' },
  });

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: (d) => createReview({ ...d, productId, orderId }),
    onSuccess: () => {
      toast.success('Review submitted!');
      reset();
      setStarValue(0);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit'),
  });

  const onSubmit = (d) => {
    if (!starValue) { toast.error('Select a rating'); return; }
    submitReview({ ...d, rating: starValue });
  };

  return (
    <div className="mt-16 sm:mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <p className="eyebrow text-gold/50 mb-2">Customer Reviews</p>
          <h2 className="font-display text-2xl sm:text-3xl text-cream">
            What buyers say
          </h2>
        </div>
        {isLoggedIn && orderId && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="btn-outline text-sm self-start sm:self-auto"
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {/* Summary row */}
      {ratingCount > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 mb-10 pb-10 border-b border-white/[0.06]">
          {/* Overall */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <p className="font-display text-6xl sm:text-7xl text-cream leading-none mb-2">
              {Number(rating).toFixed(1)}
            </p>
            <RatingStars value={rating} size="md" showCount={false} />
            <p className="text-stone/40 text-xs font-mono mt-2">
              {ratingCount} review{ratingCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={cn(
                  'w-full group transition-opacity',
                  filterRating && filterRating !== star ? 'opacity-40' : 'opacity-100'
                )}
              >
                <RatingBar
                  star={star}
                  count={distribution[star] || 0}
                  total={ratingCount}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Write review form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mb-10"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-[#0f0f0f] border border-white/[0.07] p-5 sm:p-7 space-y-5"
            >
              <p className="eyebrow text-stone/50 text-[10px]">Your Review</p>

              {/* Star rating */}
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-3">Rating</label>
                <StarInput
                  value={starValue}
                  onChange={(v) => { setStarValue(v); setValue('rating', v); }}
                />
                {errors.rating && (
                  <p className="text-xs text-vermillion/80 mt-1.5">{errors.rating.message}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-2">Title (optional)</label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="Summarise your experience"
                  className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none transition-all"
                />
              </div>

              {/* Body */}
              <div>
                <label className="eyebrow text-stone/40 text-[10px] block mb-2">Review</label>
                <textarea
                  {...register('body')}
                  placeholder="Share details about your experience with this product..."
                  rows={4}
                  className="w-full bg-[#0a0a0a] border border-white/[0.07] focus:border-gold/40 text-cream placeholder:text-stone/20 px-4 py-3 text-sm outline-none transition-all resize-none"
                />
                {errors.body && (
                  <p className="text-xs text-vermillion/80 mt-1.5">{errors.body.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                  {isPending ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort & filter */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="flex items-center gap-1.5 text-[10px] font-mono text-stone border border-white/[0.08] px-2.5 py-1.5 hover:border-gold/30 transition-colors"
            >
              ★ {filterRating}+ <X size={10} />
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="bg-[#111] border border-white/[0.08] text-stone text-xs font-mono px-3 py-2 outline-none focus:border-gold/30 transition-colors"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
            <Star size={20} className="text-stone/20" />
          </div>
          <p className="text-stone text-sm">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div>
          {reviews.map((r, i) => (
            <ReviewCard key={r._id} review={r} index={i} />
          ))}

          {/* Pagination */}
          {meta?.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {[...Array(meta.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    'w-8 h-8 text-xs font-mono transition-all duration-200',
                    page === i + 1
                      ? 'bg-gold/10 border border-gold/40 text-gold'
                      : 'border border-white/[0.08] text-stone hover:text-cream hover:border-white/20'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}