
import React from 'react';
import { Route } from 'react-router-dom';
import ProgressReportsPage from '@/pages/app/reports/ProgressReports';
import ExportReports from '@/pages/app/reports/ExportReports';
import ProgressReports from '@/pages/app/communications/ProgressReports';
import { ProtectedRoute } from './RouteGuards';

export const ReportsRoutes = () => (
  <>
    <Route
      path="/app/reports/progress"
      element={
        <ProtectedRoute>
          <ProgressReportsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/reports/export"
      element={
        <ProtectedRoute>
          <ExportReports />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/communications/progress-reports"
      element={
        <ProtectedRoute>
          <ProgressReports />
        </ProtectedRoute>
      }
    />
  </>
);
