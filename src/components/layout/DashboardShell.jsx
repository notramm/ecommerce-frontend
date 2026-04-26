import { NavLink, useNavigate } from 'react-router-dom';
import { motion }  from 'framer-motion';
import {
  User, Package, Heart, MapPin, Wallet,
  Store, LayoutDashboard, ShoppingBag,
  CreditCard, Tag, FileCheck, LogOut,
  ChevronRight
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { logoutAPI } from '../../api/auth.api';
import { toast }    from 'sonner';
import { cn }       from '../../utils/formatters';

const customerLinks = [
  { href: '/orders',    label: 'My Orders',    icon: Package },
  { href: '/profile',   label: 'Profile',      icon: User },
  { href: '/wishlist',  label: 'Wishlist',     icon: Heart },
  { href: '/addresses', label: 'Addresses',    icon: MapPin },
  { href: '/wallet',    label: 'Wallet',       icon: Wallet },
];

const vendorLinks = [
  { href: '/vendor/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/vendor/products',  label: 'Products',   icon: ShoppingBag },
  { href: '/vendor/orders',    label: 'Orders',     icon: Package },
  { href: '/vendor/payouts',   label: 'Payouts',    icon: CreditCard },
  { href: '/vendor/coupons',   label: 'Coupons',    icon: Tag },
  { href: '/vendor/kyc',       label: 'KYC',        icon: FileCheck },
];

const adminLinks = [
  { href: '/admin/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/orders',        label: 'Orders',        icon: Package },
  { href: '/admin/products',      label: 'Products',      icon: ShoppingBag },
  { href: '/admin/users',         label: 'Users',         icon: User },
  { href: '/admin/vendors',       label: 'Vendors',       icon: Store },
  { href: '/admin/analytics',     label: 'Analytics',     icon: CreditCard },
  { href: '/admin/banners',       label: 'CMS',           icon: LayoutDashboard },
  { href: '/admin/notifications', label: 'Notifications', icon: Package },
];

export default function DashboardShell({ children, title, subtitle }) {
  const { user, logout } = useAuthStore();
  const navigate         = useNavigate();

  const links = user?.role === 'admin'
    ? adminLinks
    : user?.role === 'vendor'
      ? [...vendorLinks, ...customerLinks]
      : customerLinks;

  const handleLogout = async () => {
    try { await logoutAPI(); } catch {}
    logout();
    navigate('/');
    toast.success('Signed out');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 pt-6 sm:pt-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr] gap-8 xl:gap-12 items-start">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-[calc(var(--nav-height)+24px)]">
          {/* User card */}
          <div className="bg-[#0d0d0d] border border-white/[0.07] p-5 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-display text-lg shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-cream text-sm font-medium truncate">{user?.name}</p>
                <p className="text-stone/40 text-[10px] font-mono truncate">
                  {user?.email || user?.phone}
                </p>
                <span className="text-[9px] font-mono text-gold/60 uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="bg-[#0d0d0d] border border-white/[0.07] overflow-hidden">
            {links.map((link, i) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 border-b border-white/[0.04] last:border-b-0 group',
                    isActive
                      ? 'bg-gold/8 text-gold border-l-2 border-l-gold pl-3.5'
                      : 'text-stone hover:text-cream hover:bg-white/[0.03]'
                  )}
                >
                  <Icon size={15} className="shrink-0" />
                  <span className="flex-1">{link.label}</span>
                  <ChevronRight
                    size={12}
                    className="opacity-0 group-hover:opacity-40 transition-opacity shrink-0"
                  />
                </NavLink>
              );
            })}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-stone/50 hover:text-vermillion transition-colors border-t border-white/[0.06]"
            >
              <LogOut size={15} className="shrink-0" />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main>
          {/* Page header */}
          {(title || subtitle) && (
            <div className="mb-6 sm:mb-8">
              {subtitle && <p className="eyebrow text-gold/50 text-[10px] mb-2">{subtitle}</p>}
              {title && (
                <h1 className="font-display text-2xl sm:text-3xl text-cream">{title}</h1>
              )}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}