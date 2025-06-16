// Performance monitoring service for LearnSpark AI
export interface PerformanceMetric {
  timestamp: number;
  component: string;
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  averageLoadTime: number;
  slowestOperations: PerformanceMetric[];
  errorRate: number;
  recommendations: string[];
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;

  public trackOperation<T>(
    component: string,
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    return fn()
      .then(result => {
        this.recordMetric({
          timestamp: Date.now(),
          component,
          operation,
          duration: performance.now() - startTime,
          success: true,
          metadata
        });
        return result;
      })
      .catch(error => {
        this.recordMetric({
          timestamp: Date.now(),
          component,
          operation,
          duration: performance.now() - startTime,
          success: false,
          metadata: { ...metadata, error: error.message }
        });
        throw error;
      });
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  public getReport(): PerformanceReport {
    const successfulMetrics = this.metrics.filter(m => m.success);
    const averageLoadTime = successfulMetrics.length > 0
      ? successfulMetrics.reduce((sum, m) => sum + m.duration, 0) / successfulMetrics.length
      : 0;

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const errorRate = this.metrics.length > 0
      ? (this.metrics.filter(m => !m.success).length / this.metrics.length) * 100
      : 0;

    const recommendations: string[] = [];
    
    if (averageLoadTime > 2000) {
      recommendations.push('Consider optimizing slow operations');
    }
    
    if (errorRate > 5) {
      recommendations.push('High error rate detected, review error handling');
    }

    return {
      averageLoadTime,
      slowestOperations,
      errorRate,
      recommendations
    };
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public logMetric({
    endpoint,
    method,
    response_time_ms,
    status_code,
    error_message
  }: {
    endpoint: string;
    method: string;
    response_time_ms: number;
    status_code: number;
    error_message?: string;
  }): void {
    this.recordMetric({
      timestamp: Date.now(),
      component: 'api',
      operation: `${method} ${endpoint}`,
      duration: response_time_ms,
      success: status_code >= 200 && status_code < 300,
      metadata: {
        status_code,
        error_message
      }
    });
  }
}

// Export as default
const performanceService = new PerformanceService();
export default performanceService;
