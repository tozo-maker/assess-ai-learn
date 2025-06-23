
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/pages/app/Dashboard';
import Students from '@/pages/app/students/Students';
import Goals from '@/pages/app/goals/Goals';
import Communications from '@/pages/app/communications/Communications';
import Assessments from '@/pages/app/assessments/Assessments';
import Login from '@/pages/auth/Login';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';

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
        <RealtimeProvider>
          <div className="min-h-screen bg-gray-50">
            <Toaster />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/app/dashboard" element={<Dashboard />} />
              <Route path="/app/students" element={<Students />} />
              <Route path="/app/goals" element={<Goals />} />
              <Route path="/app/communications" element={<Communications />} />
              <Route path="/app/assessments" element={<Assessments />} />
            </Routes>
          </div>
        </RealtimeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
