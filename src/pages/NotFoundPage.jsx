import { Link }   from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow text-gold/50 mb-6">Error 404</p>
        <h1 className="font-display text-[8rem] text-cream/10 font-bold leading-none mb-4 select-none">
          404
        </h1>
        <p className="heading-md text-cream mb-3">Page not found</p>
        <p className="text-stone max-w-sm mx-auto mb-10">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn-outline inline-flex items-center gap-3"
        >
          <ArrowLeft size={15} />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}