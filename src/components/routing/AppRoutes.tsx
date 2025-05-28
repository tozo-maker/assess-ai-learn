
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/app/Dashboard';
import { ProtectedRoute } from './RouteGuards';
import { PublicRoutes } from './PublicRoutes';
import { StudentRoutes } from './StudentRoutes';
import { AssessmentRoutes } from './AssessmentRoutes';
import { InsightRoutes } from './InsightRoutes';
import { ReportsRoutes } from './ReportsRoutes';
import { SettingsRoutes } from './SettingsRoutes';

const AppRoutes = () => {
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

      {/* More specific fallback for unmatched /app routes */}
      <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
      
      {/* Global fallback for non-app routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
