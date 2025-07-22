
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { dataService } from '@/services/data-service';
import DashboardStateHandler from '@/components/dashboard/DashboardStateHandler';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const {
    data,
    isLoading: isInitialLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Ensure student performance records exist
      await dataService.ensureStudentPerformanceRecords(user.id);
      
      // Fetch dashboard data
      return await dataService.getDashboardData(user.id);
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    meta: {
      onError: (error) => {
        console.error('Dashboard query error:', error);
      }
    }
  });

  // Check if we have an empty state (no students)
  const isEmpty = data && data.students.length === 0;

  return (
    <DashboardStateHandler
      isInitialLoading={isInitialLoading}
      error={error}
      data={data}
      isEmpty={isEmpty}
      refetch={refetch}
    />
  );
};

export default Dashboard;
