import { toast } from '@/hooks/use-toast';

export interface ErrorReport {
  id: string;
  timestamp: number;
  component: string;
  error: Error;
  context: Record<string, any>;
  userId?: string;
  resolved?: boolean;
}

export interface ErrorStats {
  totalErrors: number;
  unresolvedErrors: number;
  errorsByComponent: Record<string, number>;
  mostFrequentError: [string, number] | undefined;
}

class ErrorService {
  private static instance: ErrorService;
  private errors: ErrorReport[] = [];
  private maxErrors = 100;

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  logError(
    component: string, 
    error: Error, 
    context: Record<string, any> = {}, 
    userId?: string,
    showToast = false
  ): string {
    const errorReport: ErrorReport = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      component,
      error,
      context,
      userId,
      resolved: false
    };

    this.errors.unshift(errorReport);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${component}] Error:`, {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date(errorReport.timestamp).toISOString()
      });
    }

    // Show toast notification if requested
    if (showToast) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'An unexpected error occurred',
      });
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTracking(errorReport);
    }

    return errorReport.id;
  }

  logWarning(component: string, message: string, context: Record<string, any> = {}): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${component}] Warning:`, message, context);
    }
  }

  logInfo(component: string, message: string, context: Record<string, any> = {}): void {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[${component}] Info:`, message, context);
    }
  }

  getRecentErrors(limit = 10): ErrorReport[] {
    return this.errors.slice(0, limit);
  }

  getErrorStats(): ErrorStats {
    const recent = this.errors.filter(e => Date.now() - e.timestamp < 60 * 60 * 1000); // Last hour
    const byComponent = recent.reduce((acc, error) => {
      acc[error.component] = (acc[error.component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: recent.length,
      unresolvedErrors: recent.filter(e => !e.resolved).length,
      errorsByComponent: byComponent,
      mostFrequentError: Object.entries(byComponent).sort(([,a], [,b]) => b - a)[0]
    };
  }

  markErrorResolved(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  clearErrors(): void {
    this.errors = [];
  }

  private sendToErrorTracking(error: ErrorReport): void {
    // Placeholder for external error tracking service
    // e.g., Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      console.log('Would send to error tracking:', error);
    }
  }
}

export const errorService = ErrorService.getInstance();

// Hook for using error service in components
export const useErrorHandler = (component: string) => {
  const logError = (error: Error, context: Record<string, any> = {}, showToast = false) => {
    return errorService.logError(component, error, context, undefined, showToast);
  };

  const logWarning = (message: string, context: Record<string, any> = {}) => {
    errorService.logWarning(component, message, context);
  };

  const logInfo = (message: string, context: Record<string, any> = {}) => {
    errorService.logInfo(component, message, context);
  };

  return { logError, logWarning, logInfo };
};
