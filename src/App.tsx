
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Demo from "./pages/Demo";
import Contact from "./pages/Contact";

// Auth Pages
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Onboarding from "./pages/auth/Onboarding";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Main Application Pages
import Dashboard from "./pages/app/Dashboard";
import Students from "./pages/app/students/Students";
import AddStudent from "./pages/app/students/AddStudent";
import ImportStudents from "./pages/app/students/ImportStudents";
import StudentProfile from "./pages/app/students/StudentProfile";
import StudentAssessments from "./pages/app/students/StudentAssessments";
import StudentInsights from "./pages/app/students/StudentInsights";
import StudentGoals from "./pages/app/students/StudentGoals";

import Assessments from "./pages/app/assessments/Assessments";
import AddAssessment from "./pages/app/assessments/AddAssessment";
import BatchAssessment from "./pages/app/assessments/BatchAssessment";
import AssessmentDetails from "./pages/app/assessments/AssessmentDetails";
import AssessmentAnalysis from "./pages/app/assessments/AssessmentAnalysis";

import ClassInsights from "./pages/app/insights/ClassInsights";
import IndividualInsights from "./pages/app/insights/IndividualInsights";
import SkillsInsights from "./pages/app/insights/SkillsInsights";
import Recommendations from "./pages/app/insights/Recommendations";

import ProgressReports from "./pages/app/reports/ProgressReports";
import ParentReports from "./pages/app/reports/ParentReports";
import AdminReports from "./pages/app/reports/AdminReports";
import ExportReports from "./pages/app/reports/ExportReports";

import ProfileSettings from "./pages/app/settings/ProfileSettings";
import SubjectsSettings from "./pages/app/settings/SubjectsSettings";
import NotificationsSettings from "./pages/app/settings/NotificationsSettings";
import IntegrationsSettings from "./pages/app/settings/IntegrationsSettings";

// Testing Page
import Testing from "./pages/Testing";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Students - Protected Routes */}
            <Route 
              path="/students" 
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students/add" 
              element={
                <ProtectedRoute>
                  <AddStudent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students/import" 
              element={
                <ProtectedRoute>
                  <ImportStudents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students/:id" 
              element={
                <ProtectedRoute>
                  <StudentProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students/:id/assessments" 
              element={
                <ProtectedRoute>
                  <StudentAssessments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students/:id/insights" 
              element={
                <ProtectedRoute>
                  <StudentInsights />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students/:id/goals" 
              element={
                <ProtectedRoute>
                  <StudentGoals />
                </ProtectedRoute>
              } 
            />

            {/* Assessments - Protected Routes */}
            <Route 
              path="/assessments" 
              element={
                <ProtectedRoute>
                  <Assessments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assessments/add" 
              element={
                <ProtectedRoute>
                  <AddAssessment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assessments/batch" 
              element={
                <ProtectedRoute>
                  <BatchAssessment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assessments/:id" 
              element={
                <ProtectedRoute>
                  <AssessmentDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/assessments/:id/analysis" 
              element={
                <ProtectedRoute>
                  <AssessmentAnalysis />
                </ProtectedRoute>
              } 
            />

            {/* Insights - Protected Routes */}
            <Route 
              path="/insights/class" 
              element={
                <ProtectedRoute>
                  <ClassInsights />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/insights/individual" 
              element={
                <ProtectedRoute>
                  <IndividualInsights />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/insights/skills" 
              element={
                <ProtectedRoute>
                  <SkillsInsights />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/insights/recommendations" 
              element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              } 
            />

            {/* Reports - Protected Routes */}
            <Route 
              path="/reports/progress" 
              element={
                <ProtectedRoute>
                  <ProgressReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports/parent" 
              element={
                <ProtectedRoute>
                  <ParentReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports/admin" 
              element={
                <ProtectedRoute>
                  <AdminReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports/export" 
              element={
                <ProtectedRoute>
                  <ExportReports />
                </ProtectedRoute>
              } 
            />

            {/* Settings - Protected Routes */}
            <Route 
              path="/settings/profile" 
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/subjects" 
              element={
                <ProtectedRoute>
                  <SubjectsSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/notifications" 
              element={
                <ProtectedRoute>
                  <NotificationsSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/integrations" 
              element={
                <ProtectedRoute>
                  <IntegrationsSettings />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
