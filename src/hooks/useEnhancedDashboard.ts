
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { optimizedDashboardService } from '@/services/dashboard/optimized-dashboard-service';

export const useEnhancedDashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['enhanced-dashboard', user?.id, timeRange],
    queryFn: async () => {
      if (!user?.id) throw new Error('No authenticated user');
      return optimizedDashboardService.getDashboardData(user.id);
    },
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false,
  });

  const handleTimeRangeChange = useCallback((newRange: 'week' | 'month' | 'quarter' | 'year') => {
    setTimeRange(newRange);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Mock data generators for new components (replace with real data in production)
  const generateMockAlerts = useCallback(() => {
    const students = data?.data?.students || [];
    return students.slice(0, 3).map((student: any, index: number) => ({
      id: `alert-${index}`,
      type: ['performance_drop', 'goal_overdue', 'missing_assessment'][index % 3] as const,
      severity: ['high', 'medium', 'low'][index % 3] as const,
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      title: `Alert for ${student.first_name}`,
      description: 'Sample alert description',
      created_at: new Date().toISOString(),
      is_dismissed: false,
      action_required: index < 2
    }));
  }, [data]);

  const generateMockActivities = useCallback(() => {
    const assessments = data?.data?.assessments || [];
    return assessments.slice(0, 5).map((assessment: any, index: number) => ({
      id: `activity-${index}`,
      type: ['assessment', 'goal', 'communication'][index % 3] as const,
      title: assessment.title || `Activity ${index + 1}`,
      description: `Recent activity for ${assessment.subject}`,
      timestamp: new Date(assessment.created_at || Date.now()),
      student: index % 2 === 0 ? { id: '1', name: 'Sample Student' } : undefined
    }));
  }, [data]);

  return {
    data,
    isLoading,
    error,
    timeRange,
    onTimeRangeChange: handleTimeRangeChange,
    onRefresh: handleRefresh,
    mockAlerts: generateMockAlerts(),
    mockActivities: generateMockActivities()
  };
};
