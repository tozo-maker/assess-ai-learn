import React, { lazy, Suspense } from 'react';
import EnhancedLoadingState from '@/components/common/EnhancedLoadingState';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Lazy load heavy dashboard components
export const LazyDashboard = lazy(() => import('@/pages/app/Dashboard'));
export const LazyAnalyticsDashboard = lazy(() => import('@/components/dashboard/AnalyticsDashboard'));
export const LazyRealTimeMonitoringDashboard = lazy(() => import('@/components/monitoring/RealTimeMonitoringDashboard'));

// Lazy load student management components
export const LazyStudents = lazy(() => import('@/pages/app/students/Students'));
export const LazyStudentGoals = lazy(() => import('@/pages/app/students/StudentGoals'));
export const LazyOptimizedStudentList = lazy(() => import('@/components/students/OptimizedStudentList'));

// Lazy load assessment components
export const LazyAssessments = lazy(() => import('@/pages/app/assessments/Assessments'));

// Lazy load insights and analytics
export const LazyClassInsights = lazy(() => import('@/pages/app/insights/ClassInsights'));

// Lazy load settings and configuration
export const LazyProfileSettings = lazy(() => import('@/pages/app/settings/ProfileSettings'));

// Lazy load skills management
export const LazySkillLibrary = lazy(() => import('@/components/skills/SkillLibrary'));
export const LazySkillCategoryManager = lazy(() => import('@/components/skills/SkillCategoryManager'));

// Simple wrapper component for lazy loading with error boundary and loading state
interface LazyWrapperProps {
  children: React.ReactNode;
  loadingType?: 'dashboard' | 'table' | 'form' | 'cards' | 'spinner';
  loadingMessage?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  loadingType = 'spinner', 
  loadingMessage = 'Loading...' 
}) => {
  return (
    <ErrorBoundary level="section">
      <Suspense 
        fallback={
          <EnhancedLoadingState 
            type={loadingType} 
            message={loadingMessage}
            className="min-h-96"
          />
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Pre-configured lazy components with appropriate loading states
export const LazyDashboardWithLoading: React.FC = () => (
  <LazyWrapper loadingType="dashboard" loadingMessage="Loading dashboard...">
    <LazyDashboard />
  </LazyWrapper>
);

export const LazyStudentsWithLoading: React.FC = () => (
  <LazyWrapper loadingType="table" loadingMessage="Loading students...">
    <LazyStudents />
  </LazyWrapper>
);

export const LazyAssessmentsWithLoading: React.FC = () => (
  <LazyWrapper loadingType="table" loadingMessage="Loading assessments...">
    <LazyAssessments />
  </LazyWrapper>
);

export const LazyInsightsWithLoading: React.FC = () => (
  <LazyWrapper loadingType="cards" loadingMessage="Loading insights...">
    <LazyClassInsights />
  </LazyWrapper>
);

// Preload functions for critical components
export const preloadCriticalComponents = () => {
  // Preload dashboard components that are likely to be accessed first
  import('@/pages/app/Dashboard');
  import('@/pages/app/students/Students');
  import('@/components/dashboard/AnalyticsDashboard');
};

// Preload components based on user navigation patterns
export const preloadByRoute = (currentRoute: string) => {
  switch (currentRoute) {
    case '/app/dashboard':
      // Preload likely next destinations from dashboard
      import('@/pages/app/students/Students');
      import('@/pages/app/insights/ClassInsights');
      break;
    case '/app/students':
      // Preload student-related components
      import('@/pages/app/students/StudentGoals');
      import('@/components/students/OptimizedStudentList');
      break;
    case '/app/assessments':
      // Preload assessment-related components
      import('@/pages/app/assessments/Assessments');
      break;
    case '/app/insights':
      // Preload analytics components
      import('@/pages/app/insights/ClassInsights');
      break;
    default:
      break;
  }
};

// Component for managing preloading
export const PreloadManager: React.FC<{ currentRoute: string }> = ({ currentRoute }) => {
  React.useEffect(() => {
    // Preload components based on current route
    const timer = setTimeout(() => {
      preloadByRoute(currentRoute);
    }, 1000); // Delay to avoid interfering with current page load

    return () => clearTimeout(timer);
  }, [currentRoute]);

  return null;
}; 