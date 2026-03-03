import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';

const ROLE_DASHBOARDS = {
  admin: '/admin/dashboard',
  'sub-admin': '/subadmin/dashboard',
  volunteer: '/volunteer/dashboard',
};

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboard = ROLE_DASHBOARDS[user.role] || '/';
    return <Navigate to={dashboard} replace />;
  }

  return <Outlet />;
}
