
interface DashboardMetrics {
  totalStudents: number;
  totalAssessments: number;
  aiInsights: number;
  recentAssessments: number;
  newStudentsThisMonth: number;
  todaysInsights: number;
  studentsNeedingAttention: number;
  averagePerformance: string;
  aboveAverageCount: number;
}

interface DashboardAlert {
  id: string;
  type: 'performance' | 'attendance' | 'system';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  actionUrl: string;
  studentCount?: number;
}

class DashboardMetricsCalculator {
  private static instance: DashboardMetricsCalculator;

  static getInstance(): DashboardMetricsCalculator {
    if (!DashboardMetricsCalculator.instance) {
      DashboardMetricsCalculator.instance = new DashboardMetricsCalculator();
    }
    return DashboardMetricsCalculator.instance;
  }

  calculateMetrics(students: any[], assessments: any[], performance: any[]): DashboardMetrics {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Safe calculations with null checks
    const totalStudents = students?.length || 0;
    const totalAssessments = assessments?.length || 0;
    
    const recentAssessments = assessments?.filter(a => 
      a?.assessment_date && new Date(a.assessment_date) >= oneWeekAgo
    )?.length || 0;

    const newStudentsThisMonth = students?.filter(s => 
      s?.created_at && new Date(s.created_at) >= oneMonthAgo
    )?.length || 0;

    // Mock AI insights calculation - replace with actual logic
    const aiInsights = Math.floor(totalAssessments * 0.3);
    const todaysInsights = Math.floor(aiInsights * 0.1);

    // Performance calculations with proper null handling
    const validPerformance = performance?.filter(p => 
      p && typeof p.average_score === 'number' && !isNaN(p.average_score)
    ) || [];
    
    const averageScore = validPerformance.length > 0 
      ? validPerformance.reduce((sum, p) => sum + p.average_score, 0) / validPerformance.length
      : 0;

    const studentsNeedingAttention = performance?.filter(p => p?.needs_attention)?.length || 0;
    const aboveAverageCount = validPerformance.filter(p => 
      p.average_score > averageScore
    ).length;

    return {
      totalStudents,
      totalAssessments,
      aiInsights,
      recentAssessments,
      newStudentsThisMonth,
      todaysInsights,
      studentsNeedingAttention,
      averagePerformance: averageScore > 0 ? `${Math.round(averageScore)}%` : 'No data',
      aboveAverageCount
    };
  }

  generateAlerts(metrics: DashboardMetrics, totalStudents: number): DashboardAlert[] {
    const alerts: DashboardAlert[] = [];

    if (metrics.studentsNeedingAttention > 0) {
      alerts.push({
        id: 'performance-alert',
        type: 'performance',
        title: 'Students Need Attention',
        description: `${metrics.studentsNeedingAttention} students showing declining performance`,
        severity: metrics.studentsNeedingAttention > totalStudents * 0.3 ? 'high' : 'medium',
        actionUrl: '/app/students?filter=needs-attention',
        studentCount: metrics.studentsNeedingAttention
      });
    }

    if (metrics.totalAssessments === 0 && totalStudents > 0) {
      alerts.push({
        id: 'no-assessments',
        type: 'system',
        title: 'No Assessments Created',
        description: 'Start tracking student progress by creating your first assessment',
        severity: 'medium',
        actionUrl: '/app/assessments/add',
        studentCount: totalStudents
      });
    }

    return alerts;
  }
}

export const dashboardMetricsCalculator = DashboardMetricsCalculator.getInstance();
export type { DashboardMetrics, DashboardAlert };
