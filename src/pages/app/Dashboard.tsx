
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import DashboardErrorBoundary from '@/components/dashboard/DashboardErrorBoundary';
import DashboardStateHandler from '@/components/dashboard/DashboardStateHandler';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';

const Dashboard = () => {
  const dashboardState = useOptimizedDashboard();
  
  console.log('Dashboard render:', { 
    isInitialLoading: dashboardState.isInitialLoading,
    hasError: dashboardState.hasError,
    isEmpty: dashboardState.isEmpty,
    hasData: dashboardState.hasData,
    studentsCount: dashboardState.data?.students?.length
  });

  return (
    <AppLayout>
      <DashboardErrorBoundary>
        <Breadcrumbs />
        <DashboardStateHandler
          isInitialLoading={dashboardState.isInitialLoading}
          error={dashboardState.error}
          data={dashboardState.data}
          isEmpty={dashboardState.isEmpty}
          refetch={dashboardState.refetch}
        />
      </DashboardErrorBoundary>
    </AppLayout>
  );
};

export default Dashboard;
