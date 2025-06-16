import React from 'react';
import { Route } from 'react-router-dom';
import StudentsPage from '@/pages/app/students/Students';
import AddStudentPage from '@/pages/app/students/AddStudent';
import StudentDetailsPage from '@/pages/app/students/StudentProfile';
import StudentAssessments from '@/pages/app/students/StudentAssessments';
import ImportStudentsPage from '@/pages/app/students/ImportStudents';
import { ProtectedRoute } from './RouteGuards';

export const StudentRoutes = () => {
  console.log('StudentRoutes component rendering');
  
  return [
    <Route
      key="students"
      path="/app/students"
      element={
        <ProtectedRoute>
          <StudentsPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="students-add"
      path="/app/students/add"
      element={
        <ProtectedRoute>
          <AddStudentPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="students-import"
      path="/app/students/import"
      element={
        <ProtectedRoute>
          <ImportStudentsPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="student-details"
      path="/app/students/:id"
      element={
        <ProtectedRoute>
          <StudentDetailsPage />
        </ProtectedRoute>
      }
    />,
    <Route
      key="student-assessments"
      path="/app/students/:id/assessments"
      element={
        <ProtectedRoute>
          <StudentAssessments />
        </ProtectedRoute>
      }
    />
  ];
};
