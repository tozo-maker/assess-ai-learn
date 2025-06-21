
import { supabase } from '@/integrations/supabase/client';

export const dashboardOptimizedQueries = {
  private currentRequest: AbortController | null = null,

  async getDashboardData(teacherId: string) {
    // Cancel any existing request
    this.cancelCurrentRequest();
    
    // Create new abort controller
    this.currentRequest = new AbortController();
    
    try {
      // Note: Since we don't have get_dashboard_data RPC, use fallback approach
      console.warn('Using fallback dashboard data approach');
      return await this.getFallbackDashboardData(teacherId);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Dashboard request was cancelled');
        return null;
      }
      throw error;
    }
  },

  async getFallbackDashboardData(teacherId: string) {
    // Individual optimized queries as fallback
    const [studentsData, assessmentsData, goalsData] = await Promise.all([
      supabase
        .from('students')
        .select(`
          id, first_name, last_name, grade_level,
          student_performance (
            assessment_count, average_score, performance_level, needs_attention
          )
        `)
        .eq('teacher_id', teacherId),
      
      supabase
        .from('assessments')
        .select('id, title, created_at, assessment_date')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
        .limit(5),
      
      supabase
        .from('goals')
        .select(`
          id, title, status, progress_percentage,
          students!inner(first_name, last_name)
        `)
        .eq('students.teacher_id', teacherId)
        .eq('status', 'active')
        .limit(5)
    ]);

    return {
      students: studentsData.data || [],
      assessments: assessmentsData.data || [],
      goals: goalsData.data || [],
      metrics: this.calculateMetrics(studentsData.data || [])
    };
  },

  calculateMetrics(students: any[]) {
    const totalStudents = students.length;
    const studentsNeedingAttention = students.filter(
      s => s.student_performance?.[0]?.needs_attention
    ).length;
    
    const studentsWithScores = students.filter(
      s => s.student_performance?.[0]?.average_score != null
    );
    
    const averagePerformance = studentsWithScores.length > 0
      ? studentsWithScores.reduce((sum, s) => 
          sum + (s.student_performance[0].average_score || 0), 0
        ) / studentsWithScores.length
      : 0;

    return {
      totalStudents,
      studentsNeedingAttention,
      averagePerformance: Math.round(averagePerformance),
      performanceDistribution: {
        excellent: students.filter(s => (s.student_performance?.[0]?.average_score || 0) >= 90).length,
        good: students.filter(s => {
          const score = s.student_performance?.[0]?.average_score || 0;
          return score >= 80 && score < 90;
        }).length,
        satisfactory: students.filter(s => {
          const score = s.student_performance?.[0]?.average_score || 0;
          return score >= 70 && score < 80;
        }).length,
        needsImprovement: students.filter(s => (s.student_performance?.[0]?.average_score || 0) < 70).length
      }
    };
  },

  cancelCurrentRequest() {
    if (this.currentRequest) {
      this.currentRequest.abort();
      this.currentRequest = null;
    }
  }
};
