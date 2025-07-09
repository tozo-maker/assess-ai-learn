
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { optimizedDashboardService } from '@/services/dashboard/optimized-dashboard-service';
import { dashboardPerformanceService } from '@/services/dashboard-performance-service';

export const useOptimizedDashboardData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['optimized-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No authenticated user');
      
      return dashboardPerformanceService.measureAsync(
        'dashboard-data-fetch',
        () => optimizedDashboardService.getDashboardData(user.id),
        { good: 300, warning: 800 }
      );
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for dashboard
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in memory longer
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes (less frequent)
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    }
  });
};
