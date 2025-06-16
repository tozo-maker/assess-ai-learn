
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';
import { communicationsService } from '@/services/communications-service';
import { authService } from '@/services/auth-service';
import { StudentWithPerformance } from '@/types/student';
import { Assessment } from '@/types/assessment';
import { ParentCommunication } from '@/types/communications';

// Default query options for consistent behavior
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 1,
  refetchOnWindowFocus: false,
};

// Student metrics type definition
export interface StudentMetrics {
  totalStudents: number;
  studentsNeedingAttention: number;
  aboveAverageCount: number;
  averagePerformance: string;
}

// Teacher profile type definition
export interface TeacherProfile {
  id: string;
  full_name: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export const useStudents = (options?: Partial<UseQueryOptions<StudentWithPerformance[], Error>>) => {
  return useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
    ...defaultQueryOptions,
    ...options,
  });
};

export const useAssessments = (options?: Partial<UseQueryOptions<Assessment[], Error>>) => {
  return useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentService.getAssessments,
    ...defaultQueryOptions,
    ...options,
  });
};

export const useCommunications = (options?: Partial<UseQueryOptions<ParentCommunication[], Error>>) => {
  return useQuery({
    queryKey: ['communications'],
    queryFn: communicationsService.getCommunications,
    ...defaultQueryOptions,
    ...options,
  });
};

export const useTeacherProfile = (options?: Partial<UseQueryOptions<TeacherProfile, Error>>) => {
  return useQuery({
    queryKey: ['teacher-profile'],
    queryFn: authService.getProfile,
    ...defaultQueryOptions,
    ...options,
  });
};

export const useStudentMetrics = (options?: Partial<UseQueryOptions<StudentMetrics, Error>>) => {
  return useQuery({
    queryKey: ['student-metrics'],
    queryFn: studentService.getStudentMetrics,
    ...defaultQueryOptions,
    ...options,
  });
};
