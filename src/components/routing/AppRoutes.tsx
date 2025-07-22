
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute, ProtectedRoute } from './RouteGuards';

// Public pages
import LandingPage from '@/pages/Index';
import LoginPage from '@/pages/auth/Login';
import SignupPage from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Dashboard and main app pages
import DashboardPage from '@/pages/app/Dashboard';

// Student pages
import StudentsPage from '@/pages/app/students/Students';
import AddStudentPage from '@/pages/app/students/AddStudent';
import StudentDetailsPage from '@/pages/app/students/StudentProfile';
import StudentAssessments from '@/pages/app/students/StudentAssessments';
import ImportStudentsPage from '@/pages/app/students/ImportStudents';

// Assessment pages
import AssessmentsPage from '@/pages/app/assessments/Assessments';
import AddAssessmentPage from '@/pages/app/assessments/AddAssessment';
import EditAssessmentPage from '@/pages/app/assessments/EditAssessment';
import AssessmentDetailsPage from '@/pages/app/assessments/AssessmentDetails';
import ResponsesPage from '@/pages/app/assessments/AddStudentResponses';
import BatchAssessment from '@/pages/app/assessments/BatchAssessment';
import AssessmentResults from '@/pages/app/assessments/AssessmentResults';

// Other app pages
import GoalsPage from '@/pages/app/goals/Goals';
import SkillsPage from '@/pages/app/skills/Skills';
import ReportsPage from '@/pages/app/reports/Reports';
import ProgressReports from '@/pages/app/reports/ProgressReports';
import Communications from '@/pages/app/communications/Communications';
import HelpPage from '@/pages/app/help/Help';
import SettingsProfilePage from '@/pages/app/settings/ProfileSettings';
import ProductionAudit from '@/pages/app/audit/ProductionAudit';
import ComprehensiveAudit from '@/pages/app/audit/ComprehensiveAudit';
import SystemVerification from '@/pages/app/SystemVerification';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
      <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/auth/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/auth/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/auth/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* Protected App Routes */}
      <Route path="/app/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      
      {/* Student Routes */}
      <Route path="/app/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
      <Route path="/app/students/add" element={<ProtectedRoute><AddStudentPage /></ProtectedRoute>} />
      <Route path="/app/students/import" element={<ProtectedRoute><ImportStudentsPage /></ProtectedRoute>} />
      <Route path="/app/students/:id" element={<ProtectedRoute><StudentDetailsPage /></ProtectedRoute>} />
      <Route path="/app/students/:id/assessments" element={<ProtectedRoute><StudentAssessments /></ProtectedRoute>} />
      
      {/* Assessment Routes */}
      <Route path="/app/assessments" element={<ProtectedRoute><AssessmentsPage /></ProtectedRoute>} />
      <Route path="/app/assessments/add" element={<ProtectedRoute><AddAssessmentPage /></ProtectedRoute>} />
      <Route path="/app/assessments/batch" element={<ProtectedRoute><BatchAssessment /></ProtectedRoute>} />
      <Route path="/app/assessments/:id/edit" element={<ProtectedRoute><EditAssessmentPage /></ProtectedRoute>} />
      <Route path="/app/assessments/:id/responses" element={<ProtectedRoute><ResponsesPage /></ProtectedRoute>} />
      <Route path="/app/assessments/:id/results" element={<ProtectedRoute><AssessmentResults /></ProtectedRoute>} />
      <Route path="/app/assessments/:id" element={<ProtectedRoute><AssessmentDetailsPage /></ProtectedRoute>} />
      
      {/* Other App Routes */}
      <Route path="/app/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
      <Route path="/app/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
      <Route path="/app/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/app/reports/progress-reports" element={<ProtectedRoute><ProgressReports /></ProtectedRoute>} />
      <Route path="/app/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
      <Route path="/app/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
      <Route path="/app/settings/profile" element={<ProtectedRoute><SettingsProfilePage /></ProtectedRoute>} />
      <Route path="/app/audit" element={<ProtectedRoute><ProductionAudit /></ProtectedRoute>} />
      <Route path="/app/audit/comprehensive" element={<ProtectedRoute><ComprehensiveAudit /></ProtectedRoute>} />
      <Route path="/app/verification" element={<ProtectedRoute><SystemVerification /></ProtectedRoute>} />
      
      {/* Default redirects */}
      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
};
