
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { productionLogger } from '@/services/production-logger';

// Interface matching the actual student_performance view columns
interface StudentPerformanceView {
  assessment_count: number | null;
  average_score: number | null;
  performance_level: string | null;
  needs_attention: boolean | null;
  first_name: string | null;
  last_name: string | null;
  student_id: string | null;
  teacher_id: string | null;
}

export const useEnhancedDashboardData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enhanced-dashboard-data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      productionLogger.info('Fetching enhanced dashboard data', { userId: user.id });

      // Fetch teacher profile
      const { data: teacherProfile, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (teacherError) {
        productionLogger.error('Teacher profile fetch error', teacherError as Error, { userId: user.id });
        throw teacherError;
      }

      // Fetch students and performance separately (view has no FK relationship)
      const [studentsResult, performanceResult] = await Promise.all([
        supabase
          .from('students')
          .select('*')
          .eq('teacher_id', user.id)
          .order('last_name', { ascending: true }),
        supabase
          .from('student_performance')
          .select('*')
          .eq('teacher_id', user.id)
      ]);

      if (studentsResult.error) {
        productionLogger.error('Students fetch error', studentsResult.error as Error, { userId: user.id });
        throw studentsResult.error;
      }

      // Merge performance into students
      const students = (studentsResult.data || []).map(student => ({
        ...student,
        student_performance: (performanceResult.data || []).filter(p => p.student_id === student.id)
      }));

      // Fetch assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (assessmentsError) {
        productionLogger.error('Assessments fetch error', assessmentsError as Error, { userId: user.id });
        throw assessmentsError;
      }

      // Calculate enhanced metrics
      const totalStudents = students?.length || 0;
      const totalAssessments = assessments?.length || 0;
      
      // Recent assessments (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentAssessments = assessments?.filter(
        a => new Date(a.created_at) > thirtyDaysAgo
      ).length || 0;

      // Helper to get performance from student
      const getPerformance = (student: typeof students[0]): StudentPerformanceView | null => {
        const perf = student.student_performance;
        if (Array.isArray(perf) && perf.length > 0) {
          return perf[0] as StudentPerformanceView;
        }
        return null;
      };

      // Students needing attention
      const studentsNeedingAttention = students?.filter(s => {
        const perf = getPerformance(s);
        return perf?.needs_attention;
      }).length || 0;

      // Average performance across all students
      const studentsWithScores = students?.filter(s => {
        const perf = getPerformance(s);
        return perf?.average_score != null;
      }) || [];
      
      const averagePerformance = studentsWithScores.length > 0
        ? studentsWithScores.reduce((sum, s) => {
            const perf = getPerformance(s);
            return sum + (perf?.average_score || 0);
          }, 0) / studentsWithScores.length
        : 0;

      // High performing students
      const highPerformers = students?.filter(s => {
        const perf = getPerformance(s);
        return (perf?.average_score || 0) >= 85;
      }).length || 0;

      // Students with recent activity (based on assessment count since last_assessment_date doesn't exist)
      const studentsWithRecentActivity = students?.filter(s => {
        const perf = getPerformance(s);
        return (perf?.assessment_count || 0) > 0;
      }).length || 0;

      // Draft assessments - field doesn't exist, so default to 0
      const draftAssessments = 0;

      const enhancedMetrics = {
        totalStudents,
        totalAssessments,
        recentAssessments,
        studentsNeedingAttention,
        averagePerformance,
        highPerformers,
        studentsWithRecentActivity,
        draftAssessments,
        performanceDistribution: {
          excellent: students?.filter(s => (getPerformance(s)?.average_score || 0) >= 90).length || 0,
          good: students?.filter(s => {
            const score = getPerformance(s)?.average_score || 0;
            return score >= 80 && score < 90;
          }).length || 0,
          satisfactory: students?.filter(s => {
            const score = getPerformance(s)?.average_score || 0;
            return score >= 70 && score < 80;
          }).length || 0,
          needsImprovement: students?.filter(s => (getPerformance(s)?.average_score || 0) < 70).length || 0
        }
      };

      productionLogger.info('Enhanced dashboard data fetched', {
        totalStudents,
        totalAssessments,
        userId: user.id
      });

      return {
        teacher: teacherProfile || { 
          full_name: user.email?.split('@')[0] || 'Teacher',
          firstName: user.email?.split('@')[0] || 'Teacher'
        },
        students: students || [],
        assessments: assessments || [],
        metrics: enhancedMetrics
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};
