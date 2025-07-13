import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface UserBehaviorEvent {
  event_type: string;
  user_id?: string;
  page: string;
  element?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

interface ErrorReport {
  error_type: string;
  error_message: string;
  stack_trace?: string;
  user_id?: string;
  page: string;
  user_agent: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

class AnalyticsService {
  private performanceObserver: PerformanceObserver | null = null;
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializePerformanceMonitoring();
    this.initializeErrorTracking();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Performance Monitoring
  private initializePerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observeWebVitals();
    
    // Monitor custom performance metrics
    this.observeNavigationTiming();
    
    // Monitor resource loading
    this.observeResourceTiming();
  }

  private observeWebVitals() {
    try {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.trackPerformance('LCP', entry.startTime, {
            element: (entry as any).element?.tagName
          });
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.trackPerformance('FID', (entry as any).processingStart - entry.startTime, {
            eventType: (entry as any).name
          });
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            this.trackPerformance('CLS', (entry as any).value, {
              sources: (entry as any).sources?.length
            });
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Performance monitoring not available:', error);
    }
  }

  private observeNavigationTiming() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.trackPerformance('PageLoad', navigation.loadEventEnd - navigation.fetchStart);
      this.trackPerformance('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
      this.trackPerformance('TimeToFirstByte', navigation.responseStart - navigation.fetchStart);
    });
  }

  private observeResourceTiming() {
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.duration > 1000) { // Track slow resources (>1s)
          this.trackPerformance('SlowResource', resourceEntry.duration, {
            name: resourceEntry.name,
            type: resourceEntry.initiatorType
          });
        }
      }
    }).observe({ entryTypes: ['resource'] });
  }

  // User Behavior Analytics
  public trackPageView(page: string, metadata?: Record<string, any>) {
    this.trackBehavior('page_view', page, undefined, {
      referrer: document.referrer,
      ...metadata
    });
  }

  public trackClick(element: string, page: string, metadata?: Record<string, any>) {
    this.trackBehavior('click', page, element, metadata);
  }

  public trackFormSubmission(formName: string, page: string, metadata?: Record<string, any>) {
    this.trackBehavior('form_submit', page, formName, metadata);
  }

  public trackFeatureUsage(feature: string, page: string, metadata?: Record<string, any>) {
    this.trackBehavior('feature_usage', page, feature, metadata);
  }

  public trackSearchQuery(query: string, page: string, metadata?: Record<string, any>) {
    this.trackBehavior('search', page, undefined, {
      query,
      ...metadata
    });
  }

  // Error Tracking
  private initializeErrorTracking() {
    if (typeof window === 'undefined') return;

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError({
        error_type: 'javascript_error',
        error_message: event.message,
        stack_trace: event.error?.stack,
        user_id: this.userId,
        page: window.location.pathname,
        user_agent: navigator.userAgent,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        timestamp: Date.now()
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        error_type: 'unhandled_promise_rejection',
        error_message: event.reason?.toString() || 'Unknown promise rejection',
        stack_trace: event.reason?.stack,
        user_id: this.userId,
        page: window.location.pathname,
        user_agent: navigator.userAgent,
        metadata: {
          reason: event.reason
        },
        timestamp: Date.now()
      });
    });
  }

  public trackCustomError(error: Error, context?: Record<string, any>) {
    this.trackError({
      error_type: 'custom_error',
      error_message: error.message,
      stack_trace: error.stack,
      user_id: this.userId,
      page: window.location.pathname,
      user_agent: navigator.userAgent,
      metadata: context,
      timestamp: Date.now()
    });
  }

  // Private tracking methods
  private async trackPerformance(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata: {
        sessionId: this.sessionId,
        userId: this.userId,
        page: window.location.pathname,
        ...metadata
      }
    };

    try {
      // Store locally for batching
      this.queueMetric(metric);
      
      // Also log system performance
      await this.logSystemPerformance(name, value, metadata);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  private async trackBehavior(event_type: string, page: string, element?: string, metadata?: Record<string, any>) {
    const event: UserBehaviorEvent = {
      event_type,
      user_id: this.userId,
      page,
      element,
      metadata: {
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...metadata
      },
      timestamp: Date.now()
    };

    try {
      // Queue for batching
      this.queueBehaviorEvent(event);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  private async trackError(errorReport: ErrorReport) {
    try {
      // Log to Supabase for analysis
      await supabase.from('system_performance_logs').insert({
        endpoint: errorReport.page,
        method: 'ERROR',
        status_code: 500,
        response_time_ms: 0,
        error_message: `${errorReport.error_type}: ${errorReport.error_message}`,
        user_id: errorReport.user_id
      });

      // Also queue for batching
      this.queueError(errorReport);
    } catch (error) {
      console.error('Failed to track error:', error);
    }
  }

  private async logSystemPerformance(name: string, value: number, metadata?: Record<string, any>) {
    try {
      await supabase.from('system_performance_logs').insert({
        endpoint: `performance/${name}`,
        method: 'METRIC',
        status_code: 200,
        response_time_ms: Math.round(value),
        error_message: null,
        user_id: this.userId
      });
    } catch (error) {
      // Silently fail to avoid affecting app performance
      console.warn('Failed to log performance metric:', error);
    }
  }

  // Batching and storage
  private queueMetric(metric: PerformanceMetric) {
    const stored = localStorage.getItem('analytics_metrics');
    const metrics = stored ? JSON.parse(stored) : [];
    metrics.push(metric);
    
    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    localStorage.setItem('analytics_metrics', JSON.stringify(metrics));
  }

  private queueBehaviorEvent(event: UserBehaviorEvent) {
    const stored = localStorage.getItem('analytics_behavior');
    const events = stored ? JSON.parse(stored) : [];
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.shift();
    }
    
    localStorage.setItem('analytics_behavior', JSON.stringify(events));
  }

  private queueError(error: ErrorReport) {
    const stored = localStorage.getItem('analytics_errors');
    const errors = stored ? JSON.parse(stored) : [];
    errors.push(error);
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.shift();
    }
    
    localStorage.setItem('analytics_errors', JSON.stringify(errors));
  }

  // Public methods for batch operations
  public async flushAnalytics() {
    try {
      await Promise.all([
        this.flushMetrics(),
        this.flushBehaviorEvents(),
        this.flushErrors()
      ]);
    } catch (error) {
      console.error('Analytics flush error:', error);
    }
  }

  private async flushMetrics() {
    const stored = localStorage.getItem('analytics_metrics');
    if (!stored) return;

    const metrics = JSON.parse(stored);
    if (metrics.length === 0) return;

    // Send to analytics endpoint or external service
    // For now, we'll just clear the queue
    localStorage.removeItem('analytics_metrics');
  }

  private async flushBehaviorEvents() {
    const stored = localStorage.getItem('analytics_behavior');
    if (!stored) return;

    const events = JSON.parse(stored);
    if (events.length === 0) return;

    // Send to analytics endpoint or external service
    localStorage.removeItem('analytics_behavior');
  }

  private async flushErrors() {
    const stored = localStorage.getItem('analytics_errors');
    if (!stored) return;

    const errors = JSON.parse(stored);
    if (errors.length === 0) return;

    // Send to error tracking service
    localStorage.removeItem('analytics_errors');
  }

  // User management
  public setUserId(userId: string) {
    this.userId = userId;
  }

  public clearUserId() {
    this.userId = undefined;
  }

  // Performance dashboard data
  public getPerformanceMetrics(): PerformanceMetric[] {
    const stored = localStorage.getItem('analytics_metrics');
    return stored ? JSON.parse(stored) : [];
  }

  public getBehaviorEvents(): UserBehaviorEvent[] {
    const stored = localStorage.getItem('analytics_behavior');
    return stored ? JSON.parse(stored) : [];
  }

  public getErrorReports(): ErrorReport[] {
    const stored = localStorage.getItem('analytics_errors');
    return stored ? JSON.parse(stored) : [];
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// React hook for easy usage
export const useAnalytics = () => {
  return {
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackClick: analyticsService.trackClick.bind(analyticsService),
    trackFormSubmission: analyticsService.trackFormSubmission.bind(analyticsService),
    trackFeatureUsage: analyticsService.trackFeatureUsage.bind(analyticsService),
    trackSearchQuery: analyticsService.trackSearchQuery.bind(analyticsService),
    trackCustomError: analyticsService.trackCustomError.bind(analyticsService),
    flushAnalytics: analyticsService.flushAnalytics.bind(analyticsService),
    setUserId: analyticsService.setUserId.bind(analyticsService),
    clearUserId: analyticsService.clearUserId.bind(analyticsService)
  };
};
