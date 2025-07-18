
import { useQuery } from '@tanstack/react-query';
import { goalService } from '@/services/goal-service';
import { studentService } from '@/services/student-service';

// Export types from the appropriate modules
export type { Goal, GoalFilters } from '@/types/goals';

export const useGoalsData = () => {
  const {
    data: goals,
    isLoading: goalsLoading,
    error: goalsError,
    refetch: refetchGoals
  } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getGoals(),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = goalsLoading || studentsLoading;
  const error = goalsError || studentsError;
  
  const refetch = () => {
    refetchGoals();
    refetchStudents();
  };

  return {
    goals: goals || [],
    students: students || [],
    isLoading,
    error,
    refetch
  };
};
