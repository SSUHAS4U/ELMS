import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../hooks/useAuthStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-base">
        <div className="w-9 h-9 border-[3px] border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Save attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but wrong role, push them to their designated root
    return <Navigate to={`/dashboard/${user.role}/home`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
