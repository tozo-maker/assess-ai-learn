
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

// Import dashboard components
import DashboardWelcomeSection from '@/components/dashboard/DashboardWelcomeSection';
import DashboardMetricCards from '@/components/dashboard/DashboardMetricCards';
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
        <Breadcrumbs />
        <EnhancedLoadingState type="dashboard" message="Loading your dashboard..." />
      </AppLayout>
    );
  }

  if (hasError) {
    return (
      <AppLayout>
        <Breadcrumbs />
        <ErrorState
          error={error}
          onRetry={handleRetry}
          title="Failed to load dashboard"
          description="There was an error loading your dashboard data. Please try again."
        />
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

            <DSSpacer size="lg" />

            {/* Critical Alerts - If Any */}
            {alerts.length > 0 && (
              <>
                <ErrorBoundary fallback={<ErrorState title="Alerts unavailable" />}>
                  <DashboardAlerts alerts={alerts} />
                </ErrorBoundary>
                <DSSpacer size="lg" />
              </>
            )}

            {/* Primary Metrics - 3-Column Grid */}
            <ErrorBoundary fallback={<ErrorState title="Metrics unavailable" />}>
              <DashboardMetricCards metrics={metrics} />
            </ErrorBoundary>

            <DSSpacer size="lg" />

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

            <DSSpacer size="lg" />

            {/* Secondary Widgets - 3-Column Grid */}
            <ErrorBoundary fallback={<ErrorState title="Additional widgets unavailable" />}>
              <DashboardSecondaryWidgets 
                assessments={assessments}
                students={students}
                metrics={metrics}
              />
            </ErrorBoundary>

            <DSSpacer size="xl" />

            {/* Customize Dashboard Option */}
            <DSCard className="text-center">
              <DSCardContent className="py-8">
                <DSSectionHeader className="mb-4">Customize Your Dashboard</DSSectionHeader>
                <DSBodyText className="mb-6 max-w-2xl mx-auto">
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
