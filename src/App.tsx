
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { FontLoadingWrapper, FontPreloader } from "@/components/ui/font-loading";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { useComponentPerformance } from "@/components/ui/performance-monitor";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentProfile from "./pages/StudentProfile";
import Assessments from "./pages/Assessments";
import AddAssessment from "./pages/AddAssessment";
import Insights from "./pages/Insights";
import ClassInsights from "./pages/ClassInsights";
import IndividualInsights from "./pages/IndividualInsights";
import SkillsInsights from "./pages/SkillsInsights";
import Recommendations from "./pages/Recommendations";
import Reports from "./pages/Reports";
import ProgressReports from "./pages/ProgressReports";
import Communications from "./pages/Communications";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  useComponentPerformance('App');

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <FontLoadingWrapper>
          <PerformanceMonitor>
            <FontPreloader />
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/app/dashboard" element={<Dashboard />} />
                  <Route path="/app/students" element={<Students />} />
                  <Route path="/app/students/add" element={<AddStudent />} />
                  <Route path="/app/students/:id" element={<StudentProfile />} />
                  <Route path="/app/assessments" element={<Assessments />} />
                  <Route path="/app/assessments/add" element={<AddAssessment />} />
                  <Route path="/app/insights" element={<Insights />} />
                  <Route path="/app/insights/class" element={<ClassInsights />} />
                  <Route path="/app/insights/individual" element={<IndividualInsights />} />
                  <Route path="/app/insights/skills" element={<SkillsInsights />} />
                  <Route path="/app/recommendations" element={<Recommendations />} />
                  <Route path="/app/reports" element={<Reports />} />
                  <Route path="/app/reports/progress" element={<ProgressReports />} />
                  <Route path="/app/communications" element={<Communications />} />
                  <Route path="/app/settings" element={<Settings />} />
                  <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </PerformanceMonitor>
        </FontLoadingWrapper>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
};

export default App;
