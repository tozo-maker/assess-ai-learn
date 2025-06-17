
import { useDashboardQuery } from './dashboard/useDashboardQuery';
import { useDashboardState } from './dashboard/useDashboardState';
import { useDashboardCleanup } from './dashboard/useDashboardCleanup';

export const useOptimizedDashboard = () => {
  const query = useDashboardQuery();
  const state = useDashboardState({
    data: query.data,
    isLoading: query.isLoading,
    error: query.error
  });
  
  // Setup cleanup
  useDashboardCleanup();

  const result = {
    ...query,
    ...state
  };

  console.log('useOptimizedDashboard result:', result);
  
  return result;
};
