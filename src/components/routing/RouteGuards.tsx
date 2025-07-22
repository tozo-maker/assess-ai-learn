
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { productionLogger } from '@/services/production-logger';

// Protected Route Component
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  productionLogger.debug('ProtectedRoute auth check', { isLoading, hasUser: !!user });

  if (isLoading) {
    productionLogger.debug('ProtectedRoute showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    productionLogger.debug('ProtectedRoute redirecting to login');
    return <Navigate to="/login" replace />;
  }

  productionLogger.debug('ProtectedRoute rendering protected content');
  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if authenticated)
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  productionLogger.debug('PublicRoute auth check', { isLoading, hasUser: !!user });

  if (isLoading) {
    productionLogger.debug('PublicRoute showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    productionLogger.debug('PublicRoute redirecting to dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  productionLogger.debug('PublicRoute rendering public content');
  return <>{children}</>;
};
