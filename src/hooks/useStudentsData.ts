
import { useStudents } from '@/hooks/useStudents';

export const useStudentsData = () => {
  const { data: students, isLoading, error, refetch } = useStudents();
  
  return {
    students,
    isLoading,
    error,
    refetch
  };
};

