
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { BarChart3 } from 'lucide-react';
import { useOptimizedDashboardData } from '@/hooks/useOptimizedDashboardData';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { ClassAnalytics } from '@/components/analytics/ClassAnalytics';
import PageLoadingState from '@/components/common/PageLoadingState';
import PageErrorState from '@/components/common/PageErrorState';

const Dashboard: React.FC = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useOptimizedDashboardData();

  const actions = (
    <BarChart3 className="h-5 w-5 text-primary" />
  );

  if (isLoading) {
    return (
      <StandardPageLayout 
        title="Dashboard"
        actions={actions}
      >
        <PageLoadingState message="Loading dashboard data..." />
      </StandardPageLayout>
    );
  }

  if (error) {
    return (
      <StandardPageLayout 
        title="Dashboard"
        actions={actions}
      >
        <PageErrorState 
          error={error}
          onRetry={refetch}
          title="Dashboard Error"
          description="Failed to load dashboard data. Please try again."
        />
      </StandardPageLayout>
    );
  }

  // Transform data to match expected interface
  const transformedData = data ? {
    teacher: data.teacher,
    students: data.students,
    assessments: data.assessments,
    summary: {
      totalStudents: data.metrics.totalStudents,
      totalAssessments: data.metrics.totalAssessments,
      averageScore: data.metrics.averagePerformance,
      studentsNeedingAttention: data.metrics.studentsNeedingAttention
    }
  } : null;

  if (!transformedData) {
    return (
      <StandardPageLayout 
        title="Dashboard"
        actions={actions}
      >
        <PageLoadingState message="Loading dashboard data..." />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout 
      title="Dashboard"
      description="Welcome to your educational insights dashboard"
      actions={actions}
    >
      <div className="space-y-8">
        <DashboardContent 
          data={transformedData}
        />
        
        {/* Class Analytics Section */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-6">Class Analytics</h2>
          <ClassAnalytics />
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default Dashboard;
