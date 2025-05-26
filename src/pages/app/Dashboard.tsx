
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import AlertsWidget from '@/components/dashboard/AlertsWidget';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import RecentActivitiesList from '@/components/dashboard/RecentActivitiesList';
import PerformanceSection from '@/components/dashboard/PerformanceSection';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import { 
  useStudents, 
  useAssessments, 
  useCommunications, 
  useTeacherProfile, 
  useStudentMetrics 
} from '@/hooks/queries/useOptimizedQueries';

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
        <LoadingState type="skeleton" message="Loading your dashboard..." />
      </AppLayout>
    );
  }

  if (hasError) {
    return (
      <AppLayout>
        <ErrorState
          error={studentsError || assessmentsError || communicationsError}
          onRetry={handleRetry}
          title="Failed to load dashboard"
          description="There was an error loading your dashboard data. Please try again."
        />
      </AppLayout>
    );
  }

  // Calculate real statistics
  const totalStudents = students.length;
  const totalAssessments = assessments.length;
  const aiInsights = communications.filter(c => c.communication_type === 'ai_insight').length;
  
  // Calculate recent assessments (this week)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentAssessments = assessments.filter(a => 
    new Date(a.created_at) >= oneWeekAgo
  ).length;

  // Calculate this month's new students
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const newStudentsThisMonth = students.filter(s => 
    new Date(s.created_at) >= oneMonthAgo
  ).length;

  // Calculate today's new insights
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysInsights = communications.filter(c => 
    c.communication_type === 'ai_insight' && new Date(c.created_at) >= today
  ).length;

  // Generate alerts based on real data
  const alerts = [
    ...(studentMetrics?.studentsNeedingAttention > 0 ? [{
      id: '1',
      type: 'performance' as const,
      title: 'Students need attention',
      description: `${studentMetrics.studentsNeedingAttention} students requiring additional support`,
      studentCount: studentMetrics.studentsNeedingAttention,
      severity: 'high' as const,
      actionUrl: '/students'
    }] : []),
    ...(totalAssessments === 0 ? [{
      id: '2',
      type: 'performance' as const,
      title: 'No assessments yet',
      description: 'Start by creating your first assessment to track student progress',
      studentCount: totalStudents,
      severity: 'medium' as const,
      actionUrl: '/assessments/add'
    }] : []),
    ...(totalStudents === 0 ? [{
      id: '3',
      type: 'attendance' as const,
      title: 'No students registered',
      description: 'Add students to your class to get started',
      studentCount: 0,
      severity: 'medium' as const,
      actionUrl: '/students/add'
    }] : [])
  ];

  const teacherName = teacherProfile?.full_name || "Teacher";
  const firstName = teacherName.split(' ')[0];

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="space-y-8">
          {/* Welcome Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}! 👋</h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your students today.</p>
          </div>

          {/* Stats Cards */}
          <ErrorBoundary fallback={<ErrorState title="Stats unavailable" />}>
            <DashboardStats
              totalStudents={totalStudents}
              totalAssessments={totalAssessments}
              aiInsights={aiInsights}
              recentAssessments={recentAssessments}
              newStudentsThisMonth={newStudentsThisMonth}
              todaysInsights={todaysInsights}
              studentMetrics={studentMetrics}
            />
          </ErrorBoundary>

          {/* Performance Widgets Row */}
          <ErrorBoundary fallback={<ErrorState title="Performance data unavailable" />}>
            <PerformanceSection 
              assessments={assessments}
              studentMetrics={studentMetrics}
            />
          </ErrorBoundary>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <ErrorBoundary fallback={<ErrorState title="Activity feed unavailable" />}>
                <RecentActivitiesList
                  recentAssessments={recentAssessments}
                  todaysInsights={todaysInsights}
                  studentMetrics={studentMetrics}
                />
              </ErrorBoundary>
            </div>

            {/* Quick Actions and Alerts */}
            <div className="space-y-6">
              <ErrorBoundary>
                <QuickActionsCard />
              </ErrorBoundary>
              
              {/* Priority Alerts */}
              {alerts.length > 0 && (
                <ErrorBoundary fallback={<ErrorState title="Alerts unavailable" />}>
                  <AlertsWidget alerts={alerts} />
                </ErrorBoundary>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default Dashboard;
