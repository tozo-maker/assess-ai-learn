
interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

interface PerformanceThresholds {
  responseTime: number; // ms
  throughput: number; // requests/second
  errorRate: number; // percentage
  memoryUsage?: number; // MB
}

export class PerformanceCalculator {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = 0;
  private requestCount: number = 0;
  private errorCount: number = 0;

  startMeasurement(): void {
    this.startTime = performance.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.metrics = [];
  }

  recordRequest(responseTime: number, isError: boolean = false): void {
    this.requestCount++;
    if (isError) {
      this.errorCount++;
    }

    const metric: PerformanceMetrics = {
      responseTime,
      throughput: this.calculateThroughput(),
      errorRate: this.calculateErrorRate()
    };

    this.metrics.push(metric);
  }

  private calculateThroughput(): number {
    const elapsedTime = (performance.now() - this.startTime) / 1000; // seconds
    return elapsedTime > 0 ? this.requestCount / elapsedTime : 0;
  }

  private calculateErrorRate(): number {
    return this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
  }

  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return total / this.metrics.length;
  }

  getCurrentThroughput(): number {
    return this.calculateThroughput();
  }

  getCurrentErrorRate(): number {
    return this.calculateErrorRate();
  }

  getPerformanceScore(thresholds: PerformanceThresholds): number {
    const avgResponseTime = this.getAverageResponseTime();
    const currentThroughput = this.getCurrentThroughput();
    const currentErrorRate = this.getCurrentErrorRate();

    let score = 100;

    // Response time scoring (40% weight)
    if (avgResponseTime > thresholds.responseTime) {
      const penalty = Math.min(40, (avgResponseTime / thresholds.responseTime - 1) * 20);
      score -= penalty;
    }

    // Throughput scoring (30% weight)
    if (currentThroughput < thresholds.throughput) {
      const penalty = Math.min(30, (1 - currentThroughput / thresholds.throughput) * 30);
      score -= penalty;
    }

    // Error rate scoring (30% weight)
    if (currentErrorRate > thresholds.errorRate) {
      const penalty = Math.min(30, (currentErrorRate / thresholds.errorRate - 1) * 15);
      score -= penalty;
    }

    return Math.max(0, score);
  }

  getDetailedReport(): {
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    totalRequests: number;
    totalErrors: number;
    metrics: PerformanceMetrics[];
  } {
    return {
      averageResponseTime: this.getAverageResponseTime(),
      throughput: this.getCurrentThroughput(),
      errorRate: this.getCurrentErrorRate(),
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      metrics: [...this.metrics]
    };
  }

  async measureAsyncFunction<T>(
    fn: () => Promise<T>,
    label: string = 'Operation'
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordRequest(duration, false);
      console.log(`${label} completed in ${duration.toFixed(2)}ms`);
      return { result, duration };
    } catch (error) {
      const duration = performance.now() - start;
      this.recordRequest(duration, true);
      console.error(`${label} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  // Load testing utilities
  async runLoadTest(
    testFunction: () => Promise<any>,
    options: {
      concurrency: number;
      duration: number; // seconds
      rampUp?: number; // seconds
    }
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
  }> {
    this.startMeasurement();
    
    const { concurrency, duration, rampUp = 0 } = options;
    const endTime = Date.now() + duration * 1000;
    const rampUpInterval = rampUp > 0 ? (rampUp * 1000) / concurrency : 0;
    
    const workers: Promise<void>[] = [];
    
    for (let i = 0; i < concurrency; i++) {
      const delay = i * rampUpInterval;
      
      const worker = new Promise<void>((resolve) => {
        setTimeout(async () => {
          while (Date.now() < endTime) {
            const start = performance.now();
            try {
              await testFunction();
              const duration = performance.now() - start;
              this.recordRequest(duration, false);
            } catch (error) {
              const duration = performance.now() - start;
              this.recordRequest(duration, true);
            }
            
            // Small delay to prevent overwhelming the system
            await new Promise(r => setTimeout(r, 10));
          }
          resolve();
        }, delay);
      });
      
      workers.push(worker);
    }
    
    await Promise.all(workers);
    
    return {
      totalRequests: this.requestCount,
      successfulRequests: this.requestCount - this.errorCount,
      failedRequests: this.errorCount,
      averageResponseTime: this.getAverageResponseTime(),
      throughput: this.getCurrentThroughput(),
      errorRate: this.getCurrentErrorRate()
    };
  }

  // Memory monitoring (browser environment)
  getMemoryUsage(): { used: number; total: number } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) // MB
      };
    }
    return null;
  }

  // Reset all metrics
  reset(): void {
    this.metrics = [];
    this.startTime = 0;
    this.requestCount = 0;
    this.errorCount = 0;
  }
}

// Global instance for easy access
export const performanceCalculator = new PerformanceCalculator();

// Utility functions for common performance testing scenarios
export const performanceUtils = {
  // Test database query performance
  async testDatabasePerformance(queryFn: () => Promise<any>, iterations: number = 10) {
    const calculator = new PerformanceCalculator();
    calculator.startMeasurement();
    
    const results = [];
    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await calculator.measureAsyncFunction(queryFn, `Query ${i + 1}`);
      results.push({ result, duration });
    }
    
    return {
      results,
      report: calculator.getDetailedReport(),
      recommendation: calculator.getAverageResponseTime() > 1000 
        ? 'Consider optimizing queries or adding indexes'
        : 'Database performance is acceptable'
    };
  },

  // Test API endpoint performance
  async testAPIPerformance(
    endpoint: string, 
    options: RequestInit = {}, 
    iterations: number = 5
  ) {
    const calculator = new PerformanceCalculator();
    calculator.startMeasurement();
    
    const results = [];
    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await calculator.measureAsyncFunction(
        async () => {
          const response = await fetch(endpoint, options);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        },
        `API Call ${i + 1}`
      );
      results.push({ result, duration });
    }
    
    return {
      results,
      report: calculator.getDetailedReport(),
      recommendation: calculator.getAverageResponseTime() > 2000 
        ? 'API response times are slow - consider optimization'
        : 'API performance is acceptable'
    };
  },

  // Monitor component render performance
  measureComponentRender(componentName: string) {
    const start = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - start;
        console.log(`${componentName} render took ${duration.toFixed(2)}ms`);
        
        if (duration > 16) { // 60fps threshold
          console.warn(`${componentName} render is slow (>${duration.toFixed(2)}ms). Consider optimization.`);
        }
        
        return duration;
      }
    };
  }
};
