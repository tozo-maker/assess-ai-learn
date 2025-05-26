
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Public Pages
import Index from '@/pages/Index';
import About from '@/pages/About';
import Pricing from '@/pages/Pricing';
import Demo from '@/pages/Demo';
import Contact from '@/pages/Contact';

// Auth Pages
import Signup from '@/pages/auth/Signup';
import Login from '@/pages/auth/Login';
import Onboarding from '@/pages/auth/Onboarding';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Main Application Pages
import Dashboard from '@/pages/app/Dashboard';
import Students from '@/pages/app/students/Students';
import AddStudent from '@/pages/app/students/AddStudent';
import ImportStudents from '@/pages/app/students/ImportStudents';
import StudentProfile from '@/pages/app/students/StudentProfile';
import StudentAssessments from '@/pages/app/students/StudentAssessments';
import StudentInsights from '@/pages/app/students/StudentInsights';
import StudentGoals from '@/pages/app/students/StudentGoals';

import Assessments from '@/pages/app/assessments/Assessments';
import AddAssessment from '@/pages/app/assessments/AddAssessment';
import BatchAssessment from '@/pages/app/assessments/BatchAssessment';
import AssessmentDetails from '@/pages/app/assessments/AssessmentDetails';
import AssessmentAnalysis from '@/pages/app/assessments/AssessmentAnalysis';
import AddStudentResponses from '@/pages/app/assessments/AddStudentResponses';

import ClassInsights from '@/pages/app/insights/ClassInsights';
import IndividualInsights from '@/pages/app/insights/IndividualInsights';
import SkillsInsights from '@/pages/app/insights/SkillsInsights';
import Recommendations from '@/pages/app/insights/Recommendations';

import ProgressReports from '@/pages/app/reports/ProgressReports';
import ParentReports from '@/pages/app/reports/ParentReports';
import AdminReports from '@/pages/app/reports/AdminReports';
import ExportReports from '@/pages/app/reports/ExportReports';

import ProfileSettings from '@/pages/app/settings/ProfileSettings';
import SubjectsSettings from '@/pages/app/settings/SubjectsSettings';
import NotificationsSettings from '@/pages/app/settings/NotificationsSettings';
import IntegrationsSettings from '@/pages/app/settings/IntegrationsSettings';

// Testing Page
import Testing from '@/pages/Testing';

import NotFound from '@/pages/NotFound';

// Legacy redirects
import {
  StudentRedirect,
  StudentAssessmentsRedirect,
  StudentInsightsRedirect,
  StudentGoalsRedirect,
  AssessmentRedirect,
  AssessmentAnalysisRedirect,
  AssessmentResponsesRedirect,
} from './LegacyRedirects';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/contact" element={<Contact />} />

      {/* Testing Page - Protected Route */}
      <Route 
        path="/testing" 
        element={
          <ProtectedRoute>
            <Testing />
          </ProtectedRoute>
        } 
      />

      {/* Auth Pages */}
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route 
        path="/auth/onboarding" 
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } 
      />

      {/* Main Application - Protected Routes */}
      <Route 
        path="/app/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Students - Protected Routes */}
      <Route 
        path="/app/students" 
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/students/add" 
        element={
          <ProtectedRoute>
            <AddStudent />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/students/import" 
        element={
          <ProtectedRoute>
            <ImportStudents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/students/:id" 
        element={
          <ProtectedRoute>
            <StudentProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/students/:id/assessments" 
        element={
          <ProtectedRoute>
            <StudentAssessments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/students/:id/insights" 
        element={
          <ProtectedRoute>
            <StudentInsights />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/students/:id/goals" 
        element={
          <ProtectedRoute>
            <StudentGoals />
          </ProtectedRoute>
        } 
      />

      {/* Assessments - Protected Routes */}
      <Route 
        path="/app/assessments" 
        element={
          <ProtectedRoute>
            <Assessments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/assessments/add" 
        element={
          <ProtectedRoute>
            <AddAssessment />
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
      <Route 
        path="/app/assessments/:id" 
        element={
          <ProtectedRoute>
            <AssessmentDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/assessments/:id/analysis" 
        element={
          <ProtectedRoute>
            <AssessmentAnalysis />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/assessments/:id/responses" 
        element={
          <ProtectedRoute>
            <AddStudentResponses />
          </ProtectedRoute>
        } 
      />

      {/* Insights - Protected Routes */}
      <Route 
        path="/app/insights/class" 
        element={
          <ProtectedRoute>
            <ClassInsights />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/insights/individual" 
        element={
          <ProtectedRoute>
            <IndividualInsights />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/insights/skills" 
        element={
          <ProtectedRoute>
            <SkillsInsights />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/insights/recommendations" 
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        } 
      />

      {/* Reports - Protected Routes */}
      <Route 
        path="/app/reports/progress" 
        element={
          <ProtectedRoute>
            <ProgressReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/reports/parent" 
        element={
          <ProtectedRoute>
            <ParentReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/reports/admin" 
        element={
          <ProtectedRoute>
            <AdminReports />
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

      {/* Settings - Protected Routes */}
      <Route 
        path="/app/settings/profile" 
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/settings/subjects" 
        element={
          <ProtectedRoute>
            <SubjectsSettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/settings/notifications" 
        element={
          <ProtectedRoute>
            <NotificationsSettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/settings/integrations" 
        element={
          <ProtectedRoute>
            <IntegrationsSettings />
          </ProtectedRoute>
        } 
      />

      {/* Legacy routes - redirect to /app prefix */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/students" element={<Navigate to="/app/students" replace />} />
      <Route path="/students/add" element={<Navigate to="/app/students/add" replace />} />
      <Route path="/students/import" element={<Navigate to="/app/students/import" replace />} />
      <Route path="/students/:id" element={<StudentRedirect />} />
      <Route path="/students/:id/assessments" element={<StudentAssessmentsRedirect />} />
      <Route path="/students/:id/insights" element={<StudentInsightsRedirect />} />
      <Route path="/students/:id/goals" element={<StudentGoalsRedirect />} />
      <Route path="/assessments" element={<Navigate to="/app/assessments" replace />} />
      <Route path="/assessments/add" element={<Navigate to="/app/assessments/add" replace />} />
      <Route path="/assessments/batch" element={<Navigate to="/app/assessments/batch" replace />} />
      <Route path="/assessments/:id" element={<AssessmentRedirect />} />
      <Route path="/assessments/:id/analysis" element={<AssessmentAnalysisRedirect />} />
      <Route path="/assessments/:id/responses" element={<AssessmentResponsesRedirect />} />
      
      {/* Insights legacy routes */}
      <Route path="/insights/class" element={<Navigate to="/app/insights/class" replace />} />
      <Route path="/insights/individual" element={<Navigate to="/app/insights/individual" replace />} />
      <Route path="/insights/skills" element={<Navigate to="/app/insights/skills" replace />} />
      <Route path="/insights/recommendations" element={<Navigate to="/app/insights/recommendations" replace />} />
      
      {/* Reports legacy routes */}
      <Route path="/reports/progress" element={<Navigate to="/app/reports/progress" replace />} />
      <Route path="/reports/parent" element={<Navigate to="/app/reports/parent" replace />} />
      <Route path="/reports/admin" element={<Navigate to="/app/reports/admin" replace />} />
      <Route path="/reports/export" element={<Navigate to="/app/reports/export" replace />} />
      
      {/* Settings legacy routes */}
      <Route path="/settings/profile" element={<Navigate to="/app/settings/profile" replace />} />
      <Route path="/settings/subjects" element={<Navigate to="/app/settings/subjects" replace />} />
      <Route path="/settings/notifications" element={<Navigate to="/app/settings/notifications" replace />} />
      <Route path="/settings/integrations" element={<Navigate to="/app/settings/integrations" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
