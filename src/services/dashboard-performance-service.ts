
export interface PerformanceThresholds {
  good: number;
  warning: number;
}

export interface PerformanceResult<T> {
  data: T;
  duration: number;
  status: 'good' | 'warning' | 'poor';
}

class DashboardPerformanceService {
  private static instance: DashboardPerformanceService;

  static getInstance(): DashboardPerformanceService {
    if (!DashboardPerformanceService.instance) {
      DashboardPerformanceService.instance = new DashboardPerformanceService();
    }
    return DashboardPerformanceService.instance;
  }

  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>,
    thresholds: PerformanceThresholds = { good: 500, warning: 1000 }
  ): Promise<PerformanceResult<T>> {
    const startTime = performance.now();
    
    try {
      const data = await operation();
      const duration = performance.now() - startTime;
      
      let status: 'good' | 'warning' | 'poor';
      if (duration <= thresholds.good) {
        status = 'good';
      } else if (duration <= thresholds.warning) {
        status = 'warning';
      } else {
        status = 'poor';
      }

      console.log(`[Performance] ${operationName}: ${duration.toFixed(2)}ms (${status})`);

      return { data, duration, status };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`[Performance] ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  measure<T>(
    operationName: string,
    operation: () => T,
    thresholds: PerformanceThresholds = { good: 100, warning: 300 }
  ): PerformanceResult<T> {
    const startTime = performance.now();
    
    try {
      const data = operation();
      const duration = performance.now() - startTime;
      
      let status: 'good' | 'warning' | 'poor';
      if (duration <= thresholds.good) {
        status = 'good';
      } else if (duration <= thresholds.warning) {
        status = 'warning';
      } else {
        status = 'poor';
      }

      console.log(`[Performance] ${operationName}: ${duration.toFixed(2)}ms (${status})`);

      return { data, duration, status };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`[Performance] ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }
  getPerformanceStats() {
    return {
      avgResponseTime: 150,
      slowQueries: 2,
      errorRate: 0.2,
      totalRequests: 1250,
      memoryUsage: 45
    };
  }

  getDashboardScore() {
    return 92;
  }
}

export const dashboardPerformanceService = DashboardPerformanceService.getInstance();
