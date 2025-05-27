
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';

// Auth Context
import { AuthProvider } from '@/contexts/AuthContext';

// Auth and Layout
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PublicLayout from '@/components/layout/PublicLayout';
import AppLayout from '@/components/layout/AppLayout';

// Public Pages
import Home from '@/pages/Home';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Pricing from '@/pages/Pricing';
import Features from '@/pages/Features';
import Auth from '@/pages/Auth';

// Auth Pages
import Signup from '@/pages/auth/Signup';
import Login from '@/pages/auth/Login';

// App Pages
import Dashboard from '@/pages/app/Dashboard';
import Students from '@/pages/app/students/Students';
import AddStudent from '@/pages/app/students/AddStudent';
import StudentProfile from '@/pages/app/students/StudentProfile';
import StudentInsights from '@/pages/app/students/StudentInsights';
import ImportStudents from '@/pages/app/students/ImportStudents';
import Assessments from '@/pages/app/assessments/Assessments';
import AddAssessment from '@/pages/app/assessments/AddAssessment';
import AssessmentDetails from '@/pages/app/assessments/AssessmentDetails';
import AddStudentResponses from '@/pages/app/assessments/AddStudentResponses';
import ClassInsights from '@/pages/app/insights/ClassInsights';
import SkillsInsights from '@/pages/app/insights/SkillsInsights';
import ComparativeAnalytics from '@/pages/app/insights/ComparativeAnalytics';
import ProgressReports from '@/pages/app/reports/ProgressReports';
import ProfileSettings from '@/pages/app/settings/ProfileSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              } />
              <Route path="/about" element={
                <PublicLayout>
                  <About />
                </PublicLayout>
              } />
              <Route path="/contact" element={
                <PublicLayout>
                  <Contact />
                </PublicLayout>
              } />
              <Route path="/pricing" element={
                <PublicLayout>
                  <Pricing />
                </PublicLayout>
              } />
              <Route path="/features" element={
                <PublicLayout>
                  <Features />
                </PublicLayout>
              } />
              <Route path="/auth" element={
                <PublicLayout showNavigation={false}>
                  <Auth />
                </PublicLayout>
              } />
              
              {/* Auth Routes */}
              <Route path="/auth/signup" element={
                <PublicLayout showNavigation={false}>
                  <Signup />
                </PublicLayout>
              } />
              <Route path="/auth/login" element={
                <PublicLayout showNavigation={false}>
                  <Login />
                </PublicLayout>
              } />

              {/* Protected App Routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route index element={<Dashboard />} />
                      
                      {/* Students */}
                      <Route path="students" element={<Students />} />
                      <Route path="students/add" element={<AddStudent />} />
                      <Route path="students/import" element={<ImportStudents />} />
                      <Route path="students/:id" element={<StudentProfile />} />
                      <Route path="students/:id/insights" element={<StudentInsights />} />
                      
                      {/* Assessments */}
                      <Route path="assessments" element={<Assessments />} />
                      <Route path="assessments/add" element={<AddAssessment />} />
                      <Route path="assessments/:id" element={<AssessmentDetails />} />
                      <Route path="assessments/:id/responses" element={<AddStudentResponses />} />
                      
                      {/* Insights */}
                      <Route path="insights/class" element={<ClassInsights />} />
                      <Route path="insights/skills" element={<SkillsInsights />} />
                      <Route path="insights/comparative" element={<ComparativeAnalytics />} />
                      
                      {/* Reports */}
                      <Route path="reports" element={<ProgressReports />} />
                      
                      {/* Settings */}
                      <Route path="settings" element={<ProfileSettings />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Redirect legacy routes */}
              <Route path="/students/*" element={<Navigate to="/app/students" replace />} />
              <Route path="/assessments/*" element={<Navigate to="/app/assessments" replace />} />
              <Route path="/insights/*" element={<Navigate to="/app/insights/class" replace />} />
              <Route path="/reports/*" element={<Navigate to="/app/reports" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
