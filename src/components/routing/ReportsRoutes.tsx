import React from 'react';
import { Route } from 'react-router-dom';
import ProgressReportsPage from '@/pages/app/reports/ProgressReports';
import ExportReports from '@/pages/app/reports/ExportReports';
import CommunicationsProgressReports from '@/pages/app/communications/ProgressReports';
import { ProtectedRoute } from './RouteGuards';

export const ReportsRoutes = () => [
  <Route
    key="reports-progress"
    path="/app/reports/progress"
    element={
      <ProtectedRoute>
        <ProgressReportsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="reports-export"
    path="/app/reports/export"
    element={
      <ProtectedRoute>
        <ExportReports />
      </ProtectedRoute>
    }
  />,
  <Route
    key="communications-progress"
    path="/app/communications/progress-reports"
    element={
      <ProtectedRoute>
        <CommunicationsProgressReports />
      </ProtectedRoute>
    }
  />
];
