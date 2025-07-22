
import React, { Suspense, lazy } from 'react';
import PageLoadingState from '@/components/common/PageLoadingState';

// Simple lazy load components without complex wrappers
export const LazyDashboard = lazy(() => import('@/pages/app/Dashboard'));
export const LazyStudents = lazy(() => import('@/pages/app/students/Students'));
export const LazyAddStudent = lazy(() => import('@/pages/app/students/AddStudent'));
export const LazyImportStudents = lazy(() => import('@/pages/app/students/ImportStudents'));
export const LazyStudentProfile = lazy(() => import('@/pages/app/students/StudentProfile'));
export const LazyStudentAssessments = lazy(() => import('@/pages/app/students/StudentAssessments'));
export const LazyClasses = lazy(() => import('@/pages/app/classes/Classes'));
export const LazyAssessments = lazy(() => import('@/pages/app/assessments/Assessments'));
export const LazyAddAssessment = lazy(() => import('@/pages/app/assessments/AddAssessment'));
export const LazyEditAssessment = lazy(() => import('@/pages/app/assessments/EditAssessment'));
export const LazyAssessmentDetails = lazy(() => import('@/pages/app/assessments/AssessmentDetails'));
export const LazyAddStudentResponses = lazy(() => import('@/pages/app/assessments/AddStudentResponses'));
export const LazyBatchAssessment = lazy(() => import('@/pages/app/assessments/BatchAssessment'));
export const LazyAssessmentResults = lazy(() => import('@/pages/app/assessments/AssessmentResults'));
export const LazyAssessmentAnalysis = lazy(() => import('@/pages/app/assessments/AssessmentAnalysis'));
export const LazyGoals = lazy(() => import('@/pages/app/goals/Goals'));
export const LazySkills = lazy(() => import('@/pages/app/skills/Skills'));
export const LazyClassInsights = lazy(() => import('@/pages/app/insights/ClassInsights'));
export const LazyIndividualInsights = lazy(() => import('@/pages/app/insights/IndividualInsights'));
export const LazySkillsInsights = lazy(() => import('@/pages/app/insights/SkillsInsights'));
export const LazyRecommendations = lazy(() => import('@/pages/app/insights/Recommendations'));
export const LazyCommunications = lazy(() => import('@/pages/app/communications/Communications'));
export const LazyReports = lazy(() => import('@/pages/app/reports/Reports'));
export const LazyProgressReports = lazy(() => import('@/pages/app/reports/ProgressReports'));
export const LazyTesting = lazy(() => import('@/pages/app/Testing'));
export const LazyHelp = lazy(() => import('@/pages/app/help/Help'));

// Simple HOC for consistent loading states
export function withLazyLoading<T extends React.ComponentType<any>>(
  Component: React.LazyExoticComponent<T>,
  fallback?: React.ReactNode
) {
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <PageLoadingState message="Loading..." />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
