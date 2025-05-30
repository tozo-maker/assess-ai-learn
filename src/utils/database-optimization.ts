
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface QueryOptimizationSuggestion {
  table: string;
  column: string;
  indexType: 'btree' | 'hash' | 'gin' | 'gist';
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

type TableName = keyof Database['public']['Tables'];

export class DatabaseOptimizer {
  // Analyze query patterns and suggest optimizations
  static getOptimizationSuggestions(): QueryOptimizationSuggestion[] {
    return [
      {
        table: 'students',
        column: 'teacher_id',
        indexType: 'btree',
        reason: 'Frequently queried in student lists and performance analytics',
        priority: 'high'
      },
      {
        table: 'student_responses',
        column: 'student_id',
        indexType: 'btree',
        reason: 'Essential for individual student performance queries',
        priority: 'high'
      },
      {
        table: 'student_responses',
        column: 'assessment_id',
        indexType: 'btree',
        reason: 'Critical for assessment analysis and reporting',
        priority: 'high'
      },
      {
        table: 'student_responses',
        column: 'created_at',
        indexType: 'btree',
        reason: 'Needed for time-based queries and trend analysis',
        priority: 'medium'
      },
      {
        table: 'assessments',
        column: 'teacher_id',
        indexType: 'btree',
        reason: 'Required for teacher-specific assessment queries',
        priority: 'high'
      },
      {
        table: 'goals',
        column: 'student_id',
        indexType: 'btree',
        reason: 'Frequently accessed for student goal tracking',
        priority: 'medium'
      },
      {
        table: 'goals',
        column: 'teacher_id',
        indexType: 'btree',
        reason: 'Used in teacher dashboards and goal management',
        priority: 'medium'
      },
      {
        table: 'assessment_analysis',
        column: 'student_id',
        indexType: 'btree',
        reason: 'Critical for AI analysis retrieval',
        priority: 'high'
      },
      {
        table: 'system_performance_logs',
        column: 'created_at',
        indexType: 'btree',
        reason: 'Essential for performance monitoring queries',
        priority: 'low'
      },
      {
        table: 'notifications',
        column: 'teacher_id',
        indexType: 'btree',
        reason: 'Required for notification delivery',
        priority: 'medium'
      }
    ];
  }

  // Generate SQL for creating recommended indexes
  static generateIndexSQL(): string[] {
    const suggestions = this.getOptimizationSuggestions();
    
    return suggestions.map(suggestion => {
      const indexName = `idx_${suggestion.table}_${suggestion.column}`;
      return `CREATE INDEX IF NOT EXISTS ${indexName} ON ${suggestion.table} USING ${suggestion.indexType} (${suggestion.column});`;
    });
  }

  // Test query performance
  static async testQueryPerformance() {
    const queries = [
      {
        name: 'Student List Query',
        query: () => supabase.from('students').select('*').limit(10)
      },
      {
        name: 'Student Responses Query',
        query: () => supabase.from('student_responses').select('*').limit(10)
      },
      {
        name: 'Assessment Analysis Query',
        query: () => supabase.from('assessment_analysis').select('*').limit(5)
      },
      {
        name: 'Goals Query',
        query: () => supabase.from('goals').select('*').limit(10)
      }
    ];

    const results = [];

    for (const test of queries) {
      const startTime = performance.now();
      try {
        const { data, error } = await test.query();
        const duration = performance.now() - startTime;
        
        results.push({
          name: test.name,
          duration: Math.round(duration),
          status: error ? 'error' : 'success',
          recordCount: data?.length || 0,
          error: error?.message
        });
      } catch (error: any) {
        const duration = performance.now() - startTime;
        results.push({
          name: test.name,
          duration: Math.round(duration),
          status: 'error',
          recordCount: 0,
          error: error.message
        });
      }
    }

    return results;
  }

  // Analyze table sizes and suggest archiving strategies
  static async analyzeTableSizes() {
    const tableNames: TableName[] = [
      'students',
      'student_responses', 
      'assessments',
      'assessment_analysis',
      'goals',
      'system_performance_logs'
    ];

    const analysis = [];

    for (const tableName of tableNames) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          analysis.push({
            table: tableName,
            recordCount: count || 0,
            recommendation: this.getArchivingRecommendation(tableName, count || 0)
          });
        }
      } catch (error) {
        analysis.push({
          table: tableName,
          recordCount: 0,
          error: 'Could not analyze table'
        });
      }
    }

    return analysis;
  }

  private static getArchivingRecommendation(table: string, count: number): string {
    switch (table) {
      case 'system_performance_logs':
        return count > 10000 ? 'Consider archiving logs older than 30 days' : 'No archiving needed';
      case 'student_responses':
        return count > 50000 ? 'Consider archiving responses older than 1 year' : 'No archiving needed';
      case 'assessment_analysis':
        return count > 5000 ? 'Consider archiving old analyses' : 'No archiving needed';
      default:
        return count > 10000 ? 'Monitor growth and consider archiving strategy' : 'No archiving needed';
    }
  }

  // Connection pooling recommendations
  static getConnectionPoolingRecommendations() {
    return {
      currentConnections: 'Monitor via Supabase dashboard',
      recommendations: [
        'Use connection pooling for high-traffic applications',
        'Configure appropriate pool sizes based on usage patterns',
        'Monitor connection usage and adjust limits as needed',
        'Consider read replicas for read-heavy workloads'
      ],
      supabaseSettings: {
        poolSize: 'Default: 15 connections per pool',
        timeout: 'Default: 10 seconds',
        maxLifetime: 'Default: 3600 seconds'
      }
    };
  }
}

// Utility function to monitor database operations
export function withDatabaseMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      console.log(`Database operation '${operationName}' completed in ${duration.toFixed(2)}ms`);
      
      if (duration > 1000) {
        console.warn(`Slow database operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      resolve(result);
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`Database operation '${operationName}' failed after ${duration.toFixed(2)}ms:`, error);
      reject(error);
    }
  });
}
