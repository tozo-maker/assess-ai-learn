interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  errorId: string;
}

interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  topErrors: Array<{ message: string; count: number }>;
  errorsByHour: Array<{ hour: string; count: number }>;
}

class EnhancedErrorTracking {
  private errorQueue: ErrorReport[] = [];
  private batchSize = 5;
  private flushInterval = 10000; // 10 seconds
  private errorCounts = new Map<string, number>();
  private isEnabled = false; // Disable by default

  constructor() {
    // Only initialize if explicitly enabled
    if (this.isEnabled) {
      this.initialize();
    }
  }

  private initialize() {
    this.setupGlobalErrorHandlers();
    this.startBatchProcessor();
    console.log('Enhanced error tracking initialized');
  }

  enable() {
    this.isEnabled = true;
    this.initialize();
  }

  disable() {
    this.isEnabled = false;
  }

  private setupGlobalErrorHandlers() {
    // Enhanced global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        severity: 'high',
        context: {
          filename: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno
        }
      });
    });

    // Enhanced unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        severity: 'critical',
        context: {
          type: 'unhandledPromiseRejection',
          reason: event.reason
        }
      });
    });

    // Network error tracking
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.captureError({
            message: `Network error: ${response.status} ${response.statusText}`,
            severity: response.status >= 500 ? 'high' : 'medium',
            context: {
              url: args[0],
              status: response.status,
              statusText: response.statusText
            }
          });
        }
        return response;
      } catch (error: any) {
        this.captureError({
          message: `Network request failed: ${error.message}`,
          stack: error.stack,
          severity: 'high',
          context: {
            url: args[0],
            type: 'networkError'
          }
        });
        throw error;
      }
    };
  }

  captureError(errorInfo: Partial<ErrorReport>) {
    if (!this.isEnabled) return;

    const errorId = this.generateErrorId();
    const errorReport: ErrorReport = {
      errorId,
      message: errorInfo.message || 'Unknown error',
      stack: errorInfo.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      severity: errorInfo.severity || 'medium',
      context: errorInfo.context || {}
    };

    // Track error frequency
    const errorKey = this.getErrorKey(errorReport);
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    this.errorQueue.push(errorReport);
    
    // Immediate flush for critical errors
    if (errorReport.severity === 'critical') {
      this.flushErrors();
    }

    // Only log critical errors to avoid spam
    if (errorReport.severity === 'critical') {
      console.error('Critical error captured:', errorReport);
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getErrorKey(error: ErrorReport): string {
    return `${error.message}_${error.url}`;
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Get actual user from auth context
      return undefined; // Return undefined for anonymous users
    } catch {
      return undefined;
    }
  }

  private startBatchProcessor() {
    setInterval(() => {
      this.flushErrors();
    }, this.flushInterval);
  }

  private async flushErrors() {
    if (this.errorQueue.length === 0 || !this.isEnabled) return;

    const errorsToFlush = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // Only flush if we have valid user context
      const validErrors = errorsToFlush.filter(error => error.userId);
      
      if (validErrors.length === 0) {
        this.storeErrorsLocally(errorsToFlush);
        return;
      }

      // Try to send to Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      
      const logsToInsert = validErrors.map(error => ({
        endpoint: 'error_tracking',
        method: 'ERROR',
        response_time_ms: 0,
        status_code: this.severityToStatusCode(error.severity),
        error_message: `${error.message} | Stack: ${error.stack?.substring(0, 500)}`,
        user_id: error.userId
      }));

      const { error } = await supabase
        .from('system_performance_logs')
        .insert(logsToInsert);

      if (error) {
        this.storeErrorsLocally(errorsToFlush);
      }
    } catch (error) {
      this.storeErrorsLocally(errorsToFlush);
    }
  }

  private severityToStatusCode(severity: string): number {
    switch (severity) {
      case 'critical': return 500;
      case 'high': return 400;
      case 'medium': return 300;
      case 'low': return 200;
      default: return 400;
    }
  }

  private storeErrorsLocally(errors: ErrorReport[]) {
    try {
      const existing = JSON.parse(localStorage.getItem('error_reports') || '[]');
      const combined = [...existing, ...errors].slice(-50); // Keep last 50 errors
      localStorage.setItem('error_reports', JSON.stringify(combined));
    } catch (error) {
      // Silently fail
    }
  }

  // Get error metrics for dashboard
  async getErrorMetrics(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<ErrorMetrics> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const timeframeHours = timeframe === 'hour' ? 1 : timeframe === 'day' ? 24 : 168;
      const since = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('system_performance_logs')
        .select('*')
        .eq('method', 'ERROR')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (error) {
        return this.getLocalErrorMetrics();
      }

      const totalErrors = data.length;
      const errorRate = totalErrors / timeframeHours;

      // Group errors by message
      const errorGroups = new Map<string, number>();
      data.forEach(log => {
        const message = log.error_message?.split(' | ')[0] || 'Unknown error';
        errorGroups.set(message, (errorGroups.get(message) || 0) + 1);
      });

      const topErrors = Array.from(errorGroups.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([message, count]) => ({ message, count }));

      // Group errors by hour
      const errorsByHour = this.groupErrorsByHour(data);

      return {
        totalErrors,
        errorRate,
        topErrors,
        errorsByHour
      };
    } catch (error) {
      return this.getLocalErrorMetrics();
    }
  }

  private getLocalErrorMetrics(): ErrorMetrics {
    try {
      const errors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      return {
        totalErrors: errors.length,
        errorRate: errors.length / 24, // Per hour
        topErrors: [],
        errorsByHour: []
      };
    } catch {
      return {
        totalErrors: 0,
        errorRate: 0,
        topErrors: [],
        errorsByHour: []
      };
    }
  }

  private groupErrorsByHour(data: any[]): Array<{ hour: string; count: number }> {
    const hourGroups = new Map<string, number>();
    
    data.forEach(log => {
      const hour = new Date(log.created_at).toISOString().substring(0, 13);
      hourGroups.set(hour, (hourGroups.get(hour) || 0) + 1);
    });

    return Array.from(hourGroups.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  // Manual error reporting for specific scenarios
  reportError(error: Error, context?: Record<string, any>, severity: ErrorReport['severity'] = 'medium') {
    this.captureError({
      message: error.message,
      stack: error.stack,
      severity,
      context
    });
  }
}

export const enhancedErrorTracking = new EnhancedErrorTracking();
