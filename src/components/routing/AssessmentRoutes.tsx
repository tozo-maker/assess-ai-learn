import React from 'react';
import { Route } from 'react-router-dom';
import AssessmentsPage from '@/pages/app/assessments/Assessments';
import AddAssessmentPage from '@/pages/app/assessments/AddAssessment';
import EditAssessmentPage from '@/pages/app/assessments/EditAssessment';
import AssessmentDetailsPage from '@/pages/app/assessments/AssessmentDetails';
import ResponsesPage from '@/pages/app/assessments/AddStudentResponses';
import BatchAssessment from '@/pages/app/assessments/BatchAssessment';
import { ProtectedRoute } from './RouteGuards';

export const AssessmentRoutes = () => [
  <Route
    key="assessments"
    path="/app/assessments"
    element={
      <ProtectedRoute>
        <AssessmentsPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="assessments-add"
    path="/app/assessments/add"
    element={
      <ProtectedRoute>
        <AddAssessmentPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="assessments-batch"
    path="/app/assessments/batch"
    element={
      <ProtectedRoute>
        <BatchAssessment />
      </ProtectedRoute>
    }
  />,
  <Route
    key="assessments-edit"
    path="/app/assessments/:id/edit"
    element={
      <ProtectedRoute>
        <EditAssessmentPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="assessments-responses"
    path="/app/assessments/:id/responses"
    element={
      <ProtectedRoute>
        <ResponsesPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="assessments-details"
    path="/app/assessments/:id"
    element={
      <ProtectedRoute>
        <AssessmentDetailsPage />
      </ProtectedRoute>
    }
  />
];
