
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/app/Dashboard';
import Students from '@/pages/app/students/Students';
import AddStudent from '@/pages/app/students/AddStudent';
import StudentProfile from '@/pages/app/students/StudentProfile';
import Assessments from '@/pages/app/assessments/Assessments';
import AddAssessment from '@/pages/app/assessments/AddAssessment';
import ClassInsights from '@/pages/app/insights/ClassInsights';
import ProgressReports from '@/pages/app/reports/ProgressReports';
import ProfileSettings from '@/pages/app/settings/ProfileSettings';
import Testing from '@/pages/app/Testing';
import SkillsManagement from '@/pages/app/skills/SkillsManagement';

const AppRoutes = () => {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/add" element={<AddStudent />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/assessments/add" element={<AddAssessment />} />
          <Route path="/insights/*" element={<ClassInsights />} />
          <Route path="/reports" element={<ProgressReports />} />
          <Route path="/settings" element={<ProfileSettings />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/skills" element={<SkillsManagement />} />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  );
};

export default AppRoutes;
