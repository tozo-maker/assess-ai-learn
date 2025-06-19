
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/routing/RouteGuards';
import DashboardPage from '@/pages/app/Dashboard';
import LoginPage from '@/pages/auth/Login';
import SignupPage from '@/pages/auth/Signup';
import TestingPage from '@/pages/app/Testing';
import HelpPage from '@/pages/app/help/Help';
import { StudentRoutes } from '@/components/routing/StudentRoutes';
import { AssessmentRoutes } from '@/components/routing/AssessmentRoutes';
import { GoalRoutes } from '@/components/routing/GoalRoutes';
import { ReportsRoutes } from '@/components/routing/ReportsRoutes';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster />
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Main App Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Navigate to="/app/dashboard" replace />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Feature Routes */}
            {StudentRoutes()}
            {AssessmentRoutes()}
            {GoalRoutes()}
            {ReportsRoutes()}

            {/* Testing Routes */}
            <Route
              path="/app/testing"
              element={
                <ProtectedRoute>
                  <TestingPage />
                </ProtectedRoute>
              }
            />

            {/* Help Routes */}
            <Route
              path="/app/help"
              element={
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
