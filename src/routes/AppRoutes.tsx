
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/app/Dashboard';
import Students from '@/pages/app/Students';
import AddStudent from '@/pages/app/AddStudent';
import StudentDetail from '@/pages/app/StudentDetail';
import Assessments from '@/pages/app/Assessments';
import AddAssessment from '@/pages/app/AddAssessment';
import Insights from '@/pages/app/Insights';
import Goals from '@/pages/app/Goals';
import Reports from '@/pages/app/Reports';
import Settings from '@/pages/app/Settings';
import Testing from '@/pages/app/Testing';

const AppRoutes = () => {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/add" element={<AddStudent />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/assessments/add" element={<AddAssessment />} />
          <Route path="/insights/*" element={<Insights />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/testing" element={<Testing />} />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  );
};

export default AppRoutes;
