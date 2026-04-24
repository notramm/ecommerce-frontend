import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function RoleRoute({ roles }) {
  const { isLoggedIn, user } = useAuthStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}