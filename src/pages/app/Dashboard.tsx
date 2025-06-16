
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import DashboardErrorBoundary from '@/components/dashboard/DashboardErrorBoundary';
import DashboardStateHandler from '@/components/dashboard/DashboardStateHandler';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';

const Dashboard = () => {
  const { data, isInitialLoading, error, refetch, isEmpty } = useOptimizedDashboard();

  console.log('Dashboard render:', { data, isInitialLoading, error, isEmpty });

  return (
    <AppLayout>
      <DashboardErrorBoundary>
        <Breadcrumbs />
        <DashboardStateHandler
          isInitialLoading={isInitialLoading}
          error={error}
          data={data}
          isEmpty={isEmpty}
          refetch={refetch}
        />
      </DashboardErrorBoundary>
    </AppLayout>
  );
};

export default Dashboard;
