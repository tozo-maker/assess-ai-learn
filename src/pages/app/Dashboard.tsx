
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import DashboardErrorBoundary from '@/components/dashboard/DashboardErrorBoundary';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
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
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';

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
  const { data, isInitialLoading, error, refetch, isEmpty } = useOptimizedDashboard();

  // Show loading state for initial load
  if (isInitialLoading) {
    return (
      <AppLayout>
        <DSPageContainer>
          <Breadcrumbs />
          <DashboardLoadingState />
        </DSPageContainer>
      </AppLayout>
    );
  }

  // Show error state with recovery options
  if (error || !data) {
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

  // Show empty state if no students
  if (isEmpty) {
    return (
      <AppLayout>
        <DSPageContainer>
          <Breadcrumbs />
          <DashboardWelcomeSection teacher={data.teacher} />
          <DSSpacer size="2xl" />
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to LearnSpark AI
            </h3>
            <p className="text-gray-600 mb-6">
              Start by adding students to your class to see their progress and insights.
            </p>
            <a 
              href="/app/students/add" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Your First Student
            </a>
          </div>
        </DSPageContainer>
      </AppLayout>
    );
  }

  const { students, assessments, metrics, teacher } = data;

  // Generate alerts from metrics
  const alerts = [];
  if (metrics.studentsNeedingAttention > 0) {
    alerts.push({
      id: 'performance-alert',
      type: 'performance' as const,
      title: 'Students Need Attention',
      description: `${metrics.studentsNeedingAttention} students showing declining performance`,
      severity: metrics.studentsNeedingAttention > metrics.totalStudents * 0.3 ? 'high' as const : 'medium' as const,
      actionUrl: '/app/students?filter=needs-attention',
      studentCount: metrics.studentsNeedingAttention
    });
  }

  return (
    <AppLayout>
      <DashboardErrorBoundary>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            
            {/* Welcome Section */}
            <DashboardWelcomeSection teacher={teacher} />
            <DSSpacer size="2xl" />

            {/* Critical Alerts */}
            {alerts.length > 0 && (
              <>
                <DashboardAlerts alerts={alerts} />
                <DSSpacer size="2xl" />
              </>
            )}

            {/* Primary Metrics */}
            <LazyContainer>
              <LazyWrapper>
                <LazyDashboardStats 
                  totalStudents={metrics.totalStudents}
                  totalAssessments={metrics.totalAssessments}
                  aiInsights={Math.floor(metrics.totalAssessments * 0.3)}
                  recentAssessments={metrics.recentAssessments}
                  newStudentsThisMonth={0}
                  todaysInsights={Math.floor(metrics.totalAssessments * 0.1)}
                  studentMetrics={{
                    totalStudents: metrics.totalStudents,
                    studentsNeedingAttention: metrics.studentsNeedingAttention,
                    aboveAverageCount: students.filter(s => 
                      s.student_performance?.[0]?.average_score > metrics.averagePerformance
                    ).length,
                    averagePerformance: metrics.averagePerformance > 0 
                      ? `${Math.round(metrics.averagePerformance)}%` 
                      : 'No data'
                  }}
                />
              </LazyWrapper>
            </LazyContainer>

            <DSSpacer size="2xl" />

            {/* Main Content Grid */}
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

            {/* Secondary Widgets */}
            <LazyContainer>
              <LazyWrapper>
                <LazySecondaryWidgets 
                  assessments={assessments}
                  students={students}
                  metrics={{
                    averagePerformance: metrics.averagePerformance > 0 
                      ? `${Math.round(metrics.averagePerformance)}%` 
                      : 'No data',
                    studentsNeedingAttention: metrics.studentsNeedingAttention
                  }}
                />
              </LazyWrapper>
            </LazyContainer>

            <DSSpacer size="3xl" />
          </DSPageContainer>
        </DSSection>
      </DashboardErrorBoundary>
    </AppLayout>
  );
};

export default Dashboard;
