
import { supabase } from '@/integrations/supabase/client';
import { studentService } from './student-service';
import { assessmentService } from './assessment-service';
import { skillsService } from './skills-service';
import { goalService } from './goal-service';

export interface DashboardData {
  teacher: any;
  students: any[];
  assessments: any[];
  goals: any[];
  notifications: any[];
  metrics: {
    totalStudents: number;
    totalAssessments: number;
    studentsNeedingAttention: number;
    averagePerformance: number;
    recentAssessments: number;
    activeGoalsCount: number;
    completedGoals: number;
    unreadNotifications: number;
    performanceDistribution: {
      excellent: number;
      good: number;
      satisfactory: number;
      needsImprovement: number;
    };
  };
}

export const dataService = {
  async getDashboardData(teacherId: string): Promise<DashboardData> {
    try {
      console.log('Fetching dashboard data for teacher:', teacherId);

      // Fetch all data in parallel
      const [
        studentsResult,
        assessmentsResult,
        goalsResult,
        notificationsResult,
        teacherProfileResult,
        performanceResult
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
          .single(),

        // Performance data
        supabase
          .from('student_performance')
          .select(`
            *,
            students!inner(teacher_id)
          `)
          .eq('students.teacher_id', teacherId)
      ]);

      // Handle errors
      if (studentsResult.error) {
        console.error('Students query error:', studentsResult.error);
        throw studentsResult.error;
      }
      if (assessmentsResult.error) {
        console.error('Assessments query error:', assessmentsResult.error);
        throw assessmentsResult.error;
      }
      if (goalsResult.error) {
        console.error('Goals query error:', goalsResult.error);
        throw goalsResult.error;
      }
      if (notificationsResult.error) {
        console.error('Notifications query error:', notificationsResult.error);
        throw notificationsResult.error;
      }

      const students = studentsResult.data || [];
      const assessments = assessmentsResult.data || [];
      const goals = goalsResult.data || [];
      const notifications = notificationsResult.data || [];
      const teacherProfile = teacherProfileResult.data;
      const performance = performanceResult.data || [];

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

      // Goals metrics
      const completedGoals = goals.filter(g => g.progress_percentage >= 100).length;
      const activeGoalsCount = goals.length;

      // Performance distribution
      const performanceDistribution = {
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
      };

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
          performanceDistribution
        }
      };
    } catch (error) {
      console.error('Data service error:', error);
      throw error;
    }
  },

  async ensureStudentPerformanceRecords(teacherId: string): Promise<void> {
    try {
      // Get all students for this teacher
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('teacher_id', teacherId);

      if (studentsError) throw studentsError;

      // Check which students don't have performance records
      const { data: existingPerformance, error: performanceError } = await supabase
        .from('student_performance')
        .select('student_id')
        .in('student_id', students?.map(s => s.id) || []);

      if (performanceError) throw performanceError;

      const existingStudentIds = new Set(existingPerformance?.map(p => p.student_id) || []);
      const missingStudents = students?.filter(s => !existingStudentIds.has(s.id)) || [];

      // Create performance records for missing students
      if (missingStudents.length > 0) {
        const performanceRecords = missingStudents.map(student => ({
          student_id: student.id,
          assessment_count: 0,
          average_score: null,
          needs_attention: false,
          performance_level: null
        }));

        const { error: insertError } = await supabase
          .from('student_performance')
          .insert(performanceRecords);

        if (insertError) throw insertError;
        
        console.log(`Created performance records for ${missingStudents.length} students`);
      }
    } catch (error) {
      console.error('Error ensuring student performance records:', error);
      // Don't throw - this is a background operation
    }
  }
};
