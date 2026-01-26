import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/services/production-logger';

export const optimizedDashboardService = {
  async getDashboardData(teacherId: string) {
    try {
      productionLogger.info('Fetching optimized dashboard data', { teacherId });

      // Parallel fetch all dashboard data (excluding notifications since table doesn't exist)
      const [
        studentsResult,
        assessmentsResult,
        goalsResult,
        teacherProfileResult
      ] = await Promise.all([
        // Students with performance data
        supabase
          .from('students')
          .select(`
            *,
            student_performance (
              assessment_count,
              average_score,
              performance_level,
              needs_attention
            )
          `)
          .eq('teacher_id', teacherId)
          .order('last_name', { ascending: true }),

        // Recent assessments
        supabase
          .from('assessments')
          .select('*')
          .eq('teacher_id', teacherId)
          .order('created_at', { ascending: false })
          .limit(10),

        // Active goals
        supabase
          .from('goals')
          .select(`
            *,
            students!inner (
              id,
              first_name,
              last_name,
              grade_level
            )
          `)
          .eq('students.teacher_id', teacherId)
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
      if (studentsResult.error) throw studentsResult.error;
      if (assessmentsResult.error) throw assessmentsResult.error;
      if (goalsResult.error) throw goalsResult.error;

      const students = studentsResult.data || [];
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

      // Average performance
      const studentsWithScores = students.filter(
        s => s.student_performance?.[0]?.average_score != null
      );
      
      const averagePerformance = studentsWithScores.length > 0
        ? studentsWithScores.reduce((sum, s) => 
            sum + (s.student_performance[0].average_score || 0), 0
          ) / studentsWithScores.length
        : 0;

      // Recent activity count
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAssessments = assessments.filter(
        a => new Date(a.created_at) > thirtyDaysAgo
      ).length;

      // Goals progress - use 'progress' not 'progress_percentage'
      const completedGoals = goals.filter(g => (g.progress || 0) >= 100).length;
      const activeGoalsCount = goals.length;

      productionLogger.info('Dashboard data compiled successfully', {
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
          full_name: 'Teacher',
          firstName: 'Teacher'
        },
        students,
        assessments,
        goals,
        notifications: [], // No notifications table
        metrics: {
          totalStudents,
          totalAssessments,
          studentsNeedingAttention,
          averagePerformance: Math.round(averagePerformance),
          recentAssessments,
          activeGoalsCount,
          completedGoals,
          unreadNotifications: 0,
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
        }
      };
    } catch (error) {
      productionLogger.error('Optimized dashboard service error', error as Error, { teacherId });
      throw error;
    }
  }
};
