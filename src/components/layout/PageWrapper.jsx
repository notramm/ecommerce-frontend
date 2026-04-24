import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import MobileNav from './MobileNav';

export default function PageWrapper({ children, noFooter = false, noNav = false }) {
  return (
    <div className="min-h-screen bg-obsidian text-cream">
      {!noNav && <Navbar />}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={!noNav ? 'pt-[var(--nav-height)]' : ''}
      >
        {children}
      </motion.main>
      {!noFooter && <Footer />}
      <CartDrawer />
      <MobileNav />
    </div>
  );
}