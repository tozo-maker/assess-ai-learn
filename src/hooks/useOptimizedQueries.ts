
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { performanceCache } from '@/utils/performance-cache';
import { useAuth } from '@/contexts/AuthContext';

export const useOptimizedQueries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const useOptimizedStudents = () => {
    return useQuery({
      queryKey: ['students', user?.id],
      queryFn: async () => {
        if (!user?.id) throw new Error('User not authenticated');
        return await performanceCache.getCachedStudents(user.id);
      },
      enabled: !!user?.id,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useOptimizedAssessments = () => {
    return useQuery({
      queryKey: ['assessments', user?.id],
      queryFn: async () => {
        if (!user?.id) throw new Error('User not authenticated');
        return await performanceCache.getCachedAssessments(user.id);
      },
      enabled: !!user?.id,
      staleTime: 3 * 60 * 1000, // 3 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const useOptimizedStudentPerformance = (studentId: string) => {
    return useQuery({
      queryKey: ['studentPerformance', studentId],
      queryFn: async () => {
        if (!studentId) throw new Error('Student ID required');
        return await performanceCache.getCachedStudentPerformance(studentId);
      },
      enabled: !!studentId,
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 3 * 60 * 1000, // 3 minutes
    });
  };

  const useOptimizedGoals = (studentId: string) => {
    return useQuery({
      queryKey: ['goals', studentId],
      queryFn: async () => {
        if (!studentId) throw new Error('Student ID required');
        return await performanceCache.getCachedGoals(studentId);
      },
      enabled: !!studentId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Cache invalidation helpers
  const invalidateStudentData = (studentId?: string) => {
    if (user?.id) {
      performanceCache.invalidateStudentData(user.id, studentId);
      queryClient.invalidateQueries({ queryKey: ['students', user.id] });
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: ['studentPerformance', studentId] });
        queryClient.invalidateQueries({ queryKey: ['goals', studentId] });
      }
    }
  };

  const invalidateAssessmentData = () => {
    if (user?.id) {
      performanceCache.invalidateAssessmentData(user.id);
      queryClient.invalidateQueries({ queryKey: ['assessments', user.id] });
    }
  };

  const invalidateGoalData = (studentId: string) => {
    performanceCache.invalidateGoalData(studentId);
    queryClient.invalidateQueries({ queryKey: ['goals', studentId] });
  };

  return {
    useOptimizedStudents,
    useOptimizedAssessments,
    useOptimizedStudentPerformance,
    useOptimizedGoals,
    invalidateStudentData,
    invalidateAssessmentData,
    invalidateGoalData
  };
};
