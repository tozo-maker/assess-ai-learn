
import { useDashboardQuery } from './dashboard/useDashboardQuery';
import { useDashboardState } from './dashboard/useDashboardState';
import { useDashboardCleanup } from './dashboard/useDashboardCleanup';

export const useOptimizedDashboard = () => {
  // Always call hooks in the same order
  const query = useDashboardQuery();
  
  // Always call state hook, even if query fails
  const state = useDashboardState({
    data: query.data,
    isLoading: query.isLoading,
    error: query.error
  });
  
  // Always call cleanup hook
  useDashboardCleanup();

  // Combine results consistently
  const result = {
    ...query,
    ...state
  };

  // Remove console.log for production performance
  
  return result;
};
