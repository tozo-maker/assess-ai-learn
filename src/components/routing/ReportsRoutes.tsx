
import React from 'react';
import { Route } from 'react-router-dom';
import ReportsPage from '@/pages/app/reports/Reports';
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
    </React.Fragment>
  );
};
