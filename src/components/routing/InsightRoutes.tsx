
import React from 'react';
import { Route } from 'react-router-dom';
import ClassInsightsPage from '@/pages/app/insights/ClassInsights';
import StudentInsightsPage from '@/pages/app/insights/IndividualInsights';
import SkillsInsightsPage from '@/pages/app/insights/SkillsInsights';
import RecommendationsPage from '@/pages/app/insights/Recommendations';
import { ProtectedRoute } from './RouteGuards';

export const InsightRoutes = () => (
  <React.Fragment>
    {/* Static routes first */}
    <Route
      path="/app/insights/class"
      element={
        <ProtectedRoute>
          <ClassInsightsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/insights/individual"
      element={
        <ProtectedRoute>
          <StudentInsightsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/insights/skills"
      element={
        <ProtectedRoute>
          <SkillsInsightsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/insights/recommendations"
      element={
        <ProtectedRoute>
          <RecommendationsPage />
        </ProtectedRoute>
      }
    />
    {/* Dynamic routes after static routes */}
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
