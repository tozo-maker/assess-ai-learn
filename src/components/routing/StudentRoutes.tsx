
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
  
  return (
    <React.Fragment>
      <Route
        path="/app/students"
        element={
          <ProtectedRoute>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/students/add"
        element={
          <ProtectedRoute>
            <AddStudentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/students/import"
        element={
          <ProtectedRoute>
            <ImportStudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/students/:id"
        element={
          <ProtectedRoute>
            <StudentDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/students/:id/assessments"
        element={
          <ProtectedRoute>
            <StudentAssessments />
          </ProtectedRoute>
        }
      />
    </React.Fragment>
  );
};
