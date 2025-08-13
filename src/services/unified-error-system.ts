/**
 * Unified Error Handling and Logging System
 * Consolidates error boundaries, logging, and error reporting
 */

import { supabase } from '@/integrations/supabase/client';

// Types
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface UnifiedError extends Error {
  code?: string;
  severity?: ErrorSeverity;
  context?: ErrorContext;
  recoverable?: boolean;
}

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  context?: ErrorContext;
  error?: Error;
  timestamp: string;
}

// Unified Error and Logging Service
class UnifiedErrorSystem {
  private logQueue: LogEntry[] = [];
  private readonly batchSize = 10;
  private readonly flushInterval = 3000;
  private readonly sessionId = this.generateSessionId();
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly enableRemote = process.env.NODE_ENV === 'production';

  constructor() {
    this.startBatchProcessor();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        error: new Error(event.reason?.message || 'Promise rejection'),
        context: { type: 'unhandledrejection', reason: event.reason }
      });
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.error('Uncaught Error', {
        error: event.error || new Error(event.message),
        context: {
          type: 'uncaught',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });
  }

  // Core logging methods
  debug(message: string, context?: ErrorContext): void {
    if (!this.isDevelopment) return;
    this.log('DEBUG', message, context);
  }

  info(message: string, context?: ErrorContext): void {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: ErrorContext): void {
    this.log('WARN', message, context);
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  error(message: string, options?: { error?: Error; context?: ErrorContext }): void {
    this.log('ERROR', message, options?.context, options?.error);
    
    // Always log errors to console in development
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, options?.error, options?.context);
    }
  }

  private log(level: LogLevel, message: string, context?: ErrorContext, error?: Error): void {
    const logEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      context: {
        ...context,
        sessionId: this.sessionId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      error,
      timestamp: new Date().toISOString()
    };

    this.logQueue.push(logEntry);

    // Immediate flush for errors
    if (level === 'ERROR' || this.logQueue.length >= this.batchSize) {
      this.flushLogs();
    }
  }

  private startBatchProcessor(): void {
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  private async flushLogs(): Promise<void> {
    if (!this.enableRemote) return;
    if (this.logQueue.length === 0) return;

    const logsToFlush = [...this.logQueue];
    this.logQueue = [];

    try {
      const performanceLogs = logsToFlush.map(log => ({
        endpoint: `app_${log.level.toLowerCase()}`,
        method: log.level,
        response_time_ms: 0,
        status_code: this.levelToStatusCode(log.level),
        error_message: this.formatLogMessage(log),
        user_id: log.context?.userId || null
      }));

      const { error } = await supabase
        .from('system_performance_logs')
        .insert(performanceLogs);

      if (error) {
        this.storeLogsLocally(logsToFlush);
      }
    } catch (error) {
      this.storeLogsLocally(logsToFlush);
    }
  }

  private levelToStatusCode(level: LogLevel): number {
    switch (level) {
      case 'ERROR': return 500;
      case 'WARN': return 400;
      case 'INFO': return 200;
      case 'DEBUG': return 100;
      default: return 200;
    }
  }

  private formatLogMessage(log: LogEntry): string {
    let message = log.message;
    
    if (log.error) {
      message += ` | Error: ${log.error.message}`;
      if (log.error.stack && this.isDevelopment) {
        message += ` | Stack: ${log.error.stack}`;
      }
    }
    
    if (log.context) {
      const contextStr = JSON.stringify(log.context);
      message += ` | Context: ${contextStr}`;
    }
    
    return message;
  }

  private storeLogsLocally(logs: LogEntry[]): void {
    try {
      const existing = JSON.parse(localStorage.getItem('unified_logs') || '[]');
      const combined = [...existing, ...logs].slice(-50); // Keep last 50 logs
      localStorage.setItem('unified_logs', JSON.stringify(combined));
    } catch (error) {
      // Silent fail for localStorage issues
    }
  }

  // Error creation helpers
  createError(
    message: string,
    code?: string,
    severity: ErrorSeverity = 'MEDIUM',
    context?: ErrorContext,
    recoverable: boolean = true
  ): UnifiedError {
    const error = new Error(message) as UnifiedError;
    error.code = code;
    error.severity = severity;
    error.context = context;
    error.recoverable = recoverable;
    return error;
  }

  // Performance monitoring
  async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      this.debug(`Starting: ${operationName}`, context);
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.info(`Completed: ${operationName}`, {
        ...context,
        duration: `${duration.toFixed(2)}ms`,
        success: true
      });
      
      return result;
    } catch (error: any) {
      const duration = performance.now() - startTime;
      
      this.error(`Failed: ${operationName}`, {
        error,
        context: {
          ...context,
          duration: `${duration.toFixed(2)}ms`,
          success: false
        }
      });
      
      throw error;
    }
  }

  // Handle React component errors
  handleComponentError(
    error: Error,
    errorInfo: React.ErrorInfo,
    componentName: string
  ): void {
    this.error(`Component Error: ${componentName}`, {
      error,
      context: {
        component: componentName,
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });
  }

  // User action logging
  logUserAction(action: string, details?: ErrorContext): void {
    this.info(`User Action: ${action}`, {
      type: 'user_action',
      action,
      ...details
    });
  }

  // API call logging
  logApiCall(method: string, url: string, status: number, duration?: number): void {
    const level = status >= 400 ? 'WARN' : 'INFO';
    this[level.toLowerCase() as 'warn' | 'info'](`API ${method} ${url}`, {
      type: 'api_call',
      method,
      url,
      status,
      duration
    });
  }
}

// Export singleton instance
export const unifiedErrorSystem = new UnifiedErrorSystem();

// Convenience exports
export const logDebug = (message: string, context?: ErrorContext) => 
  unifiedErrorSystem.debug(message, context);

export const logInfo = (message: string, context?: ErrorContext) => 
  unifiedErrorSystem.info(message, context);

export const logWarn = (message: string, context?: ErrorContext) => 
  unifiedErrorSystem.warn(message, context);

export const logError = (message: string, error?: Error, context?: ErrorContext) => 
  unifiedErrorSystem.error(message, { error, context });

export const logUserAction = (action: string, details?: ErrorContext) => 
  unifiedErrorSystem.logUserAction(action, details);

export const logApiCall = (method: string, url: string, status: number, duration?: number) => 
  unifiedErrorSystem.logApiCall(method, url, status, duration);

export const measureOperation = <T>(
  operationName: string,
  operation: () => Promise<T>,
  context?: ErrorContext
) => unifiedErrorSystem.measureOperation(operationName, operation, context);