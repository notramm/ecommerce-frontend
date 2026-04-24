import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense }      from 'react';
import { PageSkeleton }        from '../components/ui/Skeleton';
import ProtectedRoute          from './ProtectedRoute';
import RoleRoute               from './RoleRoute';

const wrap = (Component) => (
  <Suspense fallback={<PageSkeleton />}>
    <Component />
  </Suspense>
);

// Auth
const LoginPage    = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

// Public
const HomePage          = lazy(() => import('../pages/home/HomePage'));
const ProductListPage   = lazy(() => import('../pages/products/ProductListPage'));
const ProductDetailPage = lazy(() => import('../pages/products/ProductDetailPage'));

// Protected
const CartPage         = lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage     = lazy(() => import('../pages/checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('../pages/checkout/OrderSuccessPage'));
const ProfilePage      = lazy(() => import('../pages/user/ProfilePage'));
const OrdersPage       = lazy(() => import('../pages/user/OrdersPage'));
const OrderDetailPage  = lazy(() => import('../pages/user/OrderDetailPage'));
const WishlistPage     = lazy(() => import('../pages/user/WishlistPage'));
const AddressesPage    = lazy(() => import('../pages/user/AddressesPage'));
const WalletPage       = lazy(() => import('../pages/user/WalletPage'));

// Vendor
const VendorDashboard = lazy(() => import('../pages/vendor/VendorDashboard'));
const VendorProducts  = lazy(() => import('../pages/vendor/VendorProducts'));
const VendorOrders    = lazy(() => import('../pages/vendor/VendorOrders'));
const VendorPayouts   = lazy(() => import('../pages/vendor/VendorPayouts'));
const VendorRegister  = lazy(() => import('../pages/vendor/VendorRegister'));
const VendorKYC       = lazy(() => import('../pages/vendor/VendorKYC'));
const VendorCoupons   = lazy(() => import('../pages/vendor/VendorCoupons'));

// Admin
const AdminDashboard     = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers         = lazy(() => import('../pages/admin/AdminUsers'));
const AdminOrders        = lazy(() => import('../pages/admin/AdminOrders'));
const AdminProducts      = lazy(() => import('../pages/admin/AdminProducts'));
const AdminVendors       = lazy(() => import('../pages/admin/AdminVendors'));
const AdminAnalytics     = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminBanners       = lazy(() => import('../pages/admin/AdminBanners'));
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'));

// Error
const NotFoundPage     = lazy(() => import('../pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));

export const router = createBrowserRouter([
  // Auth
  { path: '/login',    element: wrap(LoginPage) },
  { path: '/register', element: wrap(RegisterPage) },

  // Public
  { path: '/',                      element: wrap(HomePage) },
  { path: '/products',              element: wrap(ProductListPage) },
  { path: '/products/:slug',        element: wrap(ProductDetailPage) },

  // Protected — any logged-in user
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/cart',                  element: wrap(CartPage) },
      { path: '/checkout',              element: wrap(CheckoutPage) },
      { path: '/order/success/:id',     element: wrap(OrderSuccessPage) },
      { path: '/profile',               element: wrap(ProfilePage) },
      { path: '/orders',                element: wrap(OrdersPage) },
      { path: '/orders/:id',            element: wrap(OrderDetailPage) },
      { path: '/wishlist',              element: wrap(WishlistPage) },
      { path: '/addresses',             element: wrap(AddressesPage) },
      { path: '/wallet',                element: wrap(WalletPage) },
    ],
  },

  // Vendor
  {
    element: <RoleRoute roles={['vendor']} />,
    children: [
      { path: '/vendor/dashboard', element: wrap(VendorDashboard) },
      { path: '/vendor/products',  element: wrap(VendorProducts) },
      { path: '/vendor/orders',    element: wrap(VendorOrders) },
      { path: '/vendor/payouts',   element: wrap(VendorPayouts) },
      { path: '/vendor/kyc',       element: wrap(VendorKYC) },
      { path: '/vendor/coupons',   element: wrap(VendorCoupons) },
    ],
  },

  // Vendor Registration (any user)
  { element: <ProtectedRoute />, children: [{ path: '/vendor/register', element: wrap(VendorRegister) }] },

  // Admin
  {
    element: <RoleRoute roles={['admin']} />,
    children: [
      { path: '/admin/dashboard',     element: wrap(AdminDashboard) },
      { path: '/admin/users',         element: wrap(AdminUsers) },
      { path: '/admin/orders',        element: wrap(AdminOrders) },
      { path: '/admin/products',      element: wrap(AdminProducts) },
      { path: '/admin/vendors',       element: wrap(AdminVendors) },
      { path: '/admin/analytics',     element: wrap(AdminAnalytics) },
      { path: '/admin/banners',       element: wrap(AdminBanners) },
      { path: '/admin/notifications', element: wrap(AdminNotifications) },
    ],
  },

  { path: '/unauthorized', element: wrap(UnauthorizedPage) },
  { path: '*',             element: wrap(NotFoundPage) },
]);