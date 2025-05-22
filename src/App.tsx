
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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

          {/* Auth Pages */}
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/onboarding" element={<Onboarding />} />

          {/* Main Application */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Students */}
          <Route path="/students" element={<Students />} />
          <Route path="/students/add" element={<AddStudent />} />
          <Route path="/students/import" element={<ImportStudents />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/students/:id/assessments" element={<StudentAssessments />} />
          <Route path="/students/:id/insights" element={<StudentInsights />} />
          <Route path="/students/:id/goals" element={<StudentGoals />} />

          {/* Assessments */}
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/assessments/add" element={<AddAssessment />} />
          <Route path="/assessments/batch" element={<BatchAssessment />} />
          <Route path="/assessments/:id" element={<AssessmentDetails />} />
          <Route path="/assessments/:id/analysis" element={<AssessmentAnalysis />} />

          {/* Insights */}
          <Route path="/insights/class" element={<ClassInsights />} />
          <Route path="/insights/individual" element={<IndividualInsights />} />
          <Route path="/insights/skills" element={<SkillsInsights />} />
          <Route path="/insights/recommendations" element={<Recommendations />} />

          {/* Reports */}
          <Route path="/reports/progress" element={<ProgressReports />} />
          <Route path="/reports/parent" element={<ParentReports />} />
          <Route path="/reports/admin" element={<AdminReports />} />
          <Route path="/reports/export" element={<ExportReports />} />

          {/* Settings */}
          <Route path="/settings/profile" element={<ProfileSettings />} />
          <Route path="/settings/subjects" element={<SubjectsSettings />} />
          <Route path="/settings/notifications" element={<NotificationsSettings />} />
          <Route path="/settings/integrations" element={<IntegrationsSettings />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
