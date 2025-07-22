import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { studentService } from '@/services/student-service';

export const useStudents = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['students', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('No authenticated user');
      return studentService.getStudents(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};