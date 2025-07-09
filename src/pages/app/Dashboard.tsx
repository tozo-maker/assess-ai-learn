
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { BarChart3 } from 'lucide-react';
import { useOptimizedDashboardData } from '@/hooks/useOptimizedDashboardData';
import DashboardContent from '@/components/dashboard/DashboardContent';
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

  return (
    <StandardPageLayout 
      title="Dashboard"
      description="Welcome to your educational insights dashboard"
      actions={actions}
    >
      <DashboardContent 
        data={data}
      />
    </StandardPageLayout>
  );
};

export default Dashboard;
