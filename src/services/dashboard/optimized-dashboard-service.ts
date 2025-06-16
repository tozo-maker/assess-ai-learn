
import { dashboardQueryService } from './dashboard-query-service';
import { dashboardMetricsCalculator, DashboardMetrics, DashboardAlert } from './dashboard-metrics-calculator';

interface DashboardData {
  students: any[];
  assessments: any[];
  metrics: DashboardMetrics;
  alerts: DashboardAlert[];
  teacher: { name: string; firstName: string };
}

class OptimizedDashboardService {
  private static instance: OptimizedDashboardService;
  private activeRequests = new Map<string, Promise<DashboardData>>();

  static getInstance(): OptimizedDashboardService {
    if (!OptimizedDashboardService.instance) {
      OptimizedDashboardService.instance = new OptimizedDashboardService();
    }
    return OptimizedDashboardService.instance;
  }

  async getDashboardData(teacherId: string): Promise<DashboardData> {
    // Request deduplication - if same request is in progress, return existing promise
    if (this.activeRequests.has(teacherId)) {
      return this.activeRequests.get(teacherId)!;
    }

    const requestPromise = this.fetchDashboardData(teacherId);
    this.activeRequests.set(teacherId, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.activeRequests.delete(teacherId);
    }
  }

  private async fetchDashboardData(teacherId: string): Promise<DashboardData> {
    try {
      // Parallel execution of all queries for better performance
      const [studentsResult, assessmentsResult, performanceResult, teacherResult] = await Promise.allSettled([
        dashboardQueryService.getStudentsWithPerformance(teacherId),
        dashboardQueryService.getAssessmentsWithStats(teacherId),
        dashboardQueryService.getPerformanceMetrics(teacherId),
        dashboardQueryService.getTeacherProfile(teacherId)
      ]);

      // Safe extraction with fallbacks and proper type checking
      const students = studentsResult.status === 'fulfilled' && Array.isArray(studentsResult.value) 
        ? studentsResult.value 
        : [];
      
      const assessments = assessmentsResult.status === 'fulfilled' && Array.isArray(assessmentsResult.value)
        ? assessmentsResult.value 
        : [];
      
      const performance = performanceResult.status === 'fulfilled' && Array.isArray(performanceResult.value)
        ? performanceResult.value 
        : [];
      
      const teacher = teacherResult.status === 'fulfilled' && teacherResult.value && typeof teacherResult.value === 'object'
        ? teacherResult.value as { full_name?: string }
        : { full_name: 'Teacher' };

      // Log any failed requests for debugging
      [studentsResult, assessmentsResult, performanceResult, teacherResult].forEach((result, index) => {
        if (result.status === 'rejected') {
          const queries = ['students', 'assessments', 'performance', 'teacher'];
          console.error(`Dashboard query failed for ${queries[index]}:`, result.reason);
        }
      });

      const metrics = dashboardMetricsCalculator.calculateMetrics(students, assessments, performance);
      const alerts = dashboardMetricsCalculator.generateAlerts(metrics, students.length);

      return {
        students,
        assessments,
        metrics,
        alerts,
        teacher: {
          name: teacher.full_name || 'Teacher',
          firstName: (teacher.full_name || 'Teacher').split(' ')[0]
        }
      };
    } catch (error) {
      console.error('Dashboard data fetch failed:', error);
      throw error;
    }
  }

  invalidateCache(teacherId?: string): void {
    dashboardQueryService.invalidateCache(teacherId);
    if (teacherId) {
      this.activeRequests.delete(teacherId);
    } else {
      this.activeRequests.clear();
    }
  }
}

export const optimizedDashboardService = OptimizedDashboardService.getInstance();
export type { DashboardData };
