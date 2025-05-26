
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';
import { communicationsService } from '@/services/communications-service';
import { authService } from '@/services/auth-service';

// Default query options for consistent behavior
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 1,
  refetchOnWindowFocus: false,
};

export const useStudents = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
    ...defaultQueryOptions,
    ...options,
  });
};

export const useAssessments = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentService.getAssessments,
    ...defaultQueryOptions,
    ...options,
  });
};

export const useCommunications = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['communications'],
    queryFn: communicationsService.getCommunications,
    ...defaultQueryOptions,
    ...options,
  });
};

export const useTeacherProfile = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['teacher-profile'],
    queryFn: authService.getProfile,
    ...defaultQueryOptions,
    ...options,
  });
};

export const useStudentMetrics = (options?: Partial<UseQueryOptions>) => {
  return useQuery({
    queryKey: ['student-metrics'],
    queryFn: studentService.getStudentMetrics,
    ...defaultQueryOptions,
    ...options,
  });
};
