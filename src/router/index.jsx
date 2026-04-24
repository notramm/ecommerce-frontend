import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PageSkeleton }   from '../components/ui/Skeleton';
import ProtectedRoute     from './ProtectedRoute';
import RoleRoute          from './RoleRoute';

// ✅ react-router-dom v7 — createBrowserRouter is same API, no breaking changes here

const S = (C) => (
  <Suspense fallback={<PageSkeleton />}>
    <C />
  </Suspense>
);

const LoginPage          = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage       = lazy(() => import('../pages/auth/RegisterPage'));
const HomePage           = lazy(() => import('../pages/home/HomePage'));
const ProductListPage    = lazy(() => import('../pages/products/ProductListPage'));
const ProductDetailPage  = lazy(() => import('../pages/products/ProductDetailPage'));
const CartPage           = lazy(() => import('../pages/cart/CartPage'));
const CheckoutPage       = lazy(() => import('../pages/checkout/CheckoutPage'));
const OrderSuccessPage   = lazy(() => import('../pages/checkout/OrderSuccessPage'));
const ProfilePage        = lazy(() => import('../pages/user/ProfilePage'));
const OrdersPage         = lazy(() => import('../pages/user/OrdersPage'));
const OrderDetailPage    = lazy(() => import('../pages/user/OrderDetailPage'));
const WishlistPage       = lazy(() => import('../pages/user/WishlistPage'));
const AddressesPage      = lazy(() => import('../pages/user/AddressesPage'));
const WalletPage         = lazy(() => import('../pages/user/WalletPage'));
const VendorDashboard    = lazy(() => import('../pages/vendor/VendorDashboard'));
const VendorProducts     = lazy(() => import('../pages/vendor/VendorProducts'));
const VendorOrders       = lazy(() => import('../pages/vendor/VendorOrders'));
const VendorPayouts      = lazy(() => import('../pages/vendor/VendorPayouts'));
const VendorRegister     = lazy(() => import('../pages/vendor/VendorRegister'));
const VendorKYC          = lazy(() => import('../pages/vendor/VendorKYC'));
const VendorCoupons      = lazy(() => import('../pages/vendor/VendorCoupons'));
const AdminDashboard     = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers         = lazy(() => import('../pages/admin/AdminUsers'));
const AdminOrders        = lazy(() => import('../pages/admin/AdminOrders'));
const AdminProducts      = lazy(() => import('../pages/admin/AdminProducts'));
const AdminVendors       = lazy(() => import('../pages/admin/AdminVendors'));
const AdminAnalytics     = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminBanners       = lazy(() => import('../pages/admin/AdminBanners'));
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'));
const NotFoundPage       = lazy(() => import('../pages/NotFoundPage'));
const UnauthorizedPage   = lazy(() => import('../pages/UnauthorizedPage'));

export const router = createBrowserRouter([
  { path: '/login',           element: S(LoginPage) },
  { path: '/register',        element: S(RegisterPage) },
  { path: '/',                element: S(HomePage) },
  { path: '/products',        element: S(ProductListPage) },
  { path: '/products/:slug',  element: S(ProductDetailPage) },

  {
    element: <ProtectedRoute />,
    children: [
      { path: '/cart',              element: S(CartPage) },
      { path: '/checkout',          element: S(CheckoutPage) },
      { path: '/order/success/:id', element: S(OrderSuccessPage) },
      { path: '/profile',           element: S(ProfilePage) },
      { path: '/orders',            element: S(OrdersPage) },
      { path: '/orders/:id',        element: S(OrderDetailPage) },
      { path: '/wishlist',          element: S(WishlistPage) },
      { path: '/addresses',         element: S(AddressesPage) },
      { path: '/wallet',            element: S(WalletPage) },
      { path: '/vendor/register',   element: S(VendorRegister) },
    ],
  },

  {
    element: <RoleRoute roles={['vendor', 'admin']} />,
    children: [
      { path: '/vendor/dashboard', element: S(VendorDashboard) },
      { path: '/vendor/products',  element: S(VendorProducts) },
      { path: '/vendor/orders',    element: S(VendorOrders) },
      { path: '/vendor/payouts',   element: S(VendorPayouts) },
      { path: '/vendor/kyc',       element: S(VendorKYC) },
      { path: '/vendor/coupons',   element: S(VendorCoupons) },
    ],
  },

  {
    element: <RoleRoute roles={['admin']} />,
    children: [
      { path: '/admin/dashboard',     element: S(AdminDashboard) },
      { path: '/admin/users',         element: S(AdminUsers) },
      { path: '/admin/orders',        element: S(AdminOrders) },
      { path: '/admin/products',      element: S(AdminProducts) },
      { path: '/admin/vendors',       element: S(AdminVendors) },
      { path: '/admin/analytics',     element: S(AdminAnalytics) },
      { path: '/admin/banners',       element: S(AdminBanners) },
      { path: '/admin/notifications', element: S(AdminNotifications) },
    ],
  },

  { path: '/unauthorized', element: S(UnauthorizedPage) },
  { path: '*',             element: S(NotFoundPage) },
]);