
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { ProtectedRoute, PublicRoute } from '@/components/routing/RouteGuards';

// Auth pages
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// App pages
import Dashboard from '@/pages/app/Dashboard';
import Students from '@/pages/app/students/Students';
import AddStudent from '@/pages/app/students/AddStudent';
import ImportStudents from '@/pages/app/students/ImportStudents';
import StudentProfile from '@/pages/app/students/StudentProfile';
import StudentAssessments from '@/pages/app/students/StudentAssessments';
import Assessments from '@/pages/app/assessments/Assessments';
import AddAssessment from '@/pages/app/assessments/AddAssessment';
import EditAssessment from '@/pages/app/assessments/EditAssessment';
import AssessmentDetails from '@/pages/app/assessments/AssessmentDetails';
import AddStudentResponses from '@/pages/app/assessments/AddStudentResponses';
import BatchAssessment from '@/pages/app/assessments/BatchAssessment';
import Goals from '@/pages/app/goals/Goals';
import Skills from '@/pages/app/skills/Skills';
import ClassInsights from '@/pages/app/insights/ClassInsights';
import IndividualInsights from '@/pages/app/insights/IndividualInsights';
import SkillsInsights from '@/pages/app/insights/SkillsInsights';
import Recommendations from '@/pages/app/insights/Recommendations';
import Communications from '@/pages/app/communications/Communications';
import Reports from '@/pages/app/reports/Reports';
import ProgressReports from '@/pages/app/reports/ProgressReports';
import Testing from '@/pages/app/Testing';
import Help from '@/pages/app/help/Help';

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      gcTime: 300000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 w-full">
            <Toaster />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } />
              <Route path="/reset-password" element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } />
              
              {/* Protected App Routes - All wrapped with AppLayout */}
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <RealtimeProvider>
                      <AppLayout>
                        <Routes>
                          {/* Dashboard */}
                          <Route path="dashboard" element={<Dashboard />} />
                          
                          {/* Students */}
                          <Route path="students" element={<Students />} />
                          <Route path="students/add" element={<AddStudent />} />
                          <Route path="students/import" element={<ImportStudents />} />
                          <Route path="students/:id" element={<StudentProfile />} />
                          <Route path="students/:id/assessments" element={<StudentAssessments />} />
                          
                          {/* Assessments */}
                          <Route path="assessments" element={<Assessments />} />
                          <Route path="assessments/add" element={<AddAssessment />} />
                          <Route path="assessments/batch" element={<BatchAssessment />} />
                          <Route path="assessments/:id" element={<AssessmentDetails />} />
                          <Route path="assessments/:id/edit" element={<EditAssessment />} />
                          <Route path="assessments/:id/responses" element={<AddStudentResponses />} />
                          
                          {/* Goals & Skills */}
                          <Route path="goals" element={<Goals />} />
                          <Route path="skills" element={<Skills />} />
                          
                          {/* Insights */}
                          <Route path="insights/class" element={<ClassInsights />} />
                          <Route path="insights/individual" element={<IndividualInsights />} />
                          <Route path="insights/student/:id" element={<IndividualInsights />} />
                          <Route path="insights/skills" element={<SkillsInsights />} />
                          <Route path="insights/recommendations" element={<Recommendations />} />
                          
                          {/* Communications & Reports */}
                          <Route path="communications" element={<Communications />} />
                          <Route path="reports" element={<Reports />} />
                          <Route path="reports/progress-reports" element={<ProgressReports />} />
                          
                          {/* System */}
                          <Route path="testing" element={<Testing />} />
                          <Route path="help" element={<Help />} />
                          
                          {/* Default redirect */}
                          <Route path="" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                      </AppLayout>
                    </RealtimeProvider>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
