/**
 * Enhanced Production Logger with Remote Log Ingestion
 * Consolidates all logging and sends batches to edge function in production
 */

import { supabase } from '@/integrations/supabase/client';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  level: LogLevel;
  message: string;
  endpoint: string;
  method?: string;
  status_code?: number;
  response_time_ms?: number;
  error_message?: string;
  user_id?: string;
  context?: Record<string, any>;
  timestamp?: string;
}

class ProductionLogger {
  private logQueue: LogEntry[] = [];
  private readonly batchSize = 10;
  private readonly flushInterval = 5000; // 5 seconds
  private readonly sessionId = this.generateSessionId();
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly enableRemote = process.env.NODE_ENV === 'production';
  private isProcessing = false;

  constructor() {
    this.startBatchProcessor();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startBatchProcessor(): void {
    setInterval(() => {
      if (this.logQueue.length > 0 && !this.isProcessing) {
        this.flushLogs();
      }
    }, this.flushInterval);
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context);
    }
    this.log('DEBUG', message, { context });
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    }
    this.log('INFO', message, { context });
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    }
    this.log('WARN', message, { context });
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    }
    this.log('ERROR', message, { error, context });
  }

  // Performance logging methods
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // API call logging
  apiCall(method: string, url: string, status: number, duration?: number, userId?: string): void {
    const level = status >= 400 ? 'WARN' : 'INFO';
    this.log(level, `API ${method} ${url}`, {
      context: {
        type: 'api_call',
        method,
        url,
        status,
        duration,
        userId
      },
      status_code: status,
      response_time_ms: duration
    });
  }

  // User action logging
  userAction(action: string, userId?: string, details?: Record<string, any>): void {
    this.log('INFO', `User Action: ${action}`, {
      context: {
        type: 'user_action',
        action,
        userId,
        ...details
      }
    });
  }

  // Component lifecycle events
  componentEvent(component: string, event: string, context?: Record<string, any>): void {
    this.debug(`Component ${component}: ${event}`, {
      type: 'component_event',
      component,
      event,
      ...context
    });
  }

  private log(level: LogLevel, message: string, options?: {
    error?: Error;
    context?: Record<string, any>;
    status_code?: number;
    response_time_ms?: number;
  }): void {
    const logEntry: LogEntry = {
      level,
      message,
      endpoint: window.location.pathname,
      method: level,
      status_code: options?.status_code || this.levelToStatusCode(level),
      response_time_ms: options?.response_time_ms || 0,
      error_message: options?.error?.message,
      user_id: this.getCurrentUserId(),
      context: options?.context,
      timestamp: new Date().toISOString()
    };

    this.logQueue.push(logEntry);

    // Immediate flush for errors or when batch is full
    if (level === 'ERROR' || this.logQueue.length >= this.batchSize) {
      this.flushLogs();
    }
  }

  private async flushLogs(): Promise<void> {
    if (!this.enableRemote || this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const logsToFlush = [...this.logQueue];
    this.logQueue = [];

    try {
      // Use edge function for log ingestion
      const { error } = await supabase.functions.invoke('ingest-logs', {
        body: {
          logs: logsToFlush,
          session_id: this.sessionId
        }
      });

      if (error) {
        console.error('[ProductionLogger] Failed to send logs:', error);
        this.storeLogsLocally(logsToFlush);
      }
    } catch (error) {
      console.error('[ProductionLogger] Error flushing logs:', error);
      this.storeLogsLocally(logsToFlush);
    } finally {
      this.isProcessing = false;
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

  private getCurrentUserId(): string | undefined {
    try {
      // This is async but we need sync for logging, so we'll use a cached value
      // The actual user ID will be set by auth state changes
      return (window as any).__currentUserId;
    } catch {
      return undefined;
    }
  }

  private storeLogsLocally(logs: LogEntry[]): void {
    if (!this.isDevelopment) return;
    
    try {
      const existing = JSON.parse(localStorage.getItem('production_logs') || '[]');
      const combined = [...existing, ...logs].slice(-100); // Keep last 100 logs
      localStorage.setItem('production_logs', JSON.stringify(combined));
    } catch (error) {
      // Silent fail for localStorage issues
    }
  }

  // Force flush all pending logs (useful for page unload)
  async forceFlush(): Promise<void> {
    if (this.logQueue.length > 0) {
      await this.flushLogs();
    }
  }
}

export const productionLogger = new ProductionLogger();

// Auto-flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    productionLogger.forceFlush();
  });
}

// Convenience exports for backward compatibility
export const logError = (message: string, error?: Error, context?: Record<string, any>) => 
  productionLogger.error(message, error, context);

export const logUserAction = (action: string, details?: Record<string, any>) => 
  productionLogger.userAction(action, undefined, details);

export const logApiCall = (method: string, url: string, status: number, duration?: number) => 
  productionLogger.apiCall(method, url, status, duration);

export const logDebug = (message: string, context?: Record<string, any>) => 
  productionLogger.debug(message, context);

export const logInfo = (message: string, context?: Record<string, any>) => 
  productionLogger.info(message, context);