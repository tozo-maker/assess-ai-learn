
import React from 'react';
import { Routes } from 'react-router-dom';
import { PublicRoutes } from './PublicRoutes';
import { StudentRoutes } from './StudentRoutes';
import { AssessmentRoutes } from './AssessmentRoutes';
import { GoalRoutes } from './GoalRoutes';
import { SkillRoutes } from './SkillRoutes';
import { ReportsRoutes } from './ReportsRoutes';
import { HelpRoutes } from './HelpRoutes';
import { SettingsRoutes } from './SettingsRoutes';
import { AuditRoutes } from './AuditRoutes';

export const AppRoutes = () => {
  return (
    <Routes>
      <PublicRoutes />
      <StudentRoutes />
      <AssessmentRoutes />
      <GoalRoutes />
      <SkillRoutes />
      <ReportsRoutes />
      <HelpRoutes />
      <SettingsRoutes />
      <AuditRoutes />
    </Routes>
  );
};
