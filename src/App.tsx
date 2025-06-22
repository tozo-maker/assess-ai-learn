import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/app/Dashboard';
import Students from '@/pages/app/Students';
import StudentDetail from '@/pages/app/StudentDetail';
import Assessments from '@/pages/app/Assessments';
import AssessmentWizard from '@/pages/app/AssessmentWizard';
import AssessmentDetail from '@/pages/app/AssessmentDetail';
import Insights from '@/pages/app/Insights';
import Goals from '@/pages/app/Goals';
import Communications from '@/pages/app/communications/Communications';
import ProgressReports from '@/pages/app/communications/ProgressReports';
import Reports from '@/pages/app/Reports';
import Settings from '@/pages/app/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="assessments/new" element={<AssessmentWizard />} />
            <Route path="assessments/:id" element={<AssessmentDetail />} />
            <Route path="insights" element={<Insights />} />
            <Route path="goals" element={<Goals />} />
            <Route path="communications" element={<Communications />} />
            <Route path="communications/progress-reports" element={<ProgressReports />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
