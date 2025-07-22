
import { useMemo, useCallback } from 'react';
import { PerformanceResult } from '@/services/dashboard-performance-service';

interface EnhancedDashboardData {
  alerts: Array<{
    id: string;
    type: 'performance_drop' | 'goal_overdue' | 'missing_assessment';
    severity: 'high' | 'medium' | 'low';
    student_id: string;
    student_name: string;
    title: string;
    description: string;
    created_at: string;
    is_dismissed: boolean;
    action_required: boolean;
  }>;
  activities: Array<{
    id: string;
    type: 'assessment' | 'goal' | 'communication';
    title: string;
    description: string;
    timestamp: Date;
    student?: {
      id: string;
      name: string;
    };
  }>;
  heatmapData: Array<{
    studentId: string;
    studentName: string;
    skills: Record<string, {
      score: number;
      assessmentCount: number;
      lastAssessed: Date;
      trend: 'up' | 'down' | 'stable';
    }>;
  }>;
  recentStudents: Array<{
    id: string;
    name: string;
  }>;
  metrics: {
    totalStudents: number;
    totalAssessments: number;
    aiInsights: number;
    recentAssessments: number;
    averagePerformance: string;
    studentsNeedingAttention: number;
    newStudentsThisMonth: number;
    todaysInsights: number;
  };
}

export const useEnhancedDashboard = (data: PerformanceResult<any>): EnhancedDashboardData => {
  // Mock data generators for new components (replace with real data in production)
  const generateMockAlerts = useCallback(() => {
    const students = data?.students || [];
    const alertTypes = ['performance_drop', 'goal_overdue', 'missing_assessment'] as const;
    const severityLevels = ['high', 'medium', 'low'] as const;
    
    return students.slice(0, 3).map((student: any, index: number) => ({
      id: `alert-${index}`,
      type: alertTypes[index % 3],
      severity: severityLevels[index % 3],
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      title: `Alert for ${student.first_name}`,
      description: `Requires attention in recent performance`,
      created_at: new Date().toISOString(),
      is_dismissed: false,
      action_required: true
    }));
  }, [data]);

  const generateMockActivities = useCallback(() => {
    const assessments = data?.assessments || [];
    const activityTypes = ['assessment', 'goal', 'communication'] as const;
    
    return assessments.slice(0, 5).map((assessment: any, index: number) => ({
      id: `activity-${index}`,
      type: activityTypes[index % 3],
      title: assessment.title || `Activity ${index + 1}`,
      description: `Recent activity for ${assessment.subject}`,
      timestamp: new Date(assessment.created_at || Date.now()),
      student: assessment.student ? {
        id: assessment.student.id,
        name: `${assessment.student.first_name} ${assessment.student.last_name}`
      } : undefined
    }));
  }, [data]);

  const generateMockHeatmapData = useCallback(() => {
    const students = data?.students || [];
    const skills = ['Math', 'Reading', 'Science', 'Writing'];
    
    return students.slice(0, 10).map((student: any) => ({
      studentId: student.id,
      studentName: `${student.first_name} ${student.last_name}`,
      skills: skills.reduce((acc, skill) => ({
        ...acc,
        [skill]: {
          score: Math.floor(Math.random() * 40) + 60, // 60-100 range
          assessmentCount: Math.floor(Math.random() * 5) + 1,
          lastAssessed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
        }
      }), {})
    }));
  }, [data]);

  const generateRecentStudents = useCallback(() => {
    const students = data?.students || [];
    return students.slice(0, 5).map((student: any) => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`
    }));
  }, [data]);

  return useMemo(() => {
    const dashboardData = data?.data || data;
    const baseMetrics = dashboardData?.metrics || {};

    return {
      alerts: generateMockAlerts(),
      activities: generateMockActivities(),
      heatmapData: generateMockHeatmapData(),
      recentStudents: generateRecentStudents(),
      metrics: {
        totalStudents: baseMetrics.totalStudents || 0,
        totalAssessments: baseMetrics.totalAssessments || 0,
        aiInsights: baseMetrics.aiInsights || 0,
        recentAssessments: baseMetrics.recentAssessments || 0,
        averagePerformance: baseMetrics.averagePerformance || '85',
        studentsNeedingAttention: baseMetrics.studentsNeedingAttention || 0,
        newStudentsThisMonth: baseMetrics.newStudentsThisMonth || 0,
        todaysInsights: baseMetrics.todaysInsights || 0
      }
    };
  }, [data, generateMockAlerts, generateMockActivities, generateMockHeatmapData, generateRecentStudents]);
};
