
import { useEffect } from 'react';
import { dashboardOptimizedQueries } from '@/services/dashboard/dashboard-optimized-queries';

export const useDashboardCleanup = () => {
  useEffect(() => {
    return () => {
      try {
        if (dashboardOptimizedQueries.cancelCurrentRequest) {
          dashboardOptimizedQueries.cancelCurrentRequest();
        }
      } catch (error) {
        console.warn('Error during dashboard cleanup:', error);
      }
    };
  }, []);
};
