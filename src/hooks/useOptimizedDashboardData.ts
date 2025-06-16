
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardDataService } from '@/services/dashboard-data-service';
import { dashboardPerformanceService } from '@/services/dashboard-performance-service';

export const useOptimizedDashboardData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['optimized-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No authenticated user');
      
      return dashboardPerformanceService.measureAsync(
        'dashboard-data-fetch',
        () => dashboardDataService.getDashboardData(user.id),
        { good: 300, warning: 800 }
      );
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes instead of constant polling
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    }
  });
};
