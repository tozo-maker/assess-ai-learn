
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from '@/pages/app/Dashboard';
import { ProtectedRoute } from './RouteGuards';
import { PublicRoutes } from './PublicRoutes';
import { StudentRoutes } from './StudentRoutes';
import { AssessmentRoutes } from './AssessmentRoutes';
import { InsightRoutes } from './InsightRoutes';
import { ReportsRoutes } from './ReportsRoutes';
import { SettingsRoutes } from './SettingsRoutes';

const AppRoutes = () => {
  const location = useLocation();
  
  // Debug logging
  React.useEffect(() => {
    console.log('Current route:', location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public Routes */}
      {PublicRoutes()}

      {/* Protected Dashboard Route */}
      <Route
        path="/app/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Default /app route redirects to dashboard */}
      <Route
        path="/app"
        element={<Navigate to="/app/dashboard" replace />}
      />

      {/* Student Management Routes */}
      {StudentRoutes()}

      {/* Assessment Management Routes */}
      {AssessmentRoutes()}

      {/* Insights Routes */}
      {InsightRoutes()}

      {/* Reports & Communications Routes */}
      {ReportsRoutes()}

      {/* Settings & Audit Routes */}
      {SettingsRoutes()}

      {/* Global fallback for non-app routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
