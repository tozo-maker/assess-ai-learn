/**
 * Real-time error monitoring and tracking service
 * Provides comprehensive error reporting, analysis, and user feedback
 */

import { productionLogger } from './production-logger';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  component?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  resolved: boolean;
  occurrenceCount: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  topErrors: Array<{ message: string; count: number }>;
  errorRate: number;
  lastUpdated: string;
}

class ErrorMonitoringService {
  private errorReports = new Map<string, ErrorReport>();
  private errorQueue: ErrorReport[] = [];
  private isProcessing = false;
  private maxQueueSize = 100;

  constructor() {
    this.initializeErrorHandlers();
    this.startBatchProcessor();
  }

  /**
   * Initialize global error handlers
   */
  private initializeErrorHandlers(): void {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        severity: 'high'
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'medium',
        context: { type: 'promise_rejection' }
      });
    });

    // Handle React error boundaries
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('React') || message.includes('component')) {
        this.captureError({
          message,
          severity: 'medium',
          context: { type: 'react_error', args }
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  /**
   * Capture and process error reports
   */
  captureError(errorData: {
    message: string;
    stack?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    component?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    context?: Record<string, any>;
    userId?: string;
  }): string {
    const errorId = this.generateErrorId(errorData.message);
    const timestamp = new Date().toISOString();

    const errorReport: ErrorReport = {
      id: errorId,
      timestamp,
      message: errorData.message,
      stack: errorData.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: errorData.userId,
      component: errorData.component,
      severity: errorData.severity || 'medium',
      context: {
        filename: errorData.filename,
        lineno: errorData.lineno,
        colno: errorData.colno,
        ...errorData.context
      },
      resolved: false,
      occurrenceCount: 1
    };

    // Check if we've seen this error before
    const existing = this.errorReports.get(errorId);
    if (existing) {
      existing.occurrenceCount++;
      existing.timestamp = timestamp;
    } else {
      this.errorReports.set(errorId, errorReport);
      this.addToQueue(errorReport);
    }

    // Log error immediately
    productionLogger.error(`Error captured: ${errorData.message}`, 
      errorData.stack ? new Error(errorData.stack) : undefined, 
      {
        errorId,
        severity: errorData.severity,
        component: errorData.component,
        context: errorData.context
      }
    );

    return errorId;
  }

  /**
   * Generate consistent error ID based on message and stack
   */
  private generateErrorId(message: string, stack?: string): string {
    const content = `${message}${stack || ''}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `error_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Add error to processing queue
   */
  private addToQueue(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport);
    
    // Prevent queue overflow
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }
  }

  /**
   * Start batch processor for error reports
   */
  private startBatchProcessor(): void {
    setInterval(async () => {
      if (this.errorQueue.length > 0 && !this.isProcessing) {
        await this.processErrorQueue();
      }
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process queued error reports
   */
  private async processErrorQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.errorQueue.splice(0, 10); // Process 10 at a time

    try {
      // Store errors in Supabase for persistence
      const { error } = await supabase
        .from('system_performance_logs')
        .insert(
          batch.map(report => ({
            endpoint: report.url,
            method: 'ERROR',
            status_code: this.severityToStatusCode(report.severity),
            response_time_ms: 0,
            error_message: `${report.message}\n\nStack: ${report.stack || 'N/A'}\n\nContext: ${JSON.stringify(report.context)}`,
            user_id: report.userId
          }))
        );

      if (error) {
        productionLogger.error('Failed to store error reports', error);
        // Re-add to queue for retry
        this.errorQueue.unshift(...batch);
      } else {
        productionLogger.info(`Processed ${batch.length} error reports`);
      }
    } catch (error) {
      productionLogger.error('Error processing queue', error as Error);
      // Re-add to queue for retry
      this.errorQueue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Convert severity to status code for logging
   */
  private severityToStatusCode(severity: string): number {
    switch (severity) {
      case 'critical': return 500;
      case 'high': return 400;
      case 'medium': return 300;
      case 'low': return 200;
      default: return 400;
    }
  }

  /**
   * Get error metrics and analytics
   */
  getErrorMetrics(): ErrorMetrics {
    const reports = Array.from(this.errorReports.values());
    const totalErrors = reports.reduce((sum, report) => sum + report.occurrenceCount, 0);
    
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    
    reports.forEach(report => {
      const type = report.component || 'unknown';
      errorsByType[type] = (errorsByType[type] || 0) + report.occurrenceCount;
      errorsBySeverity[report.severity] = (errorsBySeverity[report.severity] || 0) + report.occurrenceCount;
    });

    const topErrors = reports
      .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
      .slice(0, 10)
      .map(report => ({
        message: report.message,
        count: report.occurrenceCount
      }));

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      topErrors,
      errorRate: totalErrors / Math.max(1, reports.length),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): boolean {
    const error = this.errorReports.get(errorId);
    if (error) {
      error.resolved = true;
      productionLogger.info(`Error resolved: ${errorId}`);
      return true;
    }
    return false;
  }

  /**
   * Get specific error details
   */
  getError(errorId: string): ErrorReport | undefined {
    return this.errorReports.get(errorId);
  }

  /**
   * Get all active errors
   */
  getActiveErrors(): ErrorReport[] {
    return Array.from(this.errorReports.values()).filter(error => !error.resolved);
  }

  /**
   * Clear resolved errors older than specified time
   */
  cleanupResolvedErrors(olderThanHours: number = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    
    for (const [id, error] of this.errorReports.entries()) {
      if (error.resolved && new Date(error.timestamp) < cutoff) {
        this.errorReports.delete(id);
      }
    }
  }

  /**
   * Export error data for analysis
   */
  exportErrorData(): string {
    const data = {
      errors: Array.from(this.errorReports.values()),
      metrics: this.getErrorMetrics(),
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

export const errorMonitoringService = new ErrorMonitoringService();

// Cleanup resolved errors every hour
setInterval(() => {
  errorMonitoringService.cleanupResolvedErrors();
}, 3600000);

// Convenience functions for React components
export const captureComponentError = (componentName: string, error: Error, context?: Record<string, any>) => {
  return errorMonitoringService.captureError({
    message: error.message,
    stack: error.stack,
    component: componentName,
    severity: 'medium',
    context
  });
};

export const captureUserAction = (action: string, error: Error, userId?: string) => {
  return errorMonitoringService.captureError({
    message: `User action failed: ${action}`,
    stack: error.stack,
    severity: 'low',
    userId,
    context: { type: 'user_action', action }
  });
};