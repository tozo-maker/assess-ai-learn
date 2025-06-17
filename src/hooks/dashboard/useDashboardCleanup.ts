
import { useEffect } from 'react';
import { dashboardOptimizedQueries } from '@/services/dashboard/dashboard-optimized-queries';

export const useDashboardCleanup = () => {
  useEffect(() => {
    return () => {
      dashboardOptimizedQueries.cancelCurrentRequest();
    };
  }, []);
};
