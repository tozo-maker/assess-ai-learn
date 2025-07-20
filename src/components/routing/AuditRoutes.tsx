
import React from 'react';
import { Route } from 'react-router-dom';
import ProductionAudit from '@/pages/app/audit/ProductionAudit';
import ComprehensiveAudit from '@/pages/app/audit/ComprehensiveAudit';
import SystemVerification from '@/pages/app/SystemVerification';
import { ProtectedRoute } from './RouteGuards';

export const AuditRoutes = () => (
  <React.Fragment>
    <Route
      path="/app/audit"
      element={
        <ProtectedRoute>
          <ProductionAudit />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/audit/comprehensive"
      element={
        <ProtectedRoute>
          <ComprehensiveAudit />
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
