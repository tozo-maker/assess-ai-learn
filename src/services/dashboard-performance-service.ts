export interface PerformanceThresholds {
  good: number;
  warning: number;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  status: 'good' | 'warning' | 'poor';
  timestamp: number;
}

class DashboardPerformanceService {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100;

  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    thresholds: PerformanceThresholds = { good: 500, warning: 1000 }
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - start;
      
      this.recordMetric(name, duration, thresholds);
      console.log(`Performance: ${name} took ${Math.round(duration)}ms`);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, thresholds, true);
      throw error;
    }
  }

  private recordMetric(
    name: string, 
    duration: number, 
    thresholds: PerformanceThresholds,
    hasError = false
  ) {
    const status = hasError 
      ? 'poor' 
      : duration <= thresholds.good 
        ? 'good' 
        : duration <= thresholds.warning 
          ? 'warning' 
          : 'poor';

    const metric: PerformanceMetric = {
      name,
      duration,
      status,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageForOperation(name: string): number {
    const operationMetrics = this.metrics.filter(m => m.name === name);
    if (operationMetrics.length === 0) return 0;
    
    return operationMetrics.reduce((sum, m) => sum + m.duration, 0) / operationMetrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const dashboardPerformanceService = new DashboardPerformanceService();
