
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import EnhancedLoadingState from '@/components/common/EnhancedLoadingState';
import ErrorState from '@/components/common/ErrorState';

// Import design system components
import { 
  DSSection,
  DSPageContainer,
  DSContentGrid,
  DSGridItem,
  DSSpacer
} from '@/components/ui/design-system';

// Import optimized hooks
import { 
  useOptimizedStudents,
  useOptimizedAssessments,
  useOptimizedStudentMetrics,
  usePrefetchQueries,
  useBackgroundSync,
  useTeacherProfile
} from '@/hooks/queries/useOptimizedQueries';

// Import lazy components
import {
  LazyWrapper,
  LazyContainer,
  LazyDashboardStats,
  LazyActivityFeed,
  LazyRecentInsights,
  LazySecondaryWidgets
} from '@/components/common/LazyComponents';

// Import regular components
import DashboardWelcomeSection from '@/components/dashboard/DashboardWelcomeSection';
import DashboardAlerts from '@/components/dashboard/DashboardAlerts';
import PerformanceMonitoringWidget from '@/components/monitoring/PerformanceMonitoringWidget';

const Dashboard = () => {
  // Optimized data fetching
  const { data: teacher, isLoading: teacherLoading, error: teacherError } = useTeacherProfile();
  const { data: students, isLoading: studentsLoading } = useOptimizedStudents();
  const { data: assessments, isLoading: assessmentsLoading } = useOptimizedAssessments();
  const { data: metrics, isLoading: metricsLoading } = useOptimizedStudentMetrics();
  
  // Background sync and prefetching
  const { prefetchAll } = usePrefetchQueries();
  const { syncInBackground } = useBackgroundSync();

  // Prefetch data on mount
  React.useEffect(() => {
    const prefetchData = async () => {
      try {
        await prefetchAll();
      } catch (error) {
        console.warn('Prefetch failed:', error);
      }
    };

    prefetchData();
  }, [prefetchAll]);

  // Background sync every 5 minutes
  React.useEffect(() => {
    const interval = setInterval(syncInBackground, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [syncInBackground]);

  // Mock alerts data
  const alerts = React.useMemo(() => {
    if (!students || !metrics) return [];
    
    const alertsList = [];
    if (metrics.studentsNeedingAttention > 0) {
      alertsList.push({
        id: '1',
        type: 'performance' as const,
        title: 'Students Need Attention',
        description: `${metrics.studentsNeedingAttention} students are showing declining performance`,
        severity: 'high' as const,
        actionUrl: '/app/students?filter=needs-attention',
        studentCount: metrics.studentsNeedingAttention
      });
    }
    return alertsList;
  }, [students, metrics]);

  // Loading state
  const isLoading = teacherLoading || studentsLoading || assessmentsLoading || metricsLoading;
  
  if (isLoading) {
    return (
      <AppLayout>
        <DSPageContainer>
          <Breadcrumbs />
          <EnhancedLoadingState type="dashboard" message="Loading your dashboard..." />
        </DSPageContainer>
      </AppLayout>
    );
  }

  // Error state
  if (teacherError || !teacher) {
    return (
      <AppLayout>
        <DSPageContainer>
          <Breadcrumbs />
          <ErrorState
            error={teacherError}
            title="Failed to load dashboard"
            description="There was an error loading your dashboard data. Please try again."
          />
        </DSPageContainer>
      </AppLayout>
    );
  }

  // Transform teacher data
  const teacherData = {
    name: teacher.full_name,
    firstName: teacher.full_name.split(' ')[0]
  };

  // Default values for optional data
  const safeStudents = students || [];
  const safeAssessments = assessments || [];
  const safeMetrics = metrics || {
    totalStudents: 0,
    totalAssessments: 0,
    aiInsights: 0,
    recentAssessments: 0,
    newStudentsThisMonth: 0,
    todaysInsights: 0,
    studentsNeedingAttention: 0,
    studentMetrics: {
      totalStudents: 0,
      studentsNeedingAttention: 0,
      aboveAverageCount: 0,
      averagePerformance: 'No data'
    }
  };

  return (
    <AppLayout>
      <ErrorBoundary>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            
            {/* Welcome Section - Always visible */}
            <ErrorBoundary fallback={<ErrorState title="Welcome section unavailable" />}>
              <DashboardWelcomeSection teacher={teacherData} />
            </ErrorBoundary>

            <DSSpacer size="2xl" />

            {/* Critical Alerts - If Any */}
            {alerts.length > 0 && (
              <>
                <ErrorBoundary fallback={<ErrorState title="Alerts unavailable" />}>
                  <DashboardAlerts alerts={alerts} />
                </ErrorBoundary>
                <DSSpacer size="2xl" />
              </>
            )}

            {/* Primary Metrics - Lazy loaded with high priority */}
            <LazyContainer>
              <ErrorBoundary fallback={<ErrorState title="Metrics unavailable" />}>
                <LazyWrapper>
                  <LazyDashboardStats 
                    totalStudents={safeMetrics.totalStudents}
                    totalAssessments={safeMetrics.totalAssessments}
                    aiInsights={safeMetrics.aiInsights}
                    recentAssessments={safeMetrics.recentAssessments}
                    newStudentsThisMonth={safeMetrics.newStudentsThisMonth}
                    todaysInsights={safeMetrics.todaysInsights}
                    studentMetrics={safeMetrics.studentMetrics}
                  />
                </LazyWrapper>
              </ErrorBoundary>
            </LazyContainer>

            <DSSpacer size="2xl" />

            {/* Main Content Grid - Lazy loaded */}
            <DSContentGrid cols={3}>
              <DSGridItem span={2}>
                <LazyContainer>
                  <ErrorBoundary fallback={<ErrorState title="Activity feed unavailable" />}>
                    <LazyWrapper>
                      <LazyActivityFeed 
                        recentAssessments={safeMetrics.recentAssessments}
                        totalStudents={safeMetrics.totalStudents}
                        studentsNeedingAttention={safeMetrics.studentsNeedingAttention}
                      />
                    </LazyWrapper>
                  </ErrorBoundary>
                </LazyContainer>
              </DSGridItem>
              
              <DSGridItem span={1}>
                <div className="space-y-6">
                  <LazyContainer>
                    <ErrorBoundary fallback={<ErrorState title="Recent insights unavailable" />}>
                      <LazyWrapper>
                        <LazyRecentInsights 
                          students={safeStudents}
                          communications={[]}
                        />
                      </LazyWrapper>
                    </ErrorBoundary>
                  </LazyContainer>
                  
                  {/* Performance monitoring widget */}
                  <ErrorBoundary fallback={<ErrorState title="Performance monitoring unavailable" />}>
                    <PerformanceMonitoringWidget />
                  </ErrorBoundary>
                </div>
              </DSGridItem>
            </DSContentGrid>

            <DSSpacer size="2xl" />

            {/* Secondary Widgets - Lowest priority lazy loading */}
            <LazyContainer>
              <ErrorBoundary fallback={<ErrorState title="Additional widgets unavailable" />}>
                <LazyWrapper>
                  <LazySecondaryWidgets 
                    assessments={safeAssessments}
                    students={safeStudents}
                    metrics={safeMetrics}
                  />
                </LazyWrapper>
              </ErrorBoundary>
            </LazyContainer>

            <DSSpacer size="3xl" />
          </DSPageContainer>
        </DSSection>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default Dashboard;
