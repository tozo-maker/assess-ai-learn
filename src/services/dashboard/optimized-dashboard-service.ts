
import { supabase } from '@/integrations/supabase/client';

export const optimizedDashboardService = {
  async getDashboardData(teacherId: string) {
    try {
      console.log('Fetching optimized dashboard data for teacher:', teacherId);

      // Parallel fetch all dashboard data
      const [
        studentsResult,
        assessmentsResult,
        goalsResult,
        notificationsResult,
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
              needs_attention,
              last_assessment_date
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

        // Recent notifications
        supabase
          .from('notifications')
          .select('*')
          .eq('teacher_id', teacherId)
          .eq('is_read', false)
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
      if (notificationsResult.error) throw notificationsResult.error;

      const students = studentsResult.data || [];
      const assessments = assessmentsResult.data || [];
      const goals = goalsResult.data || [];
      const notifications = notificationsResult.data || [];
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

      // Goals progress
      const completedGoals = goals.filter(g => g.progress_percentage >= 100).length;
      const activeGoalsCount = goals.length;

      console.log('Dashboard data compiled successfully:', {
        totalStudents,
        totalAssessments,
        studentsNeedingAttention,
        averagePerformance: Math.round(averagePerformance),
        recentAssessments,
        activeGoalsCount,
        completedGoals,
        unreadNotifications: notifications.length
      });

      return {
        teacher: teacherProfile || { 
          full_name: 'Teacher',
          firstName: 'Teacher'
        },
        students,
        assessments,
        goals,
        notifications,
        metrics: {
          totalStudents,
          totalAssessments,
          studentsNeedingAttention,
          averagePerformance: Math.round(averagePerformance),
          recentAssessments,
          activeGoalsCount,
          completedGoals,
          unreadNotifications: notifications.length,
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
      console.error('Optimized dashboard service error:', error);
      throw error;
    }
  }
};
