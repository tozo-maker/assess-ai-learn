import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute, ProtectedRoute } from './RouteGuards';
import AppLayout from '@/components/layout/AppLayout';

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

// Classes pages
import ClassesPage from '@/pages/app/classes/Classes';

// Assessment pages
import AssessmentsPage from '@/pages/app/assessments/Assessments';
import AddAssessmentPage from '@/pages/app/assessments/AddAssessment';
import EditAssessmentPage from '@/pages/app/assessments/EditAssessment';
import AssessmentDetailsPage from '@/pages/app/assessments/AssessmentDetails';
import ResponsesPage from '@/pages/app/assessments/AddStudentResponses';
import BatchAssessment from '@/pages/app/assessments/BatchAssessment';
import AssessmentResults from '@/pages/app/assessments/AssessmentResults';

// Insights pages
import InsightsPage from '@/pages/app/insights/Insights';
import ClassInsightsPage from '@/pages/app/insights/ClassInsights';
import IndividualInsightsPage from '@/pages/app/insights/IndividualInsights';
import SkillsInsightsPage from '@/pages/app/insights/SkillsInsights';
import RecommendationsPage from '@/pages/app/insights/Recommendations';

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

      {/* Protected App Routes - All wrapped with AppLayout */}
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Student Routes */}
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/add" element={<AddStudentPage />} />
        <Route path="students/import" element={<ImportStudentsPage />} />
        <Route path="students/:id" element={<StudentDetailsPage />} />
        <Route path="students/:id/assessments" element={<StudentAssessments />} />
        
        {/* Classes Routes */}
        <Route path="classes" element={<ClassesPage />} />
        
        {/* Assessment Routes */}
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="assessments/add" element={<AddAssessmentPage />} />
        <Route path="assessments/batch" element={<BatchAssessment />} />
        <Route path="assessments/:id/edit" element={<EditAssessmentPage />} />
        <Route path="assessments/:id/responses" element={<ResponsesPage />} />
        <Route path="assessments/:id/results" element={<AssessmentResults />} />
        <Route path="assessments/:id" element={<AssessmentDetailsPage />} />
        
        {/* Insights Routes */}
        <Route path="insights" element={<InsightsPage />} />
        <Route path="insights/class" element={<ClassInsightsPage />} />
        <Route path="insights/individual" element={<IndividualInsightsPage />} />
        <Route path="insights/student/:id" element={<IndividualInsightsPage />} />
        <Route path="insights/skills" element={<SkillsInsightsPage />} />
        <Route path="insights/recommendations" element={<RecommendationsPage />} />
        
        {/* Other App Routes */}
        <Route path="goals" element={<GoalsPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/progress-reports" element={<ProgressReports />} />
        <Route path="communications" element={<Communications />} />
        <Route path="communications/email" element={<Communications />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="settings/profile" element={<SettingsProfilePage />} />
        <Route path="audit" element={<ProductionAudit />} />
        <Route path="audit/comprehensive" element={<ComprehensiveAudit />} />
        <Route path="verification" element={<SystemVerification />} />
        
        {/* Default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};
