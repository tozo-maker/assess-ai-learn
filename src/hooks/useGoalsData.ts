
import { useQuery } from '@tanstack/react-query';
import { goalsService } from '@/services/goals-service';
import { studentService } from '@/services/student-service';

export const useGoalsData = () => {
  const {
    data: goals,
    isLoading: goalsLoading,
    error: goalsError,
    refetch: refetchGoals
  } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsService.getGoals,
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
    goals,
    students,
    isLoading,
    error,
    refetch
  };
};
