import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}