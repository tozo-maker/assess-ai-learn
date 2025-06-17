
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardOptimizedQueries } from '@/services/dashboard/dashboard-optimized-queries';

export const useDashboardQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['optimized-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No authenticated user');
      console.log('Fetching dashboard data for user:', user.id);
      const data = await dashboardOptimizedQueries.getDashboardData(user.id);
      console.log('Dashboard data fetched:', data);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: (failureCount, error: any) => {
      console.log('Dashboard query retry:', { failureCount, error });
      // Don't retry on auth errors
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    }
  });
};
