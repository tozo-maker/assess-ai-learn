
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import AlertsWidget from '@/components/dashboard/AlertsWidget';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActionsCard from '@/components/dashboard/QuickActionsCard';
import RecentActivitiesList from '@/components/dashboard/RecentActivitiesList';
import PerformanceSection from '@/components/dashboard/PerformanceSection';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';
import { communicationsService } from '@/services/communications-service';
import { authService } from '@/services/auth-service';

const Dashboard = () => {
  // Fetch real data from services
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentService.getAssessments,
  });

  const { data: communications = [], isLoading: communicationsLoading } = useQuery({
    queryKey: ['communications'],
    queryFn: communicationsService.getCommunications,
  });

  const { data: teacherProfile } = useQuery({
    queryKey: ['teacher-profile'],
    queryFn: authService.getProfile,
  });

  const { data: studentMetrics } = useQuery({
    queryKey: ['student-metrics'],
    queryFn: studentService.getStudentMetrics,
  });

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

  if (studentsLoading || assessmentsLoading || communicationsLoading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <Skeleton className="h-9 w-96 mb-2" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}! 👋</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your students today.</p>
        </div>

        {/* Stats Cards */}
        <DashboardStats
          totalStudents={totalStudents}
          totalAssessments={totalAssessments}
          aiInsights={aiInsights}
          recentAssessments={recentAssessments}
          newStudentsThisMonth={newStudentsThisMonth}
          todaysInsights={todaysInsights}
          studentMetrics={studentMetrics}
        />

        {/* Performance Widgets Row */}
        <PerformanceSection 
          assessments={assessments}
          studentMetrics={studentMetrics}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivitiesList
              recentAssessments={recentAssessments}
              todaysInsights={todaysInsights}
              studentMetrics={studentMetrics}
            />
          </div>

          {/* Quick Actions and Alerts */}
          <div className="space-y-6">
            <QuickActionsCard />
            
            {/* Priority Alerts */}
            {alerts.length > 0 && <AlertsWidget alerts={alerts} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
