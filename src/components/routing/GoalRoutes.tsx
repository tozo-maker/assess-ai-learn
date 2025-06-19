
import React from 'react';
import { Route } from 'react-router-dom';
import GoalsPage from '@/pages/app/goals/Goals';
import { ProtectedRoute } from './RouteGuards';

export const GoalRoutes = () => {
  return (
    <React.Fragment>
      <Route
        path="/app/goals"
        element={
          <ProtectedRoute>
            <GoalsPage />
          </ProtectedRoute>
        }
      />
    </React.Fragment>
  );
};
