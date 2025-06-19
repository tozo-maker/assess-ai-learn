
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Protected Route Component
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  console.log('ProtectedRoute: Checking auth status - isLoading:', isLoading, 'user:', !!user);

  if (isLoading) {
    console.log('ProtectedRoute: Still loading, showing spinner');
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
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering protected content');
  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if authenticated)
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  console.log('PublicRoute: Checking auth status - isLoading:', isLoading, 'user:', !!user);

  if (isLoading) {
    console.log('PublicRoute: Still loading, showing spinner');
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
    console.log('PublicRoute: User authenticated, redirecting to dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  console.log('PublicRoute: No user found, rendering public content');
  return <>{children}</>;
};
