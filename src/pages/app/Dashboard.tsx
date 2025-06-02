
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import EnhancedLoadingState from '@/components/common/EnhancedLoadingState';
import ErrorState from '@/components/common/ErrorState';
import { useDashboardData } from '@/hooks/useDashboardData';

// Import design system components
import { 
  DSSection,
  DSPageContainer,
  DSContentGrid,
  DSGridItem,
  DSSpacer,
  DSCard,
  DSCardContent,
  DSSectionHeader,
  DSBodyText,
  DSButton
} from '@/components/ui/design-system';

// Import dashboard components - using redesigned versions
import DashboardWelcomeSection from '@/components/dashboard/DashboardWelcomeSection';
import DashboardStatsRedesigned from '@/components/dashboard/DashboardStatsRedesigned';
import DashboardActivityFeed from '@/components/dashboard/DashboardActivityFeed';
import DashboardRecentInsights from '@/components/dashboard/DashboardRecentInsights';
import DashboardAlerts from '@/components/dashboard/DashboardAlerts';
import DashboardSecondaryWidgets from '@/components/dashboard/DashboardSecondaryWidgets';

const Dashboard = () => {
  const {
    teacher,
    metrics,
    alerts,
    students,
    assessments,
    communications,
    isLoading,
    hasError,
    error,
    handleRetry
  } = useDashboardData();

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

  if (hasError) {
    return (
      <AppLayout>
        <DSPageContainer>
          <Breadcrumbs />
          <ErrorState
            error={error}
            onRetry={handleRetry}
            title="Failed to load dashboard"
            description="There was an error loading your dashboard data. Please try again."
          />
        </DSPageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ErrorBoundary>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            
            {/* Welcome Section - Full Width */}
            <ErrorBoundary fallback={<ErrorState title="Welcome section unavailable" />}>
              <DashboardWelcomeSection teacher={teacher} />
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

            {/* Primary Metrics - Standardized Stats Cards */}
            <ErrorBoundary fallback={<ErrorState title="Metrics unavailable" />}>
              <DashboardStatsRedesigned 
                totalStudents={metrics.totalStudents}
                totalAssessments={metrics.totalAssessments}
                aiInsights={metrics.aiInsights}
                recentAssessments={metrics.recentAssessments}
                newStudentsThisMonth={metrics.newStudentsThisMonth}
                todaysInsights={metrics.todaysInsights}
                studentMetrics={metrics.studentMetrics}
              />
            </ErrorBoundary>

            <DSSpacer size="2xl" />

            {/* Recent Activity - 2-Column: List + Insights */}
            <DSContentGrid cols={2}>
              <DSGridItem span={1}>
                <ErrorBoundary fallback={<ErrorState title="Activity feed unavailable" />}>
                  <DashboardActivityFeed 
                    recentAssessments={metrics.recentAssessments}
                    totalStudents={metrics.totalStudents}
                    studentsNeedingAttention={metrics.studentsNeedingAttention}
                  />
                </ErrorBoundary>
              </DSGridItem>
              <DSGridItem span={1}>
                <ErrorBoundary fallback={<ErrorState title="Recent insights unavailable" />}>
                  <DashboardRecentInsights 
                    students={students}
                    communications={communications}
                  />
                </ErrorBoundary>
              </DSGridItem>
            </DSContentGrid>

            <DSSpacer size="2xl" />

            {/* Secondary Widgets - 3-Column Grid */}
            <ErrorBoundary fallback={<ErrorState title="Additional widgets unavailable" />}>
              <DashboardSecondaryWidgets 
                assessments={assessments}
                students={students}
                metrics={metrics}
              />
            </ErrorBoundary>

            <DSSpacer size="3xl" />

            {/* Customize Dashboard Option */}
            <DSCard className="text-center">
              <DSCardContent className="py-8">
                <DSSectionHeader className="mb-4">Customize Your Dashboard</DSSectionHeader>
                <DSBodyText className="mb-6 max-w-2xl mx-auto text-gray-600">
                  Add more widgets, rearrange sections, or adjust what information is displayed to match your teaching workflow.
                </DSBodyText>
                <DSButton variant="secondary" size="md">
                  Customize Dashboard
                </DSButton>
              </DSCardContent>
            </DSCard>
          </DSPageContainer>
        </DSSection>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default Dashboard;
