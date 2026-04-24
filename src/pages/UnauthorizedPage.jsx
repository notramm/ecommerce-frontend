import { Link }   from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-sm"
      >
        <div className="w-16 h-16 mx-auto bg-vermillion/10 border border-vermillion/20 flex items-center justify-center mb-6">
          <ShieldOff size={24} className="text-vermillion/70" />
        </div>
        <p className="eyebrow text-vermillion/50 mb-4">Access Denied</p>
        <h1 className="font-display text-3xl text-cream mb-3">Not authorized</h1>
        <p className="text-stone mb-10">
          You don't have permission to access this page.
        </p>
        <Link to="/" className="btn-outline inline-flex items-center gap-3">
          <ArrowLeft size={15} />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}