
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { enhancedCache } from '@/services/enhanced-caching-service';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';
import { StudentWithPerformance } from '@/types/student';
import { Assessment } from '@/types/assessment';

// Optimized query configuration
const optimizedQueryDefaults = {
  staleTime: 2 * 60 * 1000,  // 2 minutes
  gcTime: 10 * 60 * 1000,    // 10 minutes (formerly cacheTime)
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    return failureCount < 2;
  },
  refetchOnWindowFocus: false,
  refetchOnMount: 'always' as const,
};

// Student queries with intelligent caching
export const useOptimizedStudents = (options?: Partial<UseQueryOptions<StudentWithPerformance[], Error>>) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['students'],
    queryFn: async (): Promise<StudentWithPerformance[]> => {
      if (!user?.id) throw new Error('No authenticated user');
      
      return enhancedCache.getCachedStudents(user.id);
    },
    enabled: !!user?.id,
    ...optimizedQueryDefaults,
    ...options,
  });
};

// Assessment queries with background prefetching
export const useOptimizedAssessments = (options?: Partial<UseQueryOptions<Assessment[], Error>>) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['assessments'],
    queryFn: async (): Promise<Assessment[]> => {
      if (!user?.id) throw new Error('No authenticated user');
      
      return enhancedCache.getCachedAssessments(user.id);
    },
    enabled: !!user?.id,
    ...optimizedQueryDefaults,
    ...options,
  });
};

// Student metrics with aggressive caching
export const useOptimizedStudentMetrics = (options?: Partial<UseQueryOptions<any, Error>>) => {
  return useQuery({
    queryKey: ['student-metrics'],
    queryFn: async () => {
      const cached = enhancedCache.get('student-metrics');
      if (cached) return cached;

      const metrics = await studentService.getStudentMetrics();
      enhancedCache.set('student-metrics', metrics, {
        ttl: 5 * 60 * 1000, // 5 minutes
        tags: ['metrics', 'students']
      });
      
      return metrics;
    },
    ...optimizedQueryDefaults,
    staleTime: 5 * 60 * 1000, // 5 minutes for metrics
    ...options,
  });
};

// Teacher profile hook
export const useTeacherProfile = (options?: Partial<UseQueryOptions<any, Error>>) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['teacher-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No authenticated user');
      
      const cached = enhancedCache.get('teacher-profile', { params: { userId: user.id } });
      if (cached) return cached;

      // Mock teacher profile data - replace with actual service call
      const profile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'Teacher',
        school: user.user_metadata?.school || 'School',
        subjects: user.user_metadata?.subjects || [],
        grade_levels: user.user_metadata?.grade_levels || []
      };
      
      enhancedCache.set('teacher-profile', profile, {
        ttl: 10 * 60 * 1000, // 10 minutes
        tags: ['teacher', `user:${user.id}`],
        params: { userId: user.id }
      });
      
      return profile;
    },
    enabled: !!user?.id,
    ...optimizedQueryDefaults,
    ...options,
  });
};

// Prefetch helper for background loading
export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const prefetchStudents = async () => {
    if (!user?.id) return;
    
    await queryClient.prefetchQuery({
      queryKey: ['students'],
      queryFn: async () => {
        return enhancedCache.getCachedStudents(user.id);
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchAssessments = async () => {
    if (!user?.id) return;
    
    await queryClient.prefetchQuery({
      queryKey: ['assessments'],
      queryFn: async () => {
        return enhancedCache.getCachedAssessments(user.id);
      },
      staleTime: 3 * 60 * 1000,
    });
  };

  return {
    prefetchStudents,
    prefetchAssessments,
    prefetchAll: async () => {
      await Promise.all([
        prefetchStudents(),
        prefetchAssessments()
      ]);
    }
  };
};

// Optimized mutations with cache invalidation
export const useOptimizedStudentMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: studentService.createStudent,
    onSuccess: async (data, variables) => {
      if (user?.id) {
        // Invalidate cache
        enhancedCache.invalidateStudentData(user.id);
        
        // Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['student-metrics'] });
        
        // Optimistically update if possible
        queryClient.setQueryData(['students'], (old: StudentWithPerformance[] | undefined) => {
          if (!old) return [data];
          return [data, ...old];
        });
      }
    },
    onError: (error) => {
      console.error('Student creation failed:', error);
    }
  });
};

export const useOptimizedAssessmentMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: assessmentService.createAssessment,
    onSuccess: async (data, variables) => {
      if (user?.id) {
        // Invalidate cache
        enhancedCache.invalidateAssessmentData(user.id);
        
        // Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: ['assessments'] });
        
        // Optimistically update
        queryClient.setQueryData(['assessments'], (old: Assessment[] | undefined) => {
          if (!old) return [data];
          return [data, ...old];
        });
      }
    }
  });
};

// Background sync for offline-first experience
export const useBackgroundSync = () => {
  const queryClient = useQueryClient();
  const { prefetchAll } = usePrefetchQueries();

  const syncInBackground = async () => {
    try {
      // Prefetch critical data
      await prefetchAll();
      
      // Refresh stale queries
      await queryClient.refetchQueries({
        stale: true,
        type: 'active'
      });
      
      console.log('Background sync completed');
    } catch (error) {
      console.warn('Background sync failed:', error);
    }
  };

  return { syncInBackground };
};

// Performance monitoring for queries
export const useQueryPerformanceMonitoring = () => {
  const queryClient = useQueryClient();

  const getQueryStats = () => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheStats: enhancedCache.getStats()
    };
  };

  const logSlowQueries = () => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    queries.forEach(query => {
      const state = query.state;
      if (state.dataUpdatedAt && state.dataUpdatedAt > 0) {
        const duration = Date.now() - state.dataUpdatedAt;
        if (duration > 2000) { // Queries taking more than 2 seconds
          console.warn(`Slow query detected:`, {
            queryKey: query.queryKey,
            duration: `${duration}ms`,
            status: state.status
          });
        }
      }
    });
  };

  return {
    getQueryStats,
    logSlowQueries
  };
};
