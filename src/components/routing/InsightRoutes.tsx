
import React from 'react';
import { Route } from 'react-router-dom';
import ClassInsightsPage from '@/pages/app/insights/ClassInsights';
import StudentInsightsPage from '@/pages/app/insights/IndividualInsights';
import { ProtectedRoute } from './RouteGuards';

export const InsightRoutes = () => (
  <React.Fragment>
    <Route
      path="/app/insights/class"
      element={
        <ProtectedRoute>
          <ClassInsightsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/insights/student/:id"
      element={
        <ProtectedRoute>
          <StudentInsightsPage />
        </ProtectedRoute>
      }
    />
  </React.Fragment>
);
