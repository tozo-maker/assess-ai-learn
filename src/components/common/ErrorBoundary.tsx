
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { productionLogger } from '@/services/production-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId;
    
    // Log error with structured logging
    productionLogger.error('React Error Boundary caught error', error, {
      errorId,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo, errorId);
    }
  }

  private async reportErrorToService(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      // This would typically send to your error monitoring service
      // For now, we'll just log it structured
      productionLogger.error('Sending error to monitoring service', error, {
        errorId,
        service: 'error_reporting',
        componentStack: errorInfo.componentStack
      });
    } catch (reportingError) {
      productionLogger.error('Failed to report error to monitoring service', reportingError as Error);
    }
  }

  private handleRetry = () => {
    productionLogger.info('Error boundary retry attempted', {
      errorId: this.state.errorId,
      action: 'retry'
    });
    
    this.setState({ 
      hasError: false, 
      error: undefined,
      errorId: ''
    });
  };

  private handleGoHome = () => {
    productionLogger.info('Error boundary navigation to home', {
      errorId: this.state.errorId,
      action: 'go_home'
    });
    
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-4 bg-muted rounded-lg text-left">
                  <summary className="cursor-pointer font-semibold">Error Details</summary>
                  <pre className="mt-2 text-xs overflow-auto text-destructive">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            {this.state.errorId && (
              <p className="text-xs text-muted-foreground">
                Error ID: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
