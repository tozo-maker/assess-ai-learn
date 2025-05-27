import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Landing and Auth Pages
import LandingPage from '@/pages/Index';
import LoginPage from '@/pages/auth/Login';
import SignupPage from '@/pages/auth/Signup';

// App Pages
import Dashboard from '@/pages/app/Dashboard';
import StudentsPage from '@/pages/app/students/Students';
import AddStudentPage from '@/pages/app/students/AddStudent';
import StudentDetailsPage from '@/pages/app/students/StudentProfile';
import AssessmentsPage from '@/pages/app/assessments/Assessments';
import AddAssessmentPage from '@/pages/app/assessments/AddAssessment';
import AssessmentDetailsPage from '@/pages/app/assessments/AssessmentDetails';
import ResponsesPage from '@/pages/app/assessments/AddStudentResponses';
import ClassInsightsPage from '@/pages/app/insights/ClassInsights';
import StudentInsightsPage from '@/pages/app/insights/IndividualInsights';
import ProgressReportsPage from '@/pages/app/reports/ProgressReports';
import ExportReports from '@/pages/app/reports/ExportReports';
import ProgressReports from '@/pages/app/communications/ProgressReports';
import SettingsProfilePage from '@/pages/app/settings/ProfileSettings';
import ProductionAudit from '@/pages/app/audit/ProductionAudit';
import ImportStudentsPage from '@/pages/app/students/ImportStudents';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        path="/app/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Student Management */}
      <Route
        path="/app/students"
        element={
          <ProtectedRoute>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/students/add"
        element={
          <ProtectedRoute>
            <AddStudentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/students/import"
        element={
          <ProtectedRoute>
            <ImportStudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/students/:id"
        element={
          <ProtectedRoute>
            <StudentDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* Assessment Management */}
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

      {/* Insights */}
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

      {/* Reports */}
      <Route
        path="/app/reports/progress"
        element={
          <ProtectedRoute>
            <ProgressReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/reports/export"
        element={
          <ProtectedRoute>
            <ExportReports />
          </ProtectedRoute>
        }
      />

      {/* Communications */}
      <Route
        path="/app/communications/progress-reports"
        element={
          <ProtectedRoute>
            <ProgressReports />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/app/settings/profile"
        element={
          <ProtectedRoute>
            <SettingsProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Production Audit */}
      <Route
        path="/app/audit"
        element={
          <ProtectedRoute>
            <ProductionAudit />
          </ProtectedRoute>
        }
      />

      {/* Fallback Routes */}
      <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
