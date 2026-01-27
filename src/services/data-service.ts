import { supabase } from '@/integrations/supabase/client';
import { DashboardData } from '@/types/comprehensive';

export const dataService = {
  async getDashboardData(teacherId: string): Promise<DashboardData> {
    try {
      console.log('Fetching dashboard data for teacher:', teacherId);

      // Fetch all data in parallel (excluding notifications since table doesn't exist)
      // Note: students and performance fetched separately (view has no FK relationship)
      const [
        studentsResult,
        performanceResult,
        assessmentsResult,
        goalsResult,
        teacherProfileResult
      ] = await Promise.all([
        // Students data
        supabase
          .from('students')
          .select('*')
          .eq('teacher_id', teacherId)
          .order('last_name', { ascending: true }),

        // Performance data from view
        supabase
          .from('student_performance')
          .select('*')
          .eq('teacher_id', teacherId),

        // Recent assessments
        supabase
          .from('assessments')
          .select('*')
          .eq('teacher_id', teacherId)
          .order('created_at', { ascending: false })
          .limit(10),

        // Active goals (query directly, goals has teacher_id)
        supabase
          .from('goals')
          .select('*')
          .eq('teacher_id', teacherId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(5),

        // Teacher profile
        supabase
          .from('teacher_profiles')
          .select('*')
          .eq('id', teacherId)
          .single()
      ]);

      // Handle errors
      if (studentsResult.error) {
        console.error('Students query error:', studentsResult.error);
        throw studentsResult.error;
      }
      if (performanceResult.error) {
        console.error('Performance query error:', performanceResult.error);
        throw performanceResult.error;
      }
      if (assessmentsResult.error) {
        console.error('Assessments query error:', assessmentsResult.error);
        throw assessmentsResult.error;
      }
      if (goalsResult.error) {
        console.error('Goals query error:', goalsResult.error);
        throw goalsResult.error;
      }

      // Merge performance into students
      const rawStudents = studentsResult.data || [];
      const performanceData = performanceResult.data || [];
      const students = rawStudents.map(student => ({
        ...student,
        student_performance: performanceData.filter(p => p.student_id === student.id)
      }));
      const assessments = assessmentsResult.data || [];
      const goals = goalsResult.data || [];
      const teacherProfile = teacherProfileResult.data;

      // Calculate metrics
      const totalStudents = students.length;
      const totalAssessments = assessments.length;
      
      // Students needing attention
      const studentsNeedingAttention = students.filter(
        s => s.student_performance?.[0]?.needs_attention
      ).length;

      // Average performance calculation
      const studentsWithScores = students.filter(
        s => s.student_performance?.[0]?.average_score != null
      );
      
      const averagePerformance = studentsWithScores.length > 0
        ? studentsWithScores.reduce((sum, s) => 
            sum + (s.student_performance[0].average_score || 0), 0
          ) / studentsWithScores.length
        : 0;

      // Recent activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAssessments = assessments.filter(
        a => new Date(a.created_at) > thirtyDaysAgo
      ).length;

      // Goals metrics - use 'progress' not 'progress_percentage'
      const completedGoals = goals.filter(g => (g.progress || 0) >= 100).length;
      const activeGoalsCount = goals.length;

      console.log('Dashboard data compiled successfully:', {
        totalStudents,
        totalAssessments,
        studentsNeedingAttention,
        averagePerformance: Math.round(averagePerformance),
        recentAssessments,
        activeGoalsCount,
        completedGoals,
        unreadNotifications: 0
      });

      return {
        teacher: teacherProfile || { 
          id: teacherId,
          full_name: 'Teacher',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        students,
        assessments,
        recentCommunications: [],
        summary: {
          totalStudents,
          totalAssessments,
          averageScore: Math.round(averagePerformance),
          studentsNeedingAttention,
          recentActivity: []
        }
      };
    } catch (error) {
      console.error('Data service error:', error);
      throw error;
    }
  },

  async ensureStudentPerformanceRecords(teacherId: string): Promise<void> {
    // student_performance is a VIEW, not a table - no need to create records
    console.log('student_performance is a view, no records to create');
  }
};
