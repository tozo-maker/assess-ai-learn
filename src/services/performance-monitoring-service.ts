import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  response_time_ms: number;
  status_code: number;
  error_message?: string;
  user_id?: string;
}

interface PerformanceAlert {
  type: 'slow_response' | 'high_error_rate' | 'memory_usage' | 'api_failure';
  threshold: number;
  current_value: number;
  message: string;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private alertThresholds = {
    responseTime: 2000, // 2 seconds
    errorRate: 5, // 5%
    memoryUsage: 100 // 100MB
  };
  private isEnabled = false; // Disable by default

  constructor() {
    // Only initialize if explicitly enabled
    if (this.isEnabled) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Auto-flush metrics periodically
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);

    // Setup performance monitoring
    this.setupPerformanceObserver();
    this.setupErrorMonitoring();
    console.log('Performance monitoring service initialized');
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.logMetric({
                endpoint: 'page_load',
                method: 'GET',
                response_time_ms: entry.duration,
                status_code: 200
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['navigation', 'resource'] });
      } catch (error) {
        console.warn('Performance observer setup failed:', error);
      }
    }
  }

  private setupErrorMonitoring() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logMetric({
        endpoint: 'javascript_error',
        method: 'ERROR',
        response_time_ms: 0,
        status_code: 500,
        error_message: event.message
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logMetric({
        endpoint: 'unhandled_promise',
        method: 'ERROR',
        response_time_ms: 0,
        status_code: 500,
        error_message: event.reason?.toString() || 'Unhandled promise rejection'
      });
    });
  }

  logMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;

    // Get actual user ID or skip logging
    const userId = this.getCurrentUserId();
    if (!userId) {
      // Don't log if no valid user
      return;
    }

    const enhancedMetric = {
      ...metric,
      user_id: userId
    };

    this.metrics.push(enhancedMetric);
    
    // Check for alerts
    this.checkAlerts(enhancedMetric);
    
    if (this.metrics.length >= this.batchSize) {
      this.flushMetrics();
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Get actual user from auth context
      const user = supabase.auth.getUser();
      return user ? 'actual-user-id' : undefined; // Return undefined if no user
    } catch {
      return undefined;
    }
  }

  private async flushMetrics() {
    if (this.metrics.length === 0 || !this.isEnabled) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      // Only try to log if we have valid metrics with user IDs
      const validMetrics = metricsToFlush.filter(m => m.user_id);
      
      if (validMetrics.length === 0) {
        return; // Don't try to log if no valid metrics
      }

      const { error } = await supabase
        .from('system_performance_logs')
        .insert(validMetrics);

      if (error) {
        // Silently fail - don't spam console
        this.storeMetricsLocally(validMetrics);
      }
    } catch (error) {
      // Silently fail - don't spam console
      this.storeMetricsLocally(metricsToFlush);
    }
  }

  private storeMetricsLocally(metrics: PerformanceMetric[]) {
    try {
      const existing = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      const combined = [...existing, ...metrics].slice(-100); // Keep last 100 metrics
      localStorage.setItem('performance_metrics', JSON.stringify(combined));
    } catch (error) {
      // Silently fail
    }
  }

  private checkAlerts(metric: PerformanceMetric) {
    const alerts: PerformanceAlert[] = [];

    // Check response time
    if (metric.response_time_ms > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'slow_response',
        threshold: this.alertThresholds.responseTime,
        current_value: metric.response_time_ms,
        message: `Slow response detected: ${metric.endpoint} took ${metric.response_time_ms}ms`
      });
    }

    // Check error rate
    if (metric.status_code >= 400) {
      alerts.push({
        type: 'high_error_rate',
        threshold: this.alertThresholds.errorRate,
        current_value: metric.status_code,
        message: `Error detected: ${metric.endpoint} returned ${metric.status_code}`
      });
    }

    // Trigger alerts
    alerts.forEach(alert => this.triggerAlert(alert));
  }

  private triggerAlert(alert: PerformanceAlert) {
    // Only log critical alerts to avoid spam
    if (alert.type === 'high_error_rate' && alert.current_value >= 500) {
      console.warn('Critical Performance Alert:', alert);
    }
  }

  // Enable/disable monitoring
  enable() {
    this.isEnabled = true;
    this.initializeMonitoring();
  }

  disable() {
    this.isEnabled = false;
  }

  async getPerformanceStats(timeframe: 'hour' | 'day' | 'week' = 'day') {
    const timeframeHours = timeframe === 'hour' ? 1 : timeframe === 'day' ? 24 : 168;
    const since = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString();

    try {
      const { data, error } = await supabase
        .from('system_performance_logs')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (error) {
        return this.getLocalPerformanceStats();
      }

      return {
        totalRequests: data.length,
        averageResponseTime: data.reduce((sum, log) => sum + log.response_time_ms, 0) / data.length || 0,
        errorRate: (data.filter(log => log.status_code >= 400).length / data.length) * 100 || 0,
        slowRequests: data.filter(log => log.response_time_ms > this.alertThresholds.responseTime).length,
        data
      };
    } catch (error) {
      return this.getLocalPerformanceStats();
    }
  }

  private getLocalPerformanceStats() {
    try {
      const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      return {
        totalRequests: metrics.length,
        averageResponseTime: metrics.reduce((sum: number, m: PerformanceMetric) => sum + m.response_time_ms, 0) / metrics.length || 0,
        errorRate: (metrics.filter((m: PerformanceMetric) => m.status_code >= 400).length / metrics.length) * 100 || 0,
        slowRequests: metrics.filter((m: PerformanceMetric) => m.response_time_ms > this.alertThresholds.responseTime).length,
        data: metrics
      };
    } catch {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        slowRequests: 0,
        data: []
      };
    }
  }

  async monitorDatabaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    if (!this.isEnabled) {
      return await operation();
    }

    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.logMetric({
        endpoint: `db_${operationName}`,
        method: 'DATABASE',
        response_time_ms: duration,
        status_code: 200
      });
      
      return result;
    } catch (error: any) {
      const duration = performance.now() - startTime;
      
      this.logMetric({
        endpoint: `db_${operationName}`,
        method: 'DATABASE',
        response_time_ms: duration,
        status_code: error.status || 500,
        error_message: error.message
      });
      
      throw error;
    }
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      
      if (usedMB > this.alertThresholds.memoryUsage) {
        this.triggerAlert({
          type: 'memory_usage',
          threshold: this.alertThresholds.memoryUsage,
          current_value: usedMB,
          message: `High memory usage detected: ${usedMB}MB`
        });
      }
      
      return {
        used: usedMB,
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  monitorNetworkConditions() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }

  configureAlerts(newThresholds: Partial<typeof this.alertThresholds>) {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds };
  }

  getPerformanceRecommendations() {
    const memoryUsage = this.getMemoryUsage();
    const networkConditions = this.monitorNetworkConditions();
    const recommendations: string[] = [];

    if (memoryUsage && memoryUsage.used > 50) {
      recommendations.push('Consider optimizing memory usage - current usage is high');
    }

    if (networkConditions && networkConditions.effectiveType === 'slow-2g') {
      recommendations.push('Optimize for slow network conditions detected');
    }

    if (this.metrics.length > 50) {
      recommendations.push('High metric volume detected - consider increasing batch size');
    }

    return recommendations;
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
