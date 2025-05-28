
import React from 'react';
import { Route } from 'react-router-dom';
import AssessmentsPage from '@/pages/app/assessments/Assessments';
import AddAssessmentPage from '@/pages/app/assessments/AddAssessment';
import EditAssessmentPage from '@/pages/app/assessments/EditAssessment';
import AssessmentDetailsPage from '@/pages/app/assessments/AssessmentDetails';
import ResponsesPage from '@/pages/app/assessments/AddStudentResponses';
import BatchAssessment from '@/pages/app/assessments/BatchAssessment';
import { ProtectedRoute } from './RouteGuards';

export const AssessmentRoutes = () => (
  <React.Fragment>
    <Route
      path="/app/assessments"
      element={
        <ProtectedRoute>
          <AssessmentsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/assessments/add"
      element={
        <ProtectedRoute>
          <AddAssessmentPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/assessments/:id/edit"
      element={
        <ProtectedRoute>
          <EditAssessmentPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/assessments/:id"
      element={
        <ProtectedRoute>
          <AssessmentDetailsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/assessments/:id/responses"
      element={
        <ProtectedRoute>
          <ResponsesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/assessments/batch"
      element={
        <ProtectedRoute>
          <BatchAssessment />
        </ProtectedRoute>
      }
    />
  </React.Fragment>
);
