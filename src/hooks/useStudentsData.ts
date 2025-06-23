
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/student-service';

export const useStudentsData = () => {
  const {
    data: students,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    students,
    isLoading,
    error,
    refetch
  };
};
