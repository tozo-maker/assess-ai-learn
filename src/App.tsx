
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';

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
import StudentResponses from '@/pages/app/assessments/StudentResponses';
import Goals from '@/pages/app/goals/Goals';
import AddGoal from '@/pages/app/goals/AddGoal';
import GoalDetails from '@/pages/app/goals/GoalDetails';
import ClassInsights from '@/pages/app/insights/ClassInsights';
import SkillsInsights from '@/pages/app/insights/SkillsInsights';
import ComparativeAnalytics from '@/pages/app/insights/ComparativeAnalytics';
import Reports from '@/pages/app/reports/Reports';
import StudentReport from '@/pages/app/reports/StudentReport';
import ClassReport from '@/pages/app/reports/ClassReport';
import CommunicationCenter from '@/pages/app/communication/CommunicationCenter';
import Settings from '@/pages/app/Settings';
import Profile from '@/pages/app/Profile';

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

            {/* Protected App Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
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
              <Route path="assessments/:id/responses" element={<StudentResponses />} />
              
              {/* Goals */}
              <Route path="goals" element={<Goals />} />
              <Route path="goals/add" element={<AddGoal />} />
              <Route path="goals/:id" element={<GoalDetails />} />
              
              {/* Insights */}
              <Route path="insights/class" element={<ClassInsights />} />
              <Route path="insights/skills" element={<SkillsInsights />} />
              <Route path="insights/comparative" element={<ComparativeAnalytics />} />
              
              {/* Reports */}
              <Route path="reports" element={<Reports />} />
              <Route path="reports/student/:id" element={<StudentReport />} />
              <Route path="reports/class" element={<ClassReport />} />
              
              {/* Communication */}
              <Route path="communication" element={<CommunicationCenter />} />
              
              {/* Settings */}
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Redirect legacy routes */}
            <Route path="/students/*" element={<Navigate to="/app/students" replace />} />
            <Route path="/assessments/*" element={<Navigate to="/app/assessments" replace />} />
            <Route path="/goals/*" element={<Navigate to="/app/goals" replace />} />
            <Route path="/insights/*" element={<Navigate to="/app/insights/class" replace />} />
            <Route path="/reports/*" element={<Navigate to="/app/reports" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
