
import React from 'react';
import { Route } from 'react-router-dom';
import ReportsPage from '@/pages/app/reports/Reports';
import ProgressReports from '@/pages/app/reports/ProgressReports';
import Communications from '@/pages/app/communications/Communications';
import { ProtectedRoute } from './RouteGuards';

export const ReportsRoutes = () => {
  return (
    <React.Fragment>
      <Route
        path="/app/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/reports/progress-reports"
        element={
          <ProtectedRoute>
            <ProgressReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/communications"
        element={
          <ProtectedRoute>
            <Communications />
          </ProtectedRoute>
        }
      />
    </React.Fragment>
  );
};
