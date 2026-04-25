import { useState }  from 'react';
import { motion }    from 'framer-motion';
import { ThumbsUp, MessageSquare, CheckCircle2 } from 'lucide-react';
import RatingStars   from './RatingStars';
import { formatDate } from '../../utils/formatters';
import { markHelpful } from '../../api/review.api';
import { toast }      from 'sonner';
import useAuthStore   from '../../store/authStore';
import { cn }         from '../../utils/formatters';

export default function ReviewCard({ review, index = 0 }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [voted,        setVoted]        = useState(false);
  const [showReply,    setShowReply]    = useState(false);
  const { isLoggedIn }                  = useAuthStore();

  const handleHelpful = async () => {
    if (!isLoggedIn) { toast.error('Sign in to vote'); return; }
    if (voted) return;
    try {
      await markHelpful(review._id);
      setHelpfulCount((p) => p + 1);
      setVoted(true);
      toast.success('Marked as helpful');
    } catch {
      toast.error('Failed to vote');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-white/[0.06] pb-6 mb-6 last:border-b-0 last:mb-0"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-sm font-display shrink-0">
            {review.customer?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-cream text-sm font-medium">{review.customer?.name || 'Anonymous'}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <RatingStars value={review.rating} showCount={false} />
              {review.isVerifiedPurchase && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400/70 font-mono">
                  <CheckCircle2 size={10} />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-[10px] text-stone/40 font-mono shrink-0">
          {formatDate(review.createdAt)}
        </span>
      </div>

      {/* Content */}
      {review.title && (
        <p className="text-cream text-sm font-medium mb-2">{review.title}</p>
      )}
      <p className="text-stone text-sm leading-relaxed mb-4">{review.body}</p>

      {/* Images */}
      {review.images?.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={`Review image ${i + 1}`}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover border border-white/[0.06] cursor-pointer hover:border-gold/30 transition-colors"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={handleHelpful}
          disabled={voted}
          className={cn(
            'flex items-center gap-1.5 text-xs transition-colors',
            voted ? 'text-gold cursor-default' : 'text-stone/50 hover:text-stone'
          )}
        >
          <ThumbsUp size={12} />
          Helpful {helpfulCount > 0 && `(${helpfulCount})`}
        </button>

        {review.vendorReply && (
          <button
            onClick={() => setShowReply(!showReply)}
            className="flex items-center gap-1.5 text-xs text-stone/50 hover:text-stone transition-colors"
          >
            <MessageSquare size={12} />
            Seller Reply
          </button>
        )}
      </div>

      {/* Vendor reply */}
      {review.vendorReply && showReply && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 ml-4 pl-4 border-l-2 border-gold/20"
        >
          <p className="eyebrow text-gold/50 text-[10px] mb-1.5">Seller Response</p>
          <p className="text-stone text-xs leading-relaxed">{review.vendorReply}</p>
        </motion.div>
      )}
    </motion.div>
  );
}