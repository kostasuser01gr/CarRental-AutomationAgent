import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth';

export function ProtectedRoute() {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
