
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
import { GoalRoutes } from './GoalRoutes';
import { SkillRoutes } from './SkillRoutes';
import { HelpRoutes } from './HelpRoutes';

const AppRoutes = () => {
  const location = useLocation();
  
  // Debug logging
  React.useEffect(() => {
    console.log('AppRoutes - Current route:', location.pathname);
    console.log('AppRoutes - Full location object:', location);
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

      {/* Goals Management Routes */}
      {GoalRoutes()}

      {/* Skills Management Routes */}
      {SkillRoutes()}

      {/* Insights Routes */}
      {InsightRoutes()}

      {/* Reports & Communications Routes */}
      {ReportsRoutes()}

      {/* Help & Support Routes */}
      {HelpRoutes()}

      {/* Settings & Audit Routes */}
      {SettingsRoutes()}

      {/* Global fallback for non-app routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
