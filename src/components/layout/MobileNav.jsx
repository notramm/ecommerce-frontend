import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, ShoppingBag, Heart, User, Package, Store, LayoutDashboard } from 'lucide-react';
import useUIStore   from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { cn }       from '../../utils/formatters';

export default function MobileNav() {
  const { mobileNavOpen, closeMobileNav } = useUIStore();
  const { isLoggedIn, user, logout }      = useAuthStore();
  const navigate                           = useNavigate();

  const links = [
    { label: 'Home',     href: '/',        icon: Home },
    { label: 'Shop',     href: '/products',icon: ShoppingBag },
    { label: 'Wishlist', href: '/wishlist', icon: Heart,    auth: true },
    { label: 'Orders',   href: '/orders',  icon: Package,  auth: true },
    { label: 'Profile',  href: '/profile', icon: User,     auth: true },
    ...(user?.role === 'vendor' ? [{ label: 'Vendor Panel', href: '/vendor/dashboard', icon: Store }] : []),
    ...(user?.role === 'admin'  ? [{ label: 'Admin Panel',  href: '/admin/dashboard',  icon: LayoutDashboard }] : []),
  ].filter((l) => !l.auth || isLoggedIn);

  return (
    <AnimatePresence>
      {mobileNavOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileNav}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-[#0d0d0d] border-l border-white/[0.07] flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.07]">
              <span className="font-display text-xl text-cream">LUXE<span className="text-gold">.</span></span>
              <button
                onClick={closeMobileNav}
                className="p-2 text-stone hover:text-cream transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* User info */}
            {isLoggedIn && (
              <div className="p-6 border-b border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-display text-lg">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm text-cream font-medium">{user?.name}</p>
                    <p className="text-xs text-stone truncate">{user?.email || user?.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Links */}
            <nav className="flex-1 overflow-y-auto py-4">
              {links.map(({ label, href, icon: Icon }, idx) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={href}
                    onClick={closeMobileNav}
                    className="flex items-center gap-4 px-6 py-4 text-stone hover:text-cream hover:bg-white/[0.03] transition-all duration-200"
                  >
                    <Icon size={18} />
                    <span className="font-sans text-sm">{label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Auth button */}
            <div className="p-6 border-t border-white/[0.07]">
              {isLoggedIn ? (
                <button
                  onClick={() => { logout(); closeMobileNav(); navigate('/'); }}
                  className="w-full btn-outline py-3 text-vermillion/70 border-vermillion/20 hover:border-vermillion/40 hover:text-vermillion"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobileNav}
                  className="w-full btn-primary py-3 block text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}