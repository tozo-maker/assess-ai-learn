/**
 * Performance-Optimized Component Hooks
 * Provides memoized callbacks and state management
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unifiedErrorSystem } from '@/services/unified-error-system';
import type { Student, Assessment, FilterState, SearchParams } from '@/types/comprehensive';

// Optimized data fetching hook
export function useOptimizedStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      return data as Student[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

// Optimized assessments hook with filtering
export function useOptimizedAssessments(filters?: FilterState) {
  const filtersString = useMemo(() => JSON.stringify(filters || {}), [filters]);
  
  return useQuery({
    queryKey: ['assessments', filtersString],
    queryFn: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      let query = supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (filters?.subject && typeof filters.subject === 'string') {
        query = query.eq('subject', filters.subject);
      }
      if (filters?.grade_level && typeof filters.grade_level === 'string') {
        query = query.eq('grade_level', filters.grade_level);
      }
      if (filters?.assessment_type && typeof filters.assessment_type === 'string') {
        query = query.eq('assessment_type', filters.assessment_type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Assessment[];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled: true,
  });
}

// Memoized callback hook for form handlers
export function useOptimizedFormHandlers<T extends Record<string, unknown>>(
  onSubmit: (data: T) => void | Promise<void>,
  onError?: (error: Error) => void
) {
  const submitHandler = useCallback(async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      const handledError = error instanceof Error ? error : new Error('Form submission failed');
      unifiedErrorSystem.error('Form submission error', { 
        error: handledError, 
        context: { formData: data } 
      });
      onError?.(handledError);
    }
  }, [onSubmit, onError]);

  const resetHandler = useCallback(() => {
    unifiedErrorSystem.debug('Form reset triggered');
  }, []);

  return { submitHandler, resetHandler };
}

// Optimized selection state hook
export function useOptimizedSelection<T extends { id: string }>(
  items: T[] = [],
  initialSelection: string[] = []
) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelection));
  
  const selectedItems = useMemo(() => 
    items.filter(item => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection: selectedIds.size > 0,
    selectionCount: selectedIds.size
  };
}

// Debounced search hook
export function useOptimizedSearch(
  searchFn: (params: SearchParams) => Promise<unknown>,
  debounceMs: number = 300
) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    filters: {},
    sort: { field: 'created_at', direction: 'desc' },
    pagination: { page: 1, limit: 20 }
  });

  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const debouncedSearch = useCallback((params: SearchParams) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setSearchParams(params);
    }, debounceMs);
  }, [debounceMs]);

  const updateQuery = useCallback((query: string) => {
    debouncedSearch({
      ...searchParams,
      query,
      pagination: { ...searchParams.pagination, page: 1 }
    });
  }, [searchParams, debouncedSearch]);

  const updateFilters = useCallback((filters: FilterState) => {
    debouncedSearch({
      ...searchParams,
      filters,
      pagination: { ...searchParams.pagination, page: 1 }
    });
  }, [searchParams, debouncedSearch]);

  const updateSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSearchParams(prev => ({
      ...prev,
      sort: { field, direction }
    }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setSearchParams(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page }
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    searchParams,
    updateQuery,
    updateFilters,
    updateSort,
    updatePage
  };
}

// Optimized mutation hook with error handling
export function useOptimizedMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[];
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      
      options.onSuccess?.(data, variables);
      unifiedErrorSystem.info('Mutation completed successfully');
    },
    onError: (error: Error, variables) => {
      unifiedErrorSystem.error('Mutation failed', { 
        error, 
        context: { variables } 
      });
      options.onError?.(error, variables);
    }
  });
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current++;
    
    if (process.env.NODE_ENV === 'development') {
      unifiedErrorSystem.debug(`Component render: ${componentName}`, {
        component: componentName,
        renderCount: renderCountRef.current,
        timeSinceMount: Date.now() - mountTimeRef.current
      });
    }
  });

  useEffect(() => {
    const mountTime = Date.now();
    mountTimeRef.current = mountTime;

    return () => {
      const unmountTime = Date.now();
      const lifespan = unmountTime - mountTime;
      
      if (process.env.NODE_ENV === 'development') {
        unifiedErrorSystem.debug(`Component unmounted: ${componentName}`, {
          component: componentName,
          lifespan,
          totalRenders: renderCountRef.current
        });
      }
    };
  }, [componentName]);

  return {
    renderCount: renderCountRef.current,
    timeSinceMount: Date.now() - mountTimeRef.current
  };
}