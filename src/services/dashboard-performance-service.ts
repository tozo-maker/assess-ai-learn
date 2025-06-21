
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

export interface PerformanceStats {
  avgResponseTime: number;
  slowQueries: number;
  errorRate: number;
  totalRequests: number;
  memoryUsage: number;
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

  getPerformanceStats(): PerformanceStats {
    const recentMetrics = this.metrics.slice(-20); // Last 20 metrics
    
    if (recentMetrics.length === 0) {
      return {
        avgResponseTime: 0,
        slowQueries: 0,
        errorRate: 0,
        totalRequests: 0,
        memoryUsage: 0
      };
    }

    const avgResponseTime = Math.round(
      recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
    );

    const slowQueries = recentMetrics.filter(m => m.status === 'poor').length;
    const errorRate = Math.round((slowQueries / recentMetrics.length) * 100);
    
    // Get memory usage if available
    const memoryInfo = 'memory' in performance ? (performance as any).memory : null;
    const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;

    return {
      avgResponseTime,
      slowQueries,
      errorRate,
      totalRequests: this.metrics.length,
      memoryUsage
    };
  }

  getDashboardScore(): number {
    const stats = this.getPerformanceStats();
    
    let score = 100;
    
    // Deduct points for poor performance
    if (stats.avgResponseTime > 1000) score -= 30;
    else if (stats.avgResponseTime > 500) score -= 15;
    
    if (stats.slowQueries > 5) score -= 25;
    else if (stats.slowQueries > 2) score -= 10;
    
    if (stats.errorRate > 10) score -= 20;
    else if (stats.errorRate > 5) score -= 10;
    
    if (stats.memoryUsage > 100) score -= 15;
    else if (stats.memoryUsage > 50) score -= 5;
    
    return Math.max(0, score);
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const dashboardPerformanceService = new DashboardPerformanceService();
