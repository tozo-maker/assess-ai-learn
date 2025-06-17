
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import DashboardErrorBoundary from '@/components/dashboard/DashboardErrorBoundary';
import DashboardStateHandlerRefined from '@/components/dashboard/DashboardStateHandlerRefined';
import { useOptimizedDashboard } from '@/hooks/useOptimizedDashboard';

const DashboardRefined = () => {
  const dashboardState = useOptimizedDashboard();
  
  console.log('Refined Dashboard render:', { 
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
        <DashboardStateHandlerRefined
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

export default DashboardRefined;
