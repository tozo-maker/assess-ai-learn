
import React, { useEffect, Suspense } from 'react';
import { initializePerformanceOptimizations } from '@/services/performance-optimization';
import { setupGlobalErrorHandlers } from '@/utils/error-boundary-helper';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { ProtectedRoute, PublicRoute } from '@/components/routing/RouteGuards';
import { AppErrorBoundary } from '@/components/common/AppErrorBoundary';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/AppSidebar';

// Auth pages
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Lazy-loaded app pages for better performance
import {
  LazyDashboard,
  LazyStudents,
  LazyAddStudent,
  LazyImportStudents,
  LazyStudentProfile,
  LazyStudentAssessments,
  LazyClasses,
  LazyAssessments,
  LazyAddAssessment,
  LazyEditAssessment,
  LazyAssessmentDetails,
  LazyAddStudentResponses,
  LazyBatchAssessment,
  LazyAssessmentResults,
  LazyAssessmentAnalysis,
  LazyGoals,
  LazySkills,
  LazyClassInsights,
  LazyIndividualInsights,
  LazySkillsInsights,
  LazyRecommendations,
  LazyCommunications,
  LazyReports,
  LazyProgressReports,
  LazyTesting,
  LazyHelp,
  withLazyLoading
} from '@/components/common/LazyRoutes';
import PageLoadingState from '@/components/common/PageLoadingState';
import EmailCenter from '@/pages/app/communications/EmailCenter';

// Create optimized query client instance for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
      refetchOnWindowFocus: false, // Disable automatic refetch on focus
      refetchOnMount: false, // Don't refetch if data is fresh
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors or 400 errors
        if (error?.status === 401 || error?.status === 403 || error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 1, // Retry mutations once
    },
  },
});

function App() {
  // Initialize performance optimizations on app start
  useEffect(() => {
    initializePerformanceOptimizations();
    setupGlobalErrorHandlers();
  }, []);

  return (
    <AppErrorBoundary componentName="App">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
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
                    <div className="min-h-svh bg-background w-full flex">
                      <AppSidebar />
                      <SidebarInset className="flex-1 flex flex-col">
                        <RealtimeProvider>
                          <AppLayout>
                        <Routes>
                          {/* Dashboard */}
                          <Route path="dashboard" element={
                            <Suspense fallback={<PageLoadingState message="Loading dashboard..." />}>
                              <LazyDashboard />
                            </Suspense>
                          } />
                          
                          {/* Students */}
                          <Route path="students" element={withLazyLoading(LazyStudents)({})} />
                          <Route path="students/add" element={withLazyLoading(LazyAddStudent)({})} />
                          <Route path="students/import" element={withLazyLoading(LazyImportStudents)({})} />
                          <Route path="students/:id" element={withLazyLoading(LazyStudentProfile)({})} />
                          <Route path="students/:id/assessments" element={withLazyLoading(LazyStudentAssessments)({})} />
                          
                          {/* Classes */}
                          <Route path="classes" element={withLazyLoading(LazyClasses)({})} />
                          
                          {/* Assessments */}
                          <Route path="assessments" element={withLazyLoading(LazyAssessments)({})} />
                          <Route path="assessments/add" element={withLazyLoading(LazyAddAssessment)({})} />
                          <Route path="assessments/batch" element={withLazyLoading(LazyBatchAssessment)({})} />
                          <Route path="assessments/:id" element={withLazyLoading(LazyAssessmentDetails)({})} />
                          <Route path="assessments/:id/edit" element={withLazyLoading(LazyEditAssessment)({})} />
                          <Route path="assessments/:id/responses" element={withLazyLoading(LazyAddStudentResponses)({})} />
                          <Route path="assessments/:id/results" element={withLazyLoading(LazyAssessmentResults)({})} />
                          <Route path="assessments/:id/analysis" element={withLazyLoading(LazyAssessmentAnalysis)({})} />
                          
                          {/* Goals & Skills */}
                          <Route path="goals" element={withLazyLoading(LazyGoals)({})} />
                          <Route path="skills" element={withLazyLoading(LazySkills)({})} />
                          
                          {/* Insights */}
                          <Route path="insights/class" element={withLazyLoading(LazyClassInsights)({})} />
                          <Route path="insights/individual" element={withLazyLoading(LazyIndividualInsights)({})} />
                          <Route path="insights/student/:id" element={withLazyLoading(LazyIndividualInsights)({})} />
                          <Route path="insights/skills" element={withLazyLoading(LazySkillsInsights)({})} />
                          <Route path="insights/recommendations" element={withLazyLoading(LazyRecommendations)({})} />
                          
                          {/* Communications & Reports */}
                          <Route path="communications" element={withLazyLoading(LazyCommunications)({})} />
                          <Route path="reports" element={withLazyLoading(LazyReports)({})} />
                          <Route path="reports/progress-reports" element={withLazyLoading(LazyProgressReports)({})} />
                          
                          {/* System */}
                          <Route path="testing" element={withLazyLoading(LazyTesting)({})} />
                          <Route path="communications/email" element={<EmailCenter />} />
                          <Route path="help" element={withLazyLoading(LazyHelp)({})} />
                          
                          {/* Default redirect */}
                          <Route path="" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                          </AppLayout>
                        </RealtimeProvider>
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              {/* Root redirect */}
              <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
