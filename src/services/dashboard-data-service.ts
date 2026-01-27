import { supabase } from '@/integrations/supabase/client';
import { enhancedCache } from '@/services/enhanced-caching-service';

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

class DashboardDataService {
  private static instance: DashboardDataService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): DashboardDataService {
    if (!DashboardDataService.instance) {
      DashboardDataService.instance = new DashboardDataService();
    }
    return DashboardDataService.instance;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCached<T>(key: string, data: T, ttl: number = 2 * 60 * 1000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  async getDashboardData(teacherId: string): Promise<{
    students: any[];
    assessments: any[];
    metrics: DashboardMetrics;
    alerts: DashboardAlert[];
    teacher: { name: string; firstName: string };
  }> {
    const cacheKey = `dashboard_${teacherId}`;
    const cached = this.getCached<{
      students: any[];
      assessments: any[];
      metrics: DashboardMetrics;
      alerts: DashboardAlert[];
      teacher: { name: string; firstName: string };
    }>(cacheKey);
    
    if (cached) return cached;

    try {
      // Batch all queries for better performance
      const [studentsResult, assessmentsResult, performanceResult, teacherResult] = await Promise.allSettled([
        this.getStudents(teacherId),
        this.getAssessments(teacherId),
        this.getStudentPerformance(teacherId),
        this.getTeacherProfile(teacherId)
      ]);

      const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
      const assessments = assessmentsResult.status === 'fulfilled' ? assessmentsResult.value : [];
      const performance = performanceResult.status === 'fulfilled' ? performanceResult.value : [];
      const teacher = teacherResult.status === 'fulfilled' ? teacherResult.value : { full_name: 'Teacher' };

      const metrics = this.calculateMetrics(students, assessments, performance);
      const alerts = this.generateAlerts(metrics, students.length);

      const result = {
        students,
        assessments,
        metrics,
        alerts,
        teacher: {
          name: teacher.full_name || 'Teacher',
          firstName: (teacher.full_name || 'Teacher').split(' ')[0]
        }
      };

      this.setCached(cacheKey, result, 2 * 60 * 1000); // 2 minutes cache
      return result;
    } catch (error) {
      console.error('Dashboard data fetch failed:', error);
      throw error;
    }
  }

  private async getStudents(teacherId: string) {
    // Fetch students and performance separately (view has no FK relationship)
    const [studentsResult, performanceResult] = await Promise.all([
      supabase
        .from('students')
        .select('id, first_name, last_name, grade_level, parent_email, created_at')
        .eq('teacher_id', teacherId)
        .order('last_name'),
      supabase
        .from('student_performance')
        .select('student_id, average_score, performance_level, needs_attention')
        .eq('teacher_id', teacherId)
    ]);

    if (studentsResult.error) throw studentsResult.error;

    // Merge performance into students
    return (studentsResult.data || []).map(student => ({
      ...student,
      student_performance: (performanceResult.data || []).filter(p => p.student_id === student.id)
    }));
  }

  private async getAssessments(teacherId: string) {
    const { data, error } = await supabase
      .from('assessments')
      .select('id, title, subject, assessment_date, max_score, created_at')
      .eq('teacher_id', teacherId)
      .order('assessment_date', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  private async getStudentPerformance(teacherId: string) {
    // Query performance view directly (it already has teacher_id column)
    const { data, error } = await supabase
      .from('student_performance')
      .select('*')
      .eq('teacher_id', teacherId);

    if (error) throw error;
    return data || [];
  }

  private async getTeacherProfile(teacherId: string) {
    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('full_name, school, subjects, grade_levels')
      .eq('id', teacherId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || { full_name: 'Teacher' };
  }

  private calculateMetrics(students: any[], assessments: any[], performance: any[]): DashboardMetrics {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate metrics with null safety
    const totalStudents = students.length;
    const totalAssessments = assessments.length;
    
    const recentAssessments = assessments.filter(a => 
      a.assessment_date && new Date(a.assessment_date) >= oneWeekAgo
    ).length;

    const newStudentsThisMonth = students.filter(s => 
      s.created_at && new Date(s.created_at) >= oneMonthAgo
    ).length;

    // Mock AI insights calculation - replace with actual logic
    const aiInsights = Math.floor(totalAssessments * 0.3);
    const todaysInsights = Math.floor(aiInsights * 0.1);

    // Performance calculations
    const validPerformance = performance.filter(p => p.average_score !== null);
    const averageScore = validPerformance.length > 0 
      ? validPerformance.reduce((sum, p) => sum + (p.average_score || 0), 0) / validPerformance.length
      : 0;

    const studentsNeedingAttention = performance.filter(p => p.needs_attention).length;
    const aboveAverageCount = performance.filter(p => 
      p.average_score && p.average_score > averageScore
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

  private generateAlerts(metrics: DashboardMetrics, totalStudents: number): DashboardAlert[] {
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

  invalidateCache(teacherId?: string): void {
    if (teacherId) {
      this.cache.delete(`dashboard_${teacherId}`);
    } else {
      this.cache.clear();
    }
  }
}

export const dashboardDataService = DashboardDataService.getInstance();
