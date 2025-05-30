
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

  constructor() {
    // Auto-flush metrics periodically
    setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);

    // Setup performance monitoring
    this.setupPerformanceObserver();
    this.setupErrorMonitoring();
    this.initializeAdvancedMonitoring();
  }

  private initializeAdvancedMonitoring() {
    // Initialize enhanced error tracking
    import('@/services/enhanced-error-tracking').then(({ enhancedErrorTracking }) => {
      console.log('Enhanced error tracking initialized');
    });

    // Initialize structured logging
    import('@/services/structured-logging').then(({ structuredLogger }) => {
      structuredLogger.info('Performance monitoring service initialized', {
        batchSize: this.batchSize,
        flushInterval: this.flushInterval
      });
    });

    // Initialize advanced caching
    import('@/services/advanced-caching-service').then(({ advancedCaching }) => {
      console.log('Advanced caching service initialized');
    });
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
    // Add user context if available
    const enhancedMetric = {
      ...metric,
      user_id: this.getCurrentUserId()
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
      // This would be replaced with actual user context
      return 'current-user-id'; // Placeholder
    } catch {
      return undefined;
    }
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      // Try to log to Supabase, but don't fail if it's not available
      const { error } = await supabase
        .from('system_performance_logs')
        .insert(metricsToFlush);

      if (error) {
        console.warn('Failed to log performance metrics to database:', error);
        // Store locally as fallback
        this.storeMetricsLocally(metricsToFlush);
      }
    } catch (error) {
      console.warn('Performance logging failed:', error);
      // Store locally as fallback
      this.storeMetricsLocally(metricsToFlush);
    }
  }

  private storeMetricsLocally(metrics: PerformanceMetric[]) {
    try {
      const existing = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      const combined = [...existing, ...metrics].slice(-100); // Keep last 100 metrics
      localStorage.setItem('performance_metrics', JSON.stringify(combined));
    } catch (error) {
      console.warn('Failed to store metrics locally:', error);
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
    console.warn('Performance Alert:', alert);
    
    // Enhanced alert handling with structured logging
    import('@/services/structured-logging').then(({ structuredLogger }) => {
      structuredLogger.warn('Performance alert triggered', {
        alertType: alert.type,
        threshold: alert.threshold,
        currentValue: alert.current_value,
        message: alert.message
      });
    });

    // In production, this would send alerts to monitoring service
    // For now, we'll just log and could show user notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Performance Alert', {
          body: alert.message,
          icon: '/favicon.ico'
        });
      }
    }
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
        console.warn('Failed to fetch performance stats:', error);
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
      console.warn('Performance stats query failed:', error);
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

  // Enhanced monitoring for specific operations
  async monitorDatabaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
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

  // Memory monitoring
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

  // Network monitoring
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

  // Real-time alerts configuration
  configureAlerts(newThresholds: Partial<typeof this.alertThresholds>) {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds };
    
    import('@/services/structured-logging').then(({ structuredLogger }) => {
      structuredLogger.info('Performance alert thresholds updated', {
        newThresholds: this.alertThresholds
      });
    });
  }

  // Performance recommendations
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
