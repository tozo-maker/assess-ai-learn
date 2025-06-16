import { supabase } from '@/integrations/supabase/client';

interface QueryPlan {
  table: string;
  select: string[];
  filters: Record<string, any>;
  joins: string[];
  orderBy?: { column: string; ascending: boolean };
  limit?: number;
}

class QueryOptimizer {
  // Intelligent query builder
  static buildOptimizedQuery(plan: QueryPlan) {
    // Start with the table and select - this gives us a PostgrestFilterBuilder
    const selectClause = plan.select.join(', ');
    let query = supabase.from(plan.table as any).select(selectClause);
    
    // Apply filters efficiently - now we have access to filter methods
    Object.entries(plan.filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (typeof value === 'object' && value.operator) {
        switch (value.operator) {
          case 'gte':
            query = query.gte(key, value.value);
            break;
          case 'lte':
            query = query.lte(key, value.value);
            break;
          case 'like':
            query = query.like(key, value.value);
            break;
          case 'ilike':
            query = query.ilike(key, value.value);
            break;
          default:
            query = query.eq(key, value.value);
        }
      } else {
        query = query.eq(key, value);
      }
    });
    
    // Apply ordering
    if (plan.orderBy) {
      query = query.order(plan.orderBy.column, { ascending: plan.orderBy.ascending });
    }
    
    // Apply limit
    if (plan.limit) {
      query = query.limit(plan.limit);
    }
    
    return query;
  }

  // Batch operations for better performance
  static async batchSelect<T>(
    queries: (() => Promise<{ data: T; error: any }>)[]
  ): Promise<(T | null)[]> {
    const results = await Promise.allSettled(queries.map(q => q()));
    
    return results.map(result => {
      if (result.status === 'fulfilled' && !result.value.error) {
        return result.value.data;
      }
      return null;
    });
  }

  // Paginated queries with cursor-based pagination
  static async paginatedQuery<T>(
    baseQuery: any,
    pageSize: number = 20,
    cursor?: string
  ): Promise<{
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    let query = baseQuery.limit(pageSize + 1); // Fetch one extra to check if there's more
    
    if (cursor) {
      query = query.gt('created_at', cursor);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const hasMore = data.length > pageSize;
    const items = hasMore ? data.slice(0, pageSize) : data;
    const nextCursor = hasMore ? data[pageSize - 1].created_at : undefined;
    
    return {
      data: items,
      nextCursor,
      hasMore
    };
  }

  // Connection pooling simulation (for awareness)
  static async withConnectionPooling<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    // In a real implementation, this would manage connection pools
    // For now, we'll just add some monitoring
    const start = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - start;
      
      if (duration > 1000) {
        console.warn(`Slow query detected: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }

  // Query result transformations
  static transformStudentData(rawData: any[]) {
    return rawData.map(student => ({
      ...student,
      fullName: `${student.first_name} ${student.last_name}`,
      performance: student.student_performance?.[0] || {
        average_score: null,
        performance_level: 'No data',
        needs_attention: false
      }
    }));
  }

  static transformAssessmentData(rawData: any[]) {
    return rawData.map(assessment => ({
      ...assessment,
      formattedDate: assessment.assessment_date 
        ? new Date(assessment.assessment_date).toLocaleDateString()
        : 'No date',
      isRecent: assessment.assessment_date 
        ? new Date(assessment.assessment_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        : false
    }));
  }

  // Index suggestions (for documentation purposes)
  static getIndexSuggestions() {
    return [
      {
        table: 'students',
        columns: ['teacher_id', 'last_name'],
        reason: 'Fast teacher student lookups with sorting'
      },
      {
        table: 'assessments',
        columns: ['teacher_id', 'assessment_date'],
        reason: 'Efficient teacher assessment queries with date ordering'
      },
      {
        table: 'student_responses',
        columns: ['student_id', 'assessment_id'],
        reason: 'Quick student performance lookups'
      },
      {
        table: 'student_performance',
        columns: ['student_id'],
        reason: 'Unique constraint and fast lookups'
      },
      {
        table: 'goals',
        columns: ['student_id', 'status'],
        reason: 'Efficient goal filtering by student and status'
      }
    ];
  }
}

export { QueryOptimizer };

// Utility functions for common query patterns
export const commonQueries = {
  // Get students with performance data
  getStudentsWithPerformance: (teacherId: string) => {
    return QueryOptimizer.buildOptimizedQuery({
      table: 'students',
      select: [
        'id',
        'first_name', 
        'last_name',
        'grade_level',
        'parent_email',
        'student_performance!inner(average_score, performance_level, needs_attention)'
      ],
      filters: { teacher_id: teacherId },
      joins: [],
      orderBy: { column: 'last_name', ascending: true }
    });
  },

  // Get recent assessments
  getRecentAssessments: (teacherId: string, limit: number = 10) => {
    return QueryOptimizer.buildOptimizedQuery({
      table: 'assessments',
      select: ['id', 'title', 'subject', 'assessment_date', 'max_score'],
      filters: { teacher_id: teacherId },
      joins: [],
      orderBy: { column: 'assessment_date', ascending: false },
      limit
    });
  },

  // Get student goals
  getActiveGoals: (studentId: string) => {
    return QueryOptimizer.buildOptimizedQuery({
      table: 'goals',
      select: ['id', 'title', 'progress_percentage', 'target_date', 'status'],
      filters: { 
        student_id: studentId,
        status: 'active'
      },
      joins: [],
      orderBy: { column: 'created_at', ascending: false }
    });
  }
};
