import { useQuery } from '@tanstack/react-query';
import { classService } from '@/services/class-service';

export const useClassesData = () => {
  const {
    data: classes,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['classes'],
    queryFn: classService.getClasses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    classes,
    isLoading,
    error,
    refetch
  };
};

export const useClassData = (classId: string) => {
  const {
    data: classData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => classService.getClassById(classId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!classId,
  });

  return {
    classData,
    isLoading,
    error,
    refetch
  };
};

export const useClassesByGradeLevel = (gradeLevel: string) => {
  const {
    data: classes,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['classes', 'grade', gradeLevel],
    queryFn: () => classService.getClassesByGradeLevel(gradeLevel),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!gradeLevel,
  });

  return {
    classes,
    isLoading,
    error,
    refetch
  };
};