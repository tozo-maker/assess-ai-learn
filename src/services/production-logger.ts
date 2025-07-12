/**
 * Production-optimized logging service that replaces console.log usage
 * Provides structured logging with proper levels and environment-based output
 */

import { logger } from '@/utils/performance-logger';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type LogContext = Record<string, any>;

class ProductionLogger {
  private isProduction = process.env.NODE_ENV === 'production';
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Debug level logging - only shown in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      logger.debug(message, { context });
    }
  }

  /**
   * Info level logging - shown in development and production
   */
  info(message: string, context?: LogContext): void {
    logger.info(message, { context });
  }

  /**
   * Warning level logging - always shown
   */
  warn(message: string, context?: LogContext): void {
    logger.warn(message, { context });
  }

  /**
   * Error level logging - always shown with full context
   */
  error(message: string, error?: Error, context?: LogContext): void {
    logger.error(message, { 
      error,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
      }
    });
  }

  /**
   * Performance timing utility
   */
  time(label: string): void {
    if (this.isDevelopment) {
      logger.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      logger.timeEnd(label);
    }
  }

  /**
   * Group related log messages
   */
  group(label: string): void {
    if (this.isDevelopment) {
      logger.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      logger.groupEnd();
    }
  }

  /**
   * Log user actions for analytics
   */
  userAction(action: string, details?: LogContext): void {
    this.info(`User Action: ${action}`, {
      type: 'user_action',
      action,
      ...details
    });
  }

  /**
   * Log API calls for monitoring
   */
  apiCall(method: string, url: string, status: number, duration?: number): void {
    const level = status >= 400 ? 'warn' : 'info';
    this[level](`API ${method} ${url}`, {
      type: 'api_call',
      method,
      url,
      status,
      duration
    });
  }

  /**
   * Log component lifecycle events
   */
  componentEvent(component: string, event: string, context?: LogContext): void {
    this.debug(`Component ${component}: ${event}`, {
      type: 'component_event',
      component,
      event,
      ...context
    });
  }
}

export const productionLogger = new ProductionLogger();

// Convenience exports for common patterns
export const logError = (message: string, error?: Error, context?: LogContext) => 
  productionLogger.error(message, error, context);

export const logUserAction = (action: string, details?: LogContext) => 
  productionLogger.userAction(action, details);

export const logApiCall = (method: string, url: string, status: number, duration?: number) => 
  productionLogger.apiCall(method, url, status, duration);

export const logDebug = (message: string, context?: LogContext) => 
  productionLogger.debug(message, context);

export const logInfo = (message: string, context?: LogContext) => 
  productionLogger.info(message, context);