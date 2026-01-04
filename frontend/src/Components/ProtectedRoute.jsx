import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  allowedRoles 
})   {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Require authentication
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (user && allowedRoles) {
    const userTypeUpper = String(user.userType).toUpperCase();
    const allowedRolesUpper = allowedRoles.map(role => String(role).toUpperCase());

    if (!allowedRolesUpper.includes(userTypeUpper)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
  allowedRoles: PropTypes.arrayOf(
    PropTypes.oneOf(['CONSUMER', 'PROVIDER', 'consumer', 'provider'])
  ),
};


