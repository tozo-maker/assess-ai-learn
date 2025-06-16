
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

// Import optimized hook
import { useOptimizedDashboardData } from '@/hooks/useOptimizedDashboardData';

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
import DashboardPerformanceWidget from '@/components/dashboard/DashboardPerformanceWidget';

const Dashboard = () => {
  // Single optimized data fetch with request deduplication
  const { data: dashboardData, isLoading, error, refetch } = useOptimizedDashboardData();

  // Loading state
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

  // Error state with better error handling
  if (error || !dashboardData) {
    return (
      <AppLayout>
        <DSPageContainer>
          <Breadcrumbs />
          <ErrorState
            error={error}
            title="Failed to load dashboard"
            description="There was an error loading your dashboard data. Please try again."
            onRetry={refetch}
          />
        </DSPageContainer>
      </AppLayout>
    );
  }

  const { students, assessments, metrics, alerts, teacher } = dashboardData;

  return (
    <AppLayout>
      <ErrorBoundary>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            
            {/* Welcome Section - Always visible */}
            <DashboardWelcomeSection teacher={teacher} />
            <DSSpacer size="2xl" />

            {/* Critical Alerts - If Any */}
            {alerts.length > 0 && (
              <>
                <DashboardAlerts alerts={alerts} />
                <DSSpacer size="2xl" />
              </>
            )}

            {/* Primary Metrics - Lazy loaded with high priority */}
            <LazyContainer>
              <LazyWrapper>
                <LazyDashboardStats 
                  totalStudents={metrics.totalStudents}
                  totalAssessments={metrics.totalAssessments}
                  aiInsights={metrics.aiInsights}
                  recentAssessments={metrics.recentAssessments}
                  newStudentsThisMonth={metrics.newStudentsThisMonth}
                  todaysInsights={metrics.todaysInsights}
                  studentMetrics={{
                    totalStudents: metrics.totalStudents,
                    studentsNeedingAttention: metrics.studentsNeedingAttention,
                    aboveAverageCount: metrics.aboveAverageCount,
                    averagePerformance: metrics.averagePerformance
                  }}
                />
              </LazyWrapper>
            </LazyContainer>

            <DSSpacer size="2xl" />

            {/* Main Content Grid - Lazy loaded */}
            <DSContentGrid cols={3}>
              <DSGridItem span={2}>
                <LazyContainer>
                  <LazyWrapper>
                    <LazyActivityFeed 
                      recentAssessments={metrics.recentAssessments}
                      totalStudents={metrics.totalStudents}
                      studentsNeedingAttention={metrics.studentsNeedingAttention}
                    />
                  </LazyWrapper>
                </LazyContainer>
              </DSGridItem>
              
              <DSGridItem span={1}>
                <div className="space-y-6">
                  <LazyContainer>
                    <LazyWrapper>
                      <LazyRecentInsights 
                        students={students}
                        communications={[]}
                      />
                    </LazyWrapper>
                  </LazyContainer>
                  
                  {/* Performance monitoring widget */}
                  <DashboardPerformanceWidget />
                </div>
              </DSGridItem>
            </DSContentGrid>

            <DSSpacer size="2xl" />

            {/* Secondary Widgets - Moved below the main content grid */}
            <LazyContainer>
              <LazyWrapper>
                <LazySecondaryWidgets 
                  assessments={assessments}
                  students={students}
                  metrics={{
                    averagePerformance: metrics.averagePerformance,
                    studentsNeedingAttention: metrics.studentsNeedingAttention
                  }}
                />
              </LazyWrapper>
            </LazyContainer>

            <DSSpacer size="3xl" />
          </DSPageContainer>
        </DSSection>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default Dashboard;
