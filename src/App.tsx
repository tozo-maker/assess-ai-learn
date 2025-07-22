import React, { useEffect, Suspense } from 'react';
import { initializePerformanceOptimizations } from '@/services/performance-optimization';
import { setupGlobalErrorHandlers } from '@/utils/error-boundary-helper';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProtectedRoute } from '@/components/routing/RouteGuards';
import AppLayout from '@/components/layout/AppLayout';
import AppErrorBoundary from '@/components/common/AppErrorBoundary';
import RealtimeProvider from '@/components/realtime/RealtimeProvider';

// Authentication pages (direct imports for better reliability)
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import PasswordReset from '@/pages/auth/PasswordReset';
import LandingPage from '@/pages/LandingPage';

// Lazy loaded components
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
  LazyHelp
} from '@/components/common/LazyRoutes';
import PageLoadingState from '@/components/common/PageLoadingState';
import EmailCenter from '@/pages/app/communications/EmailCenter';

// Create optimized query client instance for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const App: React.FC = () => {
  useEffect(() => {
    // Initialize performance optimizations
    initializePerformanceOptimizations();
    
    // Setup global error handlers
    setupGlobalErrorHandlers();
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<PasswordReset />} />
              
              {/* Protected app routes */}
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <TooltipProvider>
                      <div className="min-h-screen flex w-full">
                        <RealtimeProvider>
                          <AppLayout>
                            <Routes>
                              {/* Dashboard - simplified loading */}
                              <Route path="dashboard" element={
                                <Suspense fallback={<PageLoadingState message="Loading dashboard..." />}>
                                  <LazyDashboard />
                                </Suspense>
                              } />
                              
                              {/* Students */}
                              <Route path="students" element={
                                <Suspense fallback={<PageLoadingState message="Loading students..." />}>
                                  <LazyStudents />
                                </Suspense>
                              } />
                              <Route path="students/add" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyAddStudent />
                                </Suspense>
                              } />
                              <Route path="students/import" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyImportStudents />
                                </Suspense>
                              } />
                              <Route path="students/:id" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyStudentProfile />
                                </Suspense>
                              } />
                              <Route path="students/:id/assessments" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyStudentAssessments />
                                </Suspense>
                              } />
                              
                              {/* Classes */}
                              <Route path="classes" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyClasses />
                                </Suspense>
                              } />
                              
                              {/* Assessments */}
                              <Route path="assessments" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyAssessments />
                                </Suspense>
                              } />
                              <Route path="assessments/add" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyAddAssessment />
                                </Suspense>
                              } />
                              <Route path="assessments/:id/edit" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyEditAssessment />
                                </Suspense>
                              } />
                              <Route path="assessments/:id" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyAssessmentDetails />
                                </Suspense>
                              } />
                              <Route path="assessments/:id/responses" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyAddStudentResponses />
                                </Suspense>
                              } />
                              <Route path="assessments/:id/batch" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyBatchAssessment />
                                </Suspense>
                              } />
                              <Route path="assessments/:id/results" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyAssessmentResults />
                                </Suspense>
                              } />
                              <Route path="assessments/:id/analysis" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyAssessmentAnalysis />
                                </Suspense>
                              } />
                              
                              {/* Goals & Skills */}
                              <Route path="goals" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyGoals />
                                </Suspense>
                              } />
                              <Route path="skills" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazySkills />
                                </Suspense>
                              } />
                              
                              {/* Insights & Analytics */}
                              <Route path="insights/class" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyClassInsights />
                                </Suspense>
                              } />
                              <Route path="insights/individual" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyIndividualInsights />
                                </Suspense>
                              } />
                              <Route path="insights/skills" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazySkillsInsights />
                                </Suspense>
                              } />
                              <Route path="insights/recommendations" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyRecommendations />
                                </Suspense>
                              } />
                              
                              {/* Communications */}
                              <Route path="communications" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyCommunications />
                                </Suspense>
                              } />
                              <Route path="communications/email" element={<EmailCenter />} />
                              
                              {/* Reports */}
                              <Route path="reports" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyReports />
                                </Suspense>
                              } />
                              <Route path="reports/progress" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyProgressReports />
                                </Suspense>
                              } />
                              
                              {/* Testing & Help */}
                              <Route path="testing" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyTesting />
                                </Suspense>
                              } />
                              <Route path="help" element={
                                <Suspense fallback={<PageLoadingState message="Loading..." />}>
                                  <LazyHelp />
                                </Suspense>
                              } />
                              
                              {/* Default redirect */}
                              <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                            </Routes>
                          </AppLayout>
                        </RealtimeProvider>
                      </div>
                    </TooltipProvider>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        
        <Toaster />
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
