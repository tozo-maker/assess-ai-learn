import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/pages/app/Dashboard';
import Students from '@/pages/app/students/Students';
import Goals from '@/pages/app/goals/Goals';
import Communications from '@/pages/app/communications/Communications';
import Assessments from '@/pages/app/assessments/Assessments';
import Settings from '@/pages/app/Settings';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import { QueryClient } from '@tanstack/react-query';
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <RealtimeProvider>
          <div className="min-h-screen bg-gray-50">
            <Toaster />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/app/dashboard" element={<Dashboard />} />
              <Route path="/app/students" element={<Students />} />
              <Route path="/app/goals" element={<Goals />} />
              <Route path="/app/communications" element={<Communications />} />
              <Route path="/app/assessments" element={<Assessments />} />
              <Route path="/app/settings" element={<Settings />} />
            </Routes>
          </div>
        </RealtimeProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
