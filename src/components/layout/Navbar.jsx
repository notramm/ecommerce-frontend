import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, Menu, User, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore   from '../../store/uiStore';
import useCartStore from '../../store/cartStore';
import { cn }       from '../../utils/formatters';
import SearchBar from '../shared/SearchBar';
import NotificationBell from '../shared/NotificationBell';

const NAV_LINKS = [
  { label: 'Shop',        href: '/products' },
  { label: 'Categories',  href: '/categories' },
  { label: 'New Arrivals',href: '/products?isNewArrival=true' },
  { label: 'Sale',        href: '/products?sort=price_asc' },
];

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const { isLoggedIn, user }         = useAuthStore();
  const { openCart, openSearch, openMobileNav } = useUIStore();
  const { itemCount, serverCart }    = useCartStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  const count = isLoggedIn ? serverCart?.itemCount || 0 : itemCount;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-obsidian/95 backdrop-blur-xl border-b border-[var(--border)]'
          : isHome
            ? 'bg-transparent'
            : 'bg-obsidian/95 backdrop-blur-xl border-b border-[var(--border)]'
      )}
      style={{ height: 'var(--nav-height)' }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="font-display text-xl tracking-tight text-cream">
            LUXE<span className="text-gold">.</span>
          </span>
          <span className="hidden sm:block w-px h-4 bg-[var(--border)]" />
          <span className="hidden sm:block eyebrow text-stone/40">Commerce</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onMouseEnter={() => setHoveredLink(link.href)}
              onMouseLeave={() => setHoveredLink(null)}
              className="relative font-sans text-sm text-stone hover:text-cream transition-colors duration-200"
            >
              {link.label}
              <AnimatePresence>
                {hoveredLink === link.href && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-gold"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <button
            onClick={openSearch}
            className="p-2.5 text-stone hover:text-cream transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Wishlist */}
          {isLoggedIn && (
            <Link to="/wishlist" className="p-2.5 text-stone hover:text-cream transition-colors">
              <Heart size={18} />
            </Link>
          )}

          <NotificationBell />

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative p-2.5 text-stone hover:text-cream transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-gold text-obsidian text-[10px] font-mono font-medium px-1"
              >
                {count > 99 ? '99+' : count}
              </motion.span>
            )}
          </button>

          {/* User */}
          {isLoggedIn ? (
            <div className="relative group ml-1">
              <button className="flex items-center gap-2 p-2 text-stone hover:text-cream transition-colors">
                <div className="w-7 h-7 rounded-full bg-surface border border-[var(--border)] flex items-center justify-center text-xs font-mono text-gold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown size={12} className="transition-transform group-hover:rotate-180 duration-200" />
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#111] border border-[var(--border)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                <div className="p-4 border-b border-[var(--border)]">
                  <p className="text-sm text-cream font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-stone truncate mt-0.5">{user?.email || user?.phone}</p>
                </div>
                <div className="py-1">
                  {[
                    { label: 'My Orders',  href: '/orders' },
                    { label: 'Profile',    href: '/profile' },
                    { label: 'Wishlist',   href: '/wishlist' },
                    { label: 'Wallet',     href: '/wallet' },
                    ...(user?.role === 'vendor' ? [{ label: 'Vendor Panel', href: '/vendor/dashboard' }] : []),
                    ...(user?.role === 'admin'  ? [{ label: 'Admin Panel',  href: '/admin/dashboard' }] : []),
                  ].map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="block px-4 py-2.5 text-sm text-stone hover:text-cream hover:bg-white/5 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      useAuthStore.getState().logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-stone hover:text-vermillion transition-colors border-t border-[var(--border)] mt-1"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 btn-outline !px-5 !py-2 !text-xs"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu */}
          <button
            onClick={openMobileNav}
            className="lg:hidden p-2.5 ml-1 text-stone hover:text-cream transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
      <SearchBar />
    </motion.header>
  );
}