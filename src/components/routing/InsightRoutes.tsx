import React from 'react';
import { Route } from 'react-router-dom';
import ClassInsightsPage from '@/pages/app/insights/ClassInsights';
import StudentInsightsPage from '@/pages/app/insights/IndividualInsights';
import SkillsInsightsPage from '@/pages/app/insights/SkillsInsights';
import RecommendationsPage from '@/pages/app/insights/Recommendations';
import { ProtectedRoute } from './RouteGuards';

export const InsightRoutes = () => [
  <Route
    key="insights-class"
    path="/app/insights/class"
    element={
      <ProtectedRoute>
        <ClassInsightsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="insights-individual"
    path="/app/insights/individual"
    element={
      <ProtectedRoute>
        <StudentInsightsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="insights-skills"
    path="/app/insights/skills"
    element={
      <ProtectedRoute>
        <SkillsInsightsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="insights-recommendations"
    path="/app/insights/recommendations"
    element={
      <ProtectedRoute>
        <RecommendationsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="insights-student"
    path="/app/insights/student/:id"
    element={
      <ProtectedRoute>
        <StudentInsightsPage />
      </ProtectedRoute>
    }
  />
];
