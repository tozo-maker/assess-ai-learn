
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import Dashboard from '@/pages/app/Dashboard';
import Students from '@/pages/app/students/Students';
import Goals from '@/pages/app/goals/Goals';
import Communications from '@/pages/app/communications/Communications';
import Assessments from '@/pages/app/assessments/Assessments';
import Skills from '@/pages/app/skills/Skills';
import Reports from '@/pages/app/reports/Reports';
import ProgressReports from '@/pages/app/reports/ProgressReports';
import Testing from '@/pages/app/Testing';
import Help from '@/pages/app/help/Help';
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';
import { AuthProvider } from '@/contexts/AuthContext';

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
          <SidebarProvider>
            <RealtimeProvider>
              <div className="min-h-screen bg-gray-50 w-full">
                <Toaster />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/app/dashboard" element={<Dashboard />} />
                  <Route path="/app/students" element={<Students />} />
                  <Route path="/app/assessments" element={<Assessments />} />
                  <Route path="/app/goals" element={<Goals />} />
                  <Route path="/app/skills" element={<Skills />} />
                  <Route path="/app/communications" element={<Communications />} />
                  <Route path="/app/reports" element={<Reports />} />
                  <Route path="/app/reports/progress-reports" element={<ProgressReports />} />
                  <Route path="/app/testing" element={<Testing />} />
                  <Route path="/app/help" element={<Help />} />
                </Routes>
              </div>
            </RealtimeProvider>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
