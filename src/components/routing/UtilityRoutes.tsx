
import React from 'react';
import { Route } from 'react-router-dom';
import DesignSystemPage from '@/pages/app/DesignSystem';
import TestingPage from '@/pages/app/Testing';
import { ProtectedRoute } from './RouteGuards';

export const UtilityRoutes = () => (
  <React.Fragment>
    <Route
      path="/app/design-system"
      element={
        <ProtectedRoute>
          <DesignSystemPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/testing"
      element={
        <ProtectedRoute>
          <TestingPage />
        </ProtectedRoute>
      }
    />
  </React.Fragment>
);
