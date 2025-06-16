
import React from 'react';
import { Route } from 'react-router-dom';
import SettingsProfilePage from '@/pages/app/settings/ProfileSettings';
import ProductionAudit from '@/pages/app/audit/ProductionAudit';
import SystemVerification from '@/pages/app/SystemVerification';
import { ProtectedRoute } from './RouteGuards';

export const SettingsRoutes = () => (
  <React.Fragment>
    <Route
      path="/app/settings/profile"
      element={
        <ProtectedRoute>
          <SettingsProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/audit"
      element={
        <ProtectedRoute>
          <ProductionAudit />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/verification"
      element={
        <ProtectedRoute>
          <SystemVerification />
        </ProtectedRoute>
      }
    />
  </React.Fragment>
);
