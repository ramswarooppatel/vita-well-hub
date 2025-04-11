import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles = [] }) => {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // If we're still loading auth status, don't decide yet
    if (isLoading) {
      return;
    }

    // If no user, not authorized
    if (!user) {
      setIsAuthorized(false);
      return;
    }

    // If no specific roles are required, or user has required role
    if (allowedRoles.length === 0 || allowedRoles.includes(userRole || '')) {
      setIsAuthorized(true);
      return;
    }

    // User doesn't have required role
    setIsAuthorized(false);
  }, [user, userRole, isLoading, allowedRoles]);

  // Show loading while we're determining auth status
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If not authorized, redirect to login or unauthorized
  if (!isAuthorized) {
    // If user is logged in but unauthorized, send to unauthorized page
    if (user) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
    // Otherwise redirect to login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If we made it here, render the protected content
  return <>{children}</>;
};

export default RouteGuard;
