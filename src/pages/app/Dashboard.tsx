
import React from 'react';
import { useOptimizedDashboardData } from '@/hooks/useOptimizedDashboardData';
import DashboardStateHandler from '@/components/dashboard/DashboardStateHandler';
import DashboardErrorBoundary from '@/components/dashboard/DashboardErrorBoundary';

const Dashboard: React.FC = () => {
  const {
    data,
    isLoading: isInitialLoading,
    error,
    refetch
  } = useOptimizedDashboardData();

  // Check if we have an empty state (no students)
  const isEmpty = data && data.students && data.students.length === 0;

  return (
    <DashboardErrorBoundary>
      <DashboardStateHandler
        isInitialLoading={isInitialLoading}
        error={error}
        data={data}
        isEmpty={isEmpty}
        refetch={refetch}
      />
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
