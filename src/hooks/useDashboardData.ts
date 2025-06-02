
import { useMemo } from 'react';
import { 
  useStudents, 
  useAssessments, 
  useCommunications, 
  useTeacherProfile, 
  useStudentMetrics 
} from '@/hooks/queries/useOptimizedQueries';

export const useDashboardData = () => {
  const {
    data: students = [],
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents
  } = useStudents();

  const {
    data: assessments = [],
    isLoading: assessmentsLoading,
    error: assessmentsError,
    refetch: refetchAssessments
  } = useAssessments();

  const {
    data: communications = [],
    isLoading: communicationsLoading,
    error: communicationsError,
    refetch: refetchCommunications
  } = useCommunications();

  const { data: teacherProfile } = useTeacherProfile();
  const { data: studentMetrics } = useStudentMetrics();

  // Calculate derived data
  const processedData = useMemo(() => {
    const totalStudents = students?.length || 0;
    const totalAssessments = assessments?.length || 0;
    const aiInsights = communications?.filter(c => c.communication_type === 'ai_insight')?.length || 0;
    
    // Calculate recent assessments (this week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentAssessments = assessments?.filter(a => 
      new Date(a.created_at) >= oneWeekAgo
    )?.length || 0;

    // Calculate new students this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const newStudentsThisMonth = students?.filter(s => 
      new Date(s.created_at) >= oneMonthAgo
    )?.length || 0;

    // Calculate today's insights
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todaysInsights = communications?.filter(c => 
      c.communication_type === 'ai_insight' && new Date(c.created_at) >= startOfDay
    )?.length || 0;

    // Generate alerts based on real data
    const alerts = [
      ...(studentMetrics?.studentsNeedingAttention && studentMetrics.studentsNeedingAttention > 0 ? [{
        id: '1',
        type: 'performance' as const,
        title: 'Students need attention',
        description: `${studentMetrics.studentsNeedingAttention} students requiring additional support`,
        studentCount: studentMetrics.studentsNeedingAttention,
        severity: 'high' as const,
        actionUrl: '/app/students'
      }] : []),
      ...(totalAssessments === 0 ? [{
        id: '2',
        type: 'performance' as const,
        title: 'No assessments yet',
        description: 'Start by creating your first assessment to track student progress',
        studentCount: totalStudents,
        severity: 'medium' as const,
        actionUrl: '/app/assessments/add'
      }] : [])
    ];

    const teacherName = teacherProfile?.full_name || "Teacher";

    return {
      teacher: {
        name: teacherName,
        firstName: teacherName.split(' ')[0]
      },
      metrics: {
        totalStudents,
        totalAssessments,
        aiInsights,
        recentAssessments,
        newStudentsThisMonth,
        todaysInsights,
        averagePerformance: studentMetrics?.averagePerformance || "N/A",
        studentsNeedingAttention: studentMetrics?.studentsNeedingAttention || 0,
        studentMetrics: {
          averagePerformance: studentMetrics?.averagePerformance || "N/A"
        }
      },
      alerts,
      students,
      assessments,
      communications
    };
  }, [students, assessments, communications, teacherProfile, studentMetrics]);

  // Loading and error states
  const isLoading = studentsLoading || assessmentsLoading || communicationsLoading;
  const hasError = studentsError || assessmentsError || communicationsError;
  
  const handleRetry = () => {
    if (studentsError) refetchStudents();
    if (assessmentsError) refetchAssessments();
    if (communicationsError) refetchCommunications();
  };

  return {
    ...processedData,
    isLoading,
    hasError,
    error: studentsError || assessmentsError || communicationsError,
    handleRetry
  };
};
