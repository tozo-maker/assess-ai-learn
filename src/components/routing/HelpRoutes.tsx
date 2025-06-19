
import React from 'react';
import { Route } from 'react-router-dom';
import HelpPage from '@/pages/app/help/Help';
import { ProtectedRoute } from './RouteGuards';

export const HelpRoutes = () => {
  return (
    <React.Fragment>
      <Route
        path="/app/help"
        element={
          <ProtectedRoute>
            <HelpPage />
          </ProtectedRoute>
        }
      />
    </React.Fragment>
  );
};
