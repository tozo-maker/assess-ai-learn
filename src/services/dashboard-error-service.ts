interface DashboardError {
  id: string;
  timestamp: number;
  component: string;
  error: Error;
  context: Record<string, any>;
  userId?: string;
  resolved?: boolean;
}

class DashboardErrorService {
  private static instance: DashboardErrorService;
  private errors: DashboardError[] = [];
  private maxErrors = 50;

  static getInstance(): DashboardErrorService {
    if (!DashboardErrorService.instance) {
      DashboardErrorService.instance = new DashboardErrorService();
    }
    return DashboardErrorService.instance;
  }

  logError(component: string, error: Error, context: Record<string, any> = {}, userId?: string): void {
    const errorLog: DashboardError = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      component,
      error,
      context,
      userId,
      resolved: false
    };

    this.errors.unshift(errorLog);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console with structured data
    console.error(`[Dashboard Error] ${component}:`, {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date(errorLog.timestamp).toISOString()
    });

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTracking(errorLog);
    }
  }

  getRecentErrors(limit = 10): DashboardError[] {
    return this.errors.slice(0, limit);
  }

  getErrorStats() {
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

  private sendToErrorTracking(error: DashboardError): void {
    // Placeholder for external error tracking service
    // e.g., Sentry, LogRocket, etc.
    console.log('Would send to error tracking:', error);
  }
}

export const dashboardErrorService = DashboardErrorService.getInstance();

// React hook for error logging
export const useDashboardErrorLogger = (component: string) => {
  const { user } = { user: null }; // Replace with actual auth context

  return React.useCallback((error: Error, context: Record<string, any> = {}) => {
    dashboardErrorService.logError(component, error, context, user?.id);
  }, [component, user?.id]);
};
