/**
 * Production performance monitoring utilities
 * Tracks application performance metrics and user experience
 */

import { productionLogger } from '@/services/production-logger';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
  memoryUsage?: number;
  userAgent: string;
}

interface ApiMetrics {
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

class PerformanceMonitor {
  private renderMetrics: PerformanceMetrics[] = [];
  private apiMetrics: ApiMetrics[] = [];
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.initializePerformanceObserver();
    this.monitorMemoryUsage();
  }

  /**
   * Track component render performance
   */
  trackRender(componentName: string, startTime: number): number {
    const renderTime = performance.now() - startTime;
    
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now(),
      memoryUsage: this.getMemoryUsage(),
      userAgent: navigator.userAgent
    };

    this.renderMetrics.push(metrics);

    // Log slow renders
    if (renderTime > 100) {
      productionLogger.warn(`Slow render detected: ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        threshold: '100ms'
      });
    }

    // Keep only last 100 entries to prevent memory leaks
    if (this.renderMetrics.length > 100) {
      this.renderMetrics = this.renderMetrics.slice(-100);
    }

    return renderTime;
  }

  /**
   * Track API call performance
   */
  trackApiCall(url: string, method: string, duration: number, status: number): void {
    const metrics: ApiMetrics = {
      url,
      method,
      duration,
      status,
      timestamp: Date.now()
    };

    this.apiMetrics.push(metrics);
    productionLogger.apiCall(method, url, status, duration);

    // Log slow API calls
    if (duration > 2000) {
      productionLogger.warn(`Slow API call detected`, {
        url,
        method,
        duration: `${duration}ms`,
        threshold: '2000ms'
      });
    }

    // Keep only last 50 entries
    if (this.apiMetrics.length > 50) {
      this.apiMetrics = this.apiMetrics.slice(-50);
    }
  }

  /**
   * Measure async operation performance
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 1000) {
        console.warn(`Slow async operation: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`Failed async operation: ${name} took ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Initialize performance observer for Web Vitals
   */
  private initializePerformanceObserver(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            productionLogger.info('Page Load Performance', {
              type: 'navigation',
              loadTime: navEntry.loadEventEnd - navEntry.fetchStart,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
              firstByte: navEntry.responseStart - navEntry.fetchStart
            });
          }

          if (entry.entryType === 'paint') {
            productionLogger.info(`Paint Timing: ${entry.name}`, {
              type: 'paint',
              name: entry.name,
              startTime: entry.startTime
            });
          }
        }
      });

      this.performanceObserver.observe({ 
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] 
      });
    } catch (error) {
      productionLogger.error('Failed to initialize performance observer', error as Error);
    }
  }

  /**
   * Monitor memory usage periodically
   */
  private monitorMemoryUsage(): void {
    if (process.env.NODE_ENV === 'production') {
      setInterval(() => {
        const memoryUsage = this.getMemoryUsage();
        if (memoryUsage && memoryUsage > 50 * 1024 * 1024) { // 50MB threshold
          productionLogger.warn('High memory usage detected', {
            memoryUsage: `${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
            threshold: '50MB'
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const avgRenderTime = this.renderMetrics.length > 0 
      ? this.renderMetrics.reduce((sum, m) => sum + m.renderTime, 0) / this.renderMetrics.length
      : 0;

    const avgApiTime = this.apiMetrics.length > 0
      ? this.apiMetrics.reduce((sum, m) => sum + m.duration, 0) / this.apiMetrics.length
      : 0;

    return {
      averageRenderTime: avgRenderTime,
      averageApiTime: avgApiTime,
      totalRenders: this.renderMetrics.length,
      totalApiCalls: this.apiMetrics.length,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    this.renderMetrics = [];
    this.apiMetrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for tracking component performance
 */
export const usePerformanceTracking = (componentName: string) => {
  const startTime = performance.now();

  return {
    trackRender: () => performanceMonitor.trackRender(componentName, startTime),
    trackApiCall: (url: string, method: string, duration: number, status: number) =>
      performanceMonitor.trackApiCall(url, method, duration, status)
  };
};
