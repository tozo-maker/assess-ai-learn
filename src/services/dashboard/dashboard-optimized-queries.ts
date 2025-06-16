
import { supabase } from '@/integrations/supabase/client';

interface OptimizedDashboardData {
  students: any[];
  assessments: any[];
  performance: any[];
  teacher: any;
  metrics: {
    totalStudents: number;
    totalAssessments: number;
    recentAssessments: number;
    studentsNeedingAttention: number;
    averagePerformance: number;
  };
}

class DashboardOptimizedQueries {
  private static instance: DashboardOptimizedQueries;
  private abortController: AbortController | null = null;

  static getInstance(): DashboardOptimizedQueries {
    if (!DashboardOptimizedQueries.instance) {
      DashboardOptimizedQueries.instance = new DashboardOptimizedQueries();
    }
    return DashboardOptimizedQueries.instance;
  }

  async getDashboardData(teacherId: string): Promise<OptimizedDashboardData> {
    // Cancel any existing request
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();
    
    try {
      // Single optimized query combining students with performance
      const studentsQuery = supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          grade_level,
          parent_email,
          created_at,
          student_performance (
            average_score,
            performance_level,
            needs_attention,
            assessment_count
          )
        `)
        .eq('teacher_id', teacherId)
        .order('last_name');

      // Optimized assessments query with response count
      const assessmentsQuery = supabase
        .from('assessments')
        .select(`
          id,
          title,
          subject,
          assessment_date,
          max_score,
          created_at
        `)
        .eq('teacher_id', teacherId)
        .order('assessment_date', { ascending: false })
        .limit(20);

      // Teacher profile query
      const teacherQuery = supabase
        .from('teacher_profiles')
        .select('full_name, school, subjects, grade_levels')
        .eq('id', teacherId)
        .maybeSingle();

      // Execute queries in parallel
      const [studentsResult, assessmentsResult, teacherResult] = await Promise.all([
        studentsQuery,
        assessmentsQuery,
        teacherQuery
      ]);

      if (studentsResult.error) throw studentsResult.error;
      if (assessmentsResult.error) throw assessmentsResult.error;
      if (teacherResult.error && teacherResult.error.code !== 'PGRST116') throw teacherResult.error;

      const students = studentsResult.data || [];
      const assessments = assessmentsResult.data || [];
      const teacher = teacherResult.data || { full_name: 'Teacher' };

      // Calculate metrics efficiently
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentAssessments = assessments.filter(a => 
        a.assessment_date && new Date(a.assessment_date) >= oneWeekAgo
      ).length;

      const studentsWithPerformance = students.filter(s => 
        s.student_performance && s.student_performance.length > 0
      );

      const studentsNeedingAttention = studentsWithPerformance.filter(s => 
        s.student_performance[0]?.needs_attention
      ).length;

      const averagePerformance = studentsWithPerformance.length > 0
        ? studentsWithPerformance.reduce((sum, s) => 
            sum + (s.student_performance[0]?.average_score || 0), 0
          ) / studentsWithPerformance.length
        : 0;

      return {
        students,
        assessments,
        performance: studentsWithPerformance.map(s => s.student_performance[0]).filter(Boolean),
        teacher,
        metrics: {
          totalStudents: students.length,
          totalAssessments: assessments.length,
          recentAssessments,
          studentsNeedingAttention,
          averagePerformance
        }
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
  }

  cancelCurrentRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export const dashboardOptimizedQueries = DashboardOptimizedQueries.getInstance();
