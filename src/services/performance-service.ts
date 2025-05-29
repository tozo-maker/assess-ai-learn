
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  response_time_ms: number;
  status_code: number;
  error_message?: string;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds

  constructor() {
    // Auto-flush metrics periodically
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  logMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    if (this.metrics.length >= this.batchSize) {
      this.flushMetrics();
    }
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      await supabase
        .from('system_performance_logs')
        .insert(metricsToFlush);
    } catch (error) {
      console.warn('Failed to log performance metrics:', error);
      // Put metrics back if failed
      this.metrics.unshift(...metricsToFlush);
    }
  }

  async getPerformanceStats(timeframe: 'hour' | 'day' | 'week' = 'day') {
    const timeframeHours = timeframe === 'hour' ? 1 : timeframe === 'day' ? 24 : 168;
    const since = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('system_performance_logs')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      totalRequests: data.length,
      averageResponseTime: data.reduce((sum, log) => sum + log.response_time_ms, 0) / data.length,
      errorRate: data.filter(log => log.status_code >= 400).length / data.length,
      slowRequests: data.filter(log => log.response_time_ms > 2000).length,
      data
    };
  }
}

export const performanceService = new PerformanceService();

// Performance monitoring hook
export const withPerformanceTracking = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  endpoint: string,
  method: string = 'GET'
): T => {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    let status_code = 200;
    let error_message: string | undefined;

    try {
      const result = await fn(...args);
      return result;
    } catch (error: any) {
      status_code = error.status || 500;
      error_message = error.message;
      throw error;
    } finally {
      const response_time_ms = Date.now() - startTime;
      
      performanceService.logMetric({
        endpoint,
        method,
        response_time_ms,
        status_code,
        error_message
      });
    }
  }) as T;
};
