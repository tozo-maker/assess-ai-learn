
import React from 'react';
import DashboardStateHandler from '@/components/dashboard/DashboardStateHandler';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';

const Dashboard: React.FC = () => {
  console.log('Dashboard component render');
  
  const {
    data,
    isInitialLoading,
    error,
    isEmpty,
    refetch
  } = useOptimizedDashboard();

  console.log('Dashboard data state:', { 
    hasData: !!data, 
    isInitialLoading, 
    error: !!error, 
    isEmpty 
  });

  return (
    <div className="p-6">
      <DashboardStateHandler
        isInitialLoading={isInitialLoading}
        error={error}
        data={data}
        isEmpty={isEmpty}
        refetch={refetch}
      />
    </div>
  );
};

export default Dashboard;
