/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 * Supports role-based access control
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { AppRole } from '../../types/auth.types';
import { ROUTES } from '../../config/routes';
import { Spinner } from '../../components/ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  portal?: 'hospital' | 'admin';
}

export function ProtectedRoute({
  children,
  requiredRole,
  portal
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }

  // Redirect to appropriate login if not authenticated
  if (!isAuthenticated) {
    const loginPath = portal === 'admin'
      ? ROUTES.ADMIN_LOGIN
      : portal === 'hospital'
        ? ROUTES.HOSPITAL_LOGIN
        : ROUTES.ROOT;

    return (
      <Navigate
        to={loginPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="w-16 h-16 bg-shock-red-light rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-shock-red"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
            Required role: <span className="font-medium">{requiredRole}</span>
          </p>
          <p className="text-sm text-gray-500">
            Current role: <span className="font-medium">{user?.role}</span>
          </p>
        </div>
      </div>
    );
  }

  // Check portal access
  if (portal === 'admin' && user?.role !== 'hospital_admin') {
    return (
      <Navigate
        to={ROUTES.ROOT}
        replace
      />
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
