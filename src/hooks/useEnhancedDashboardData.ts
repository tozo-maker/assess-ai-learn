
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useEnhancedDashboardData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enhanced-dashboard-data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Fetching enhanced dashboard data for user:', user.id);

      // Fetch teacher profile
      const { data: teacherProfile, error: teacherError } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (teacherError && teacherError.code !== 'PGRST116') {
        console.error('Teacher profile fetch error:', teacherError);
        throw teacherError;
      }

      // Fetch students with performance data
      const { data: students, error: studentsError } = await supabase
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
        .eq('teacher_id', user.id)
        .order('last_name', { ascending: true });

      if (studentsError) {
        console.error('Students fetch error:', studentsError);
        throw studentsError;
      }

      // Fetch assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (assessmentsError) {
        console.error('Assessments fetch error:', assessmentsError);
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

      // Students needing attention
      const studentsNeedingAttention = students?.filter(
        s => s.student_performance?.[0]?.needs_attention
      ).length || 0;

      // Average performance across all students
      const studentsWithScores = students?.filter(
        s => s.student_performance?.[0]?.average_score != null
      ) || [];
      
      const averagePerformance = studentsWithScores.length > 0
        ? studentsWithScores.reduce((sum, s) => 
            sum + (s.student_performance?.[0]?.average_score || 0), 0
          ) / studentsWithScores.length
        : 0;

      // High performing students
      const highPerformers = students?.filter(
        s => (s.student_performance?.[0]?.average_score || 0) >= 85
      ).length || 0;

      // Students with recent activity
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const studentsWithRecentActivity = students?.filter(
        s => s.student_performance?.[0]?.last_assessment_date && 
             new Date(s.student_performance[0].last_assessment_date) > sevenDaysAgo
      ).length || 0;

      // Draft assessments
      const draftAssessments = assessments?.filter(a => a.is_draft).length || 0;

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
          excellent: students?.filter(s => (s.student_performance?.[0]?.average_score || 0) >= 90).length || 0,
          good: students?.filter(s => {
            const score = s.student_performance?.[0]?.average_score || 0;
            return score >= 80 && score < 90;
          }).length || 0,
          satisfactory: students?.filter(s => {
            const score = s.student_performance?.[0]?.average_score || 0;
            return score >= 70 && score < 80;
          }).length || 0,
          needsImprovement: students?.filter(s => (s.student_performance?.[0]?.average_score || 0) < 70).length || 0
        }
      };

      console.log('Enhanced dashboard data fetched:', {
        totalStudents,
        totalAssessments,
        enhancedMetrics
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
