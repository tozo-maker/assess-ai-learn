
import React from 'react';
import { Route } from 'react-router-dom';
import SkillsPage from '@/pages/app/skills/Skills';
import { ProtectedRoute } from './RouteGuards';

export const SkillRoutes = () => {
  return (
    <React.Fragment>
      <Route
        path="/app/skills"
        element={
          <ProtectedRoute>
            <SkillsPage />
          </ProtectedRoute>
        }
      />
    </React.Fragment>
  );
};
