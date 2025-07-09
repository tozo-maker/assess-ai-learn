import React from 'react';
import { logger } from './performance-logger';

/**
 * Enhanced error boundary utilities for better error handling
 */

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  eventType?: string;
}

export class ErrorBoundaryHelper {
  static logError(error: Error, errorInfo: ErrorInfo, componentName: string) {
    // Log to our performance logger
    logger.error(`Error Boundary: ${componentName}`, {
      error,
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: errorInfo.errorBoundary,
        eventType: errorInfo.eventType,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });

    // In production, you might want to send to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service (e.g., Sentry, Bugsnag)
      // This is where you'd integrate with your preferred error tracking service
    }
  }

  static createErrorReport(error: Error, errorInfo: ErrorInfo) {
    return {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      // Add any additional context that might be helpful
      reactVersion: React.version,
      buildTimestamp: process.env.REACT_APP_BUILD_TIME || 'unknown'
    };
  }

  static handleAsyncError(error: Error, context?: Record<string, any>) {
    logger.error('Async Error Caught', {
      error,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    });

    // Prevent the error from crashing the app
    if (process.env.NODE_ENV === 'development') {
      console.error('Async error details:', error, context);
    }
  }
}

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ErrorBoundaryHelper.handleAsyncError(
      new Error(event.reason?.message || 'Unhandled Promise Rejection'),
      {
        type: 'unhandledrejection',
        reason: event.reason,
        promise: event.promise
      }
    );
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    ErrorBoundaryHelper.handleAsyncError(
      event.error || new Error(event.message),
      {
        type: 'uncaught',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    );
  });
};