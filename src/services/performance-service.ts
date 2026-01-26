// student_performance is a VIEW, not a table
// Cannot insert/update/upsert into views
// This service provides read-only access and logging for attempted writes

import { supabase } from '@/integrations/supabase/client';

export interface StudentPerformance {
  student_id: string | null;
  first_name: string | null;
  last_name: string | null;
  teacher_id: string | null;
  assessment_count: number | null;
  average_score: number | null;
  performance_level: string | null;
  needs_attention: boolean | null;
}

export const performanceService = {
  // Get performance data for a student
  async getStudentPerformance(studentId: string): Promise<StudentPerformance | null> {
    const { data, error } = await supabase
      .from('student_performance')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No performance record found
      }
      throw error;
    }

    return data as StudentPerformance;
  },

  // Get all performance data for a teacher's students
  async getTeacherStudentsPerformance(teacherId: string): Promise<StudentPerformance[]> {
    const { data, error } = await supabase
      .from('student_performance')
      .select('*')
      .eq('teacher_id', teacherId);

    if (error) throw error;
    return (data || []) as StudentPerformance[];
  },

  // Get students needing attention
  async getStudentsNeedingAttention(teacherId: string): Promise<StudentPerformance[]> {
    const { data, error } = await supabase
      .from('student_performance')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('needs_attention', true);

    if (error) throw error;
    return (data || []) as StudentPerformance[];
  },

  // Calculate and log performance (view is auto-calculated from student_responses)
  async calculateStudentPerformance(studentId: string): Promise<void> {
    console.log('Performance calculation requested for student:', studentId);
    console.log('Note: student_performance is a VIEW that auto-calculates from student_responses');
    
    // Performance is automatically calculated by the view
    // Just verify the student exists and has responses
    const { data: responses, error } = await supabase
      .from('student_responses')
      .select('id, score')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error checking student responses:', error);
      return;
    }

    console.log(`Student ${studentId} has ${responses?.length || 0} responses - view will auto-calculate performance`);
  },

  // Recalculate all student performances (no-op, view handles this)
  async recalculateAllPerformances(): Promise<void> {
    console.log('Performance recalculation requested');
    console.log('Note: student_performance is a VIEW that auto-calculates - no manual recalculation needed');
  },

  // Get performance distribution for a teacher
  async getPerformanceDistribution(teacherId: string): Promise<{
    advanced: number;
    proficient: number;
    developing: number;
    beginning: number;
  }> {
    const { data, error } = await supabase
      .from('student_performance')
      .select('performance_level')
      .eq('teacher_id', teacherId);

    if (error) throw error;

    const distribution = {
      advanced: 0,
      proficient: 0,
      developing: 0,
      beginning: 0
    };

    (data || []).forEach(student => {
      const level = student.performance_level?.toLowerCase();
      if (level === 'advanced') distribution.advanced++;
      else if (level === 'proficient') distribution.proficient++;
      else if (level === 'developing') distribution.developing++;
      else if (level === 'beginning') distribution.beginning++;
    });

    return distribution;
  }
};
