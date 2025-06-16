interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  threshold: { good: number; warning: number };
}

interface NetworkMetric {
  endpoint: string;
  responseTime: number;
  status: number;
  timestamp: number;
}

class DashboardPerformanceService {
  private static instance: DashboardPerformanceService;
  private metrics: PerformanceMetric[] = [];
  private networkMetrics: NetworkMetric[] = [];
  private maxMetrics = 100;

  static getInstance(): DashboardPerformanceService {
    if (!DashboardPerformanceService.instance) {
      DashboardPerformanceService.instance = new DashboardPerformanceService();
    }
    return DashboardPerformanceService.instance;
  }

  recordMetric(name: string, value: number, threshold: { good: number; warning: number }): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      threshold
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (value > threshold.warning) {
      console.warn(`Slow operation detected: ${name} took ${value}ms`);
    }
  }

  recordNetworkRequest(endpoint: string, responseTime: number, status: number): void {
    this.networkMetrics.push({
      endpoint,
      responseTime,
      status,
      timestamp: Date.now()
    });

    if (this.networkMetrics.length > this.maxMetrics) {
      this.networkMetrics = this.networkMetrics.slice(-this.maxMetrics);
    }
  }

  measureAsync<T>(name: string, operation: () => Promise<T>, threshold = { good: 200, warning: 500 }): Promise<T> {
    const start = performance.now();
    
    return operation().then(result => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, threshold);
      return result;
    }).catch(error => {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration, threshold);
      throw error;
    });
  }

  getPerformanceStats() {
    const recent = this.metrics.filter(m => Date.now() - m.timestamp < 5 * 60 * 1000); // Last 5 minutes
    const networkRecent = this.networkMetrics.filter(n => Date.now() - n.timestamp < 5 * 60 * 1000);

    const avgResponseTime = recent.length > 0 
      ? recent.reduce((sum, m) => sum + m.value, 0) / recent.length 
      : 0;

    const slowQueries = recent.filter(m => m.value > m.threshold.warning).length;
    const errorRate = networkRecent.length > 0 
      ? (networkRecent.filter(n => n.status >= 400).length / networkRecent.length) * 100
      : 0;

    return {
      avgResponseTime: Math.round(avgResponseTime),
      slowQueries,
      errorRate: Math.round(errorRate * 10) / 10,
      totalRequests: networkRecent.length,
      memoryUsage: this.getMemoryUsage()
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }

  getDashboardScore(): number {
    const stats = this.getPerformanceStats();
    let score = 100;

    // Deduct points for poor performance
    if (stats.avgResponseTime > 500) score -= 20;
    else if (stats.avgResponseTime > 200) score -= 10;

    if (stats.errorRate > 5) score -= 25;
    else if (stats.errorRate > 1) score -= 10;

    if (stats.slowQueries > 3) score -= 15;
    else if (stats.slowQueries > 1) score -= 5;

    if (stats.memoryUsage > 100) score -= 10;
    else if (stats.memoryUsage > 50) score -= 5;

    return Math.max(0, Math.min(100, score));
  }
}

export const dashboardPerformanceService = DashboardPerformanceService.getInstance();
