
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import EnhancedLoadingState from '@/components/common/EnhancedLoadingState';
import ErrorState from '@/components/common/ErrorState';
import { 
  useStudents, 
  useAssessments, 
  useCommunications, 
  useTeacherProfile, 
  useStudentMetrics 
} from '@/hooks/queries/useOptimizedQueries';

// Import redesigned components
import { 
  DSSection,
  DSPageContainer,
  DSContentGrid,
  DSGridItem,
  DSSpacer,
  DSFlexContainer,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSCardDescription,
  DSButton,
  DSSectionHeader,
  DSBodyText,
  DSHelpText
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
    data: students = [],
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents
  } = useStudents();

  const {
    data: assessments = [],
    isLoading: assessmentsLoading,
    error: assessmentsError,
    refetch: refetchAssessments
  } = useAssessments();

  const {
    data: communications = [],
    isLoading: communicationsLoading,
    error: communicationsError,
    refetch: refetchCommunications
  } = useCommunications();

  const { data: teacherProfile } = useTeacherProfile();
  const { data: studentMetrics } = useStudentMetrics();

  // Handle loading state
  const isLoading = studentsLoading || assessmentsLoading || communicationsLoading;
  
  // Handle error state
  const hasError = studentsError || assessmentsError || communicationsError;
  const handleRetry = () => {
    if (studentsError) refetchStudents();
    if (assessmentsError) refetchAssessments();
    if (communicationsError) refetchCommunications();
  };

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
          error={studentsError || assessmentsError || communicationsError}
          onRetry={handleRetry}
          title="Failed to load dashboard"
          description="There was an error loading your dashboard data. Please try again."
        />
      </AppLayout>
    );
  }

  // Calculate metrics
  const totalStudents = students?.length || 0;
  const totalAssessments = assessments?.length || 0;
  const aiInsights = communications?.filter(c => c.communication_type === 'ai_insight')?.length || 0;
  
  // Calculate recent assessments (this week)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentAssessments = assessments?.filter(a => 
    new Date(a.created_at) >= oneWeekAgo
  )?.length || 0;

  // Generate alerts based on real data
  const alerts = [
    ...(studentMetrics?.studentsNeedingAttention && studentMetrics.studentsNeedingAttention > 0 ? [{
      id: '1',
      type: 'performance' as const,
      title: 'Students need attention',
      description: `${studentMetrics.studentsNeedingAttention} students requiring additional support`,
      studentCount: studentMetrics.studentsNeedingAttention,
      severity: 'high' as const,
      actionUrl: '/app/students'
    }] : []),
    ...(totalAssessments === 0 ? [{
      id: '2',
      type: 'performance' as const,
      title: 'No assessments yet',
      description: 'Start by creating your first assessment to track student progress',
      studentCount: totalStudents,
      severity: 'medium' as const,
      actionUrl: '/app/assessments/add'
    }] : [])
  ];

  const teacherName = teacherProfile?.full_name || "Teacher";

  // Prepare data for components
  const dashboardData = {
    teacher: {
      name: teacherName,
      firstName: teacherName.split(' ')[0]
    },
    metrics: {
      totalStudents,
      totalAssessments,
      aiInsights,
      recentAssessments,
      averagePerformance: studentMetrics?.averagePerformance || "N/A",
      studentsNeedingAttention: studentMetrics?.studentsNeedingAttention || 0
    },
    alerts,
    students,
    assessments,
    communications
  };

  return (
    <AppLayout>
      <ErrorBoundary>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            
            {/* Welcome Section - Full Width */}
            <ErrorBoundary fallback={<ErrorState title="Welcome section unavailable" />}>
              <DashboardWelcomeSection teacher={dashboardData.teacher} />
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
              <DashboardMetricCards metrics={dashboardData.metrics} />
            </ErrorBoundary>

            <DSSpacer size="lg" />

            {/* Recent Activity - 2-Column: List + Insights */}
            <DSContentGrid cols={2}>
              <DSGridItem span={1}>
                <ErrorBoundary fallback={<ErrorState title="Activity feed unavailable" />}>
                  <DashboardActivityFeed 
                    recentAssessments={recentAssessments}
                    totalStudents={totalStudents}
                    studentsNeedingAttention={studentMetrics?.studentsNeedingAttention || 0}
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
                metrics={dashboardData.metrics}
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
