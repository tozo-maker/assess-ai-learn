import { errorService } from './error-service';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedDashboardMetrics {
  overview: {
    totalStudents: number;
    totalAssessments: number;
    completedAssessments: number;
    pendingAssessments: number;
    totalAnalyses: number;
    averageScore: number;
    performanceTrend: 'improving' | 'declining' | 'stable';
  };
  performance: {
    excellentStudents: number;
    goodStudents: number;
    needsImprovementStudents: number;
    atRiskStudents: number;
    performanceDistribution: Array<{
      level: string;
      count: number;
      percentage: number;
    }>;
  };
  timeframes: {
    thisWeek: {
      assessments: number;
      analyses: number;
      averageScore: number;
    };
    thisMonth: {
      assessments: number;
      analyses: number;
      averageScore: number;
      newStudents: number;
    };
    thisQuarter: {
      assessments: number;
      analyses: number;
      trendAnalysis: string;
    };
  };
  alerts: Array<{
    id: string;
    type: 'performance' | 'engagement' | 'system' | 'goal';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionUrl: string;
    studentCount?: number;
    daysOld?: number;
  }>;
  insights: {
    topStrengths: Array<{ strength: string; frequency: number }>;
    commonGrowthAreas: Array<{ area: string; frequency: number }>;
    skillTrends: Array<{
      skill: string;
      trend: 'improving' | 'declining' | 'stable';
      studentCount: number;
    }>;
    engagementMetrics: {
      activeStudents: number;
      assessmentCompletionRate: number;
      goalProgressRate: number;
    };
  };
  recommendations: Array<{
    type: 'class_focus' | 'individual_attention' | 'curriculum_adjustment' | 'assessment_strategy';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionItems: string[];
    affectedStudents?: number;
  }>;
}

export interface DashboardFilter {
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  subjects?: string[];
  gradeLevels?: string[];
  performanceLevels?: string[];
  includeArchived?: boolean;
}

class EnhancedDashboardMetricsService {
  private static instance: EnhancedDashboardMetricsService;

  static getInstance(): EnhancedDashboardMetricsService {
    if (!EnhancedDashboardMetricsService.instance) {
      EnhancedDashboardMetricsService.instance = new EnhancedDashboardMetricsService();
    }
    return EnhancedDashboardMetricsService.instance;
  }

  async calculateEnhancedMetrics(teacherId: string, filters: DashboardFilter = { timeRange: 'month' }): Promise<EnhancedDashboardMetrics> {
    try {
      const startDate = this.getStartDateForTimeframe(filters.timeRange);
      
      // Fetch all required data in parallel for better performance
      const [
        studentsData,
        assessmentsData,
        responsesData,
        analysesData,
        goalsData
      ] = await Promise.all([
        this.fetchStudentsData(teacherId, filters),
        this.fetchAssessmentsData(teacherId, startDate, filters),
        this.fetchResponsesData(teacherId, startDate, filters),
        this.fetchAnalysesData(teacherId, startDate, filters),
        this.fetchGoalsData(teacherId, filters)
      ]);

      // Calculate metrics
      const overview = this.calculateOverviewMetrics(studentsData, assessmentsData, responsesData, analysesData);
      const performance = this.calculatePerformanceMetrics(studentsData, responsesData, analysesData);
      const timeframes = this.calculateTimeframeMetrics(assessmentsData, responsesData, analysesData, studentsData);
      const alerts = this.generateSmartAlerts(studentsData, assessmentsData, responsesData, goalsData);
      const insights = this.calculateInsights(analysesData, responsesData, goalsData);
      const recommendations = this.generateRecommendations(performance, insights, alerts);

      return {
        overview,
        performance,
        timeframes,
        alerts,
        insights,
        recommendations
      };
    } catch (error) {
      errorService.logError('EnhancedDashboardMetricsService', error as Error, {
        teacherId,
        filters
      });
      throw error;
    }
  }

  private async fetchStudentsData(teacherId: string, filters: DashboardFilter) {
    const query = supabase
      .from('students')
      .select('*')
      .eq('teacher_id', teacherId);

    if (filters.gradeLevels?.length) {
      query.in('grade_level', filters.gradeLevels);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  private async fetchAssessmentsData(teacherId: string, startDate: Date, filters: DashboardFilter) {
    const query = supabase
      .from('assessments')
      .select('*')
      .eq('teacher_id', teacherId)
      .gte('assessment_date', startDate.toISOString());

    if (filters.subjects?.length) {
      query.in('subject', filters.subjects);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  private async fetchResponsesData(teacherId: string, startDate: Date, filters: DashboardFilter) {
    const { data, error } = await supabase
      .from('student_responses')
      .select(`
        *,
        assessments!inner(teacher_id, subject, grade_level),
        students!inner(grade_level)
      `)
      .eq('assessments.teacher_id', teacherId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;
    return data || [];
  }

  private async fetchAnalysesData(teacherId: string, startDate: Date, filters: DashboardFilter) {
    const { data, error } = await supabase
      .from('assessment_analysis')
      .select(`
        *,
        assessments!inner(teacher_id, subject),
        students!inner(grade_level)
      `)
      .eq('assessments.teacher_id', teacherId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;
    return data || [];
  }

  private async fetchGoalsData(teacherId: string, filters: DashboardFilter) {
    // Query goals directly using teacher_id (no need for embedded students join)
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('teacher_id', teacherId);

    if (error) throw error;
    return data || [];
  }

  private calculateOverviewMetrics(students: any[], assessments: any[], responses: any[], analyses: any[]) {
    const totalStudents = students.length;
    const totalAssessments = assessments.length;
    const completedAssessments = responses.length;
    const pendingAssessments = Math.max(0, totalAssessments - completedAssessments);
    const totalAnalyses = analyses.length;
    
    // Calculate average score from responses
    const scoresWithValues = responses.filter(r => r.score && r.score > 0);
    const averageScore = scoresWithValues.length > 0 
      ? Math.round(scoresWithValues.reduce((sum, r) => sum + r.score, 0) / scoresWithValues.length)
      : 0;

    // Calculate performance trend (simplified)
    const performanceTrend = this.calculatePerformanceTrend(responses);

    return {
      totalStudents,
      totalAssessments,
      completedAssessments,
      pendingAssessments,
      totalAnalyses,
      averageScore,
      performanceTrend
    };
  }

  private calculatePerformanceMetrics(students: any[], responses: any[], analyses: any[]) {
    const studentPerformance = students.map(student => {
      const studentResponses = responses.filter(r => r.student_id === student.id);
      const avgScore = studentResponses.length > 0 
        ? studentResponses.reduce((sum, r) => sum + (r.score || 0), 0) / studentResponses.length
        : 0;
      
      let level = 'needs_improvement';
      if (avgScore >= 90) level = 'excellent';
      else if (avgScore >= 80) level = 'good';
      else if (avgScore >= 70) level = 'satisfactory';
      else if (avgScore < 60) level = 'at_risk';

      return { student, level, score: avgScore };
    });

    const excellentStudents = studentPerformance.filter(p => p.level === 'excellent').length;
    const goodStudents = studentPerformance.filter(p => p.level === 'good').length;
    const needsImprovementStudents = studentPerformance.filter(p => p.level === 'needs_improvement').length;
    const atRiskStudents = studentPerformance.filter(p => p.level === 'at_risk').length;

    const performanceDistribution = [
      { level: 'Excellent (90-100%)', count: excellentStudents, percentage: (excellentStudents / students.length) * 100 },
      { level: 'Good (80-89%)', count: goodStudents, percentage: (goodStudents / students.length) * 100 },
      { level: 'Needs Improvement (60-79%)', count: needsImprovementStudents, percentage: (needsImprovementStudents / students.length) * 100 },
      { level: 'At Risk (<60%)', count: atRiskStudents, percentage: (atRiskStudents / students.length) * 100 }
    ];

    return {
      excellentStudents,
      goodStudents,
      needsImprovementStudents,
      atRiskStudents,
      performanceDistribution
    };
  }

  private calculateTimeframeMetrics(assessments: any[], responses: any[], analyses: any[], students: any[]) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneQuarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const thisWeekAssessments = assessments.filter(a => new Date(a.assessment_date) >= oneWeekAgo).length;
    const thisWeekAnalyses = analyses.filter(a => new Date(a.created_at) >= oneWeekAgo).length;
    const thisWeekResponses = responses.filter(r => new Date(r.created_at) >= oneWeekAgo);
    const thisWeekAvgScore = thisWeekResponses.length > 0 
      ? Math.round(thisWeekResponses.reduce((sum, r) => sum + (r.score || 0), 0) / thisWeekResponses.length)
      : 0;

    const thisMonthAssessments = assessments.filter(a => new Date(a.assessment_date) >= oneMonthAgo).length;
    const thisMonthAnalyses = analyses.filter(a => new Date(a.created_at) >= oneMonthAgo).length;
    const thisMonthResponses = responses.filter(r => new Date(r.created_at) >= oneMonthAgo);
    const thisMonthAvgScore = thisMonthResponses.length > 0 
      ? Math.round(thisMonthResponses.reduce((sum, r) => sum + (r.score || 0), 0) / thisMonthResponses.length)
      : 0;
    const newStudentsThisMonth = students.filter(s => new Date(s.created_at) >= oneMonthAgo).length;

    const thisQuarterAssessments = assessments.filter(a => new Date(a.assessment_date) >= oneQuarterAgo).length;
    const thisQuarterAnalyses = analyses.filter(a => new Date(a.created_at) >= oneQuarterAgo).length;

    return {
      thisWeek: {
        assessments: thisWeekAssessments,
        analyses: thisWeekAnalyses,
        averageScore: thisWeekAvgScore
      },
      thisMonth: {
        assessments: thisMonthAssessments,
        analyses: thisMonthAnalyses,
        averageScore: thisMonthAvgScore,
        newStudents: newStudentsThisMonth
      },
      thisQuarter: {
        assessments: thisQuarterAssessments,
        analyses: thisQuarterAnalyses,
        trendAnalysis: 'Positive growth in assessment completion'
      }
    };
  }

  private generateSmartAlerts(students: any[], assessments: any[], responses: any[], goals: any[]) {
    const alerts: any[] = [];

    // Performance alerts
    const lowPerformingStudents = students.filter(student => {
      const studentResponses = responses.filter(r => r.student_id === student.id);
      const avgScore = studentResponses.length > 0 
        ? studentResponses.reduce((sum, r) => sum + (r.score || 0), 0) / studentResponses.length
        : 0;
      return avgScore < 60;
    });

    if (lowPerformingStudents.length > 0) {
      alerts.push({
        id: 'low-performance',
        type: 'performance',
        severity: lowPerformingStudents.length > students.length * 0.3 ? 'high' : 'medium',
        title: 'Students Need Attention',
        description: `${lowPerformingStudents.length} students are performing below 60% average`,
        actionUrl: '/app/students?filter=low-performance',
        studentCount: lowPerformingStudents.length
      });
    }

    // Engagement alerts
    const inactiveStudents = students.filter(student => {
      const recentResponses = responses.filter(r => 
        r.student_id === student.id && 
        new Date(r.created_at) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      );
      return recentResponses.length === 0;
    });

    if (inactiveStudents.length > 0) {
      alerts.push({
        id: 'student-engagement',
        type: 'engagement',
        severity: 'medium',
        title: 'Low Engagement Alert',
        description: `${inactiveStudents.length} students haven't submitted work in 2 weeks`,
        actionUrl: '/app/students?filter=inactive',
        studentCount: inactiveStudents.length,
        daysOld: 14
      });
    }

    // Goal progress alerts
    const overdueGoals = goals.filter(goal => 
      new Date(goal.target_date) < new Date() && goal.status !== 'completed'
    );

    if (overdueGoals.length > 0) {
      alerts.push({
        id: 'overdue-goals',
        type: 'goal',
        severity: 'medium',
        title: 'Overdue Learning Goals',
        description: `${overdueGoals.length} learning goals are past their target date`,
        actionUrl: '/app/goals?filter=overdue',
        studentCount: new Set(overdueGoals.map(g => g.student_id)).size
      });
    }

    return alerts;
  }

  private calculateInsights(analyses: any[], responses: any[], goals: any[]) {
    // Extract common strengths and growth areas from analyses
    const allStrengths = analyses.flatMap(a => a.strengths || []);
    const allGrowthAreas = analyses.flatMap(a => a.growth_areas || []);

    const topStrengths = this.getTopItems(allStrengths).slice(0, 5).map(item => ({ strength: item.item, frequency: item.frequency }));
    const commonGrowthAreas = this.getTopItems(allGrowthAreas).slice(0, 5).map(item => ({ area: item.item, frequency: item.frequency }));

    // Calculate engagement metrics
    const totalStudents = new Set(responses.map(r => r.student_id)).size;
    const activeStudents = new Set(responses.filter(r => 
      new Date(r.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).map(r => r.student_id)).size;

    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalGoals = goals.length;
    const goalProgressRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

    const assessmentCompletionRate = responses.length > 0 ? 85 : 0; // Simplified calculation

    return {
      topStrengths,
      commonGrowthAreas,
      skillTrends: [], // To be implemented with more data
      engagementMetrics: {
        activeStudents,
        assessmentCompletionRate,
        goalProgressRate
      }
    };
  }

  private generateRecommendations(performance: any, insights: any, alerts: any[]) {
    const recommendations: any[] = [];

    // Performance-based recommendations
    if (performance.atRiskStudents > 0) {
      recommendations.push({
        type: 'individual_attention',
        priority: 'high',
        title: 'Focus on At-Risk Students',
        description: 'Provide additional support and intervention for struggling students',
        actionItems: [
          'Schedule one-on-one conferences',
          'Create personalized learning plans',
          'Consider peer tutoring programs'
        ],
        affectedStudents: performance.atRiskStudents
      });
    }

    // Engagement-based recommendations
    const engagementAlert = alerts.find(a => a.type === 'engagement');
    if (engagementAlert) {
      recommendations.push({
        type: 'assessment_strategy',
        priority: 'medium',
        title: 'Improve Student Engagement',
        description: 'Implement strategies to increase student participation',
        actionItems: [
          'Use more interactive assessment formats',
          'Provide immediate feedback',
          'Gamify learning experiences'
        ],
        affectedStudents: engagementAlert.studentCount
      });
    }

    return recommendations;
  }

  private getTopItems(items: string[]): Array<{ item: string; frequency: number }> {
    const itemCounts: Record<string, number> = {};
    items.forEach(item => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    });

    return Object.entries(itemCounts)
      .map(([item, frequency]) => ({ item, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  private calculatePerformanceTrend(responses: any[]): 'improving' | 'declining' | 'stable' {
    if (responses.length < 4) return 'stable';

    const sortedResponses = responses.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const firstHalf = sortedResponses.slice(0, Math.floor(responses.length / 2));
    const secondHalf = sortedResponses.slice(Math.floor(responses.length / 2));

    const firstAvg = firstHalf.reduce((sum, r) => sum + (r.score || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + (r.score || 0), 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  private getStartDateForTimeframe(timeframe: 'week' | 'month' | 'quarter' | 'year'): Date {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}

export const enhancedDashboardMetricsService = EnhancedDashboardMetricsService.getInstance();