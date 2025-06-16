
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for monitoring
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Log to performance service if available
    try {
      // Dynamic import to avoid circular dependencies
      import('@/services/performance-service').then((performanceService) => {
        performanceService.default?.logMetric({
          endpoint: window.location.pathname,
          method: 'ERROR',
          response_time_ms: 0,
          status_code: 500,
          error_message: `${error.name}: ${error.message}`
        });
      }).catch(() => {
        // Fallback to console logging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      });
    } catch {
      // Fallback to console logging
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/app/dashboard';
  };

  private renderFallback = () => {
    const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
    const { level = 'component', showErrorDetails = isDevelopment } = this.props;
    
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Different layouts based on error level
    const isPageLevel = level === 'page';
    const containerClass = isPageLevel 
      ? "min-h-screen flex items-center justify-center p-4 bg-gray-50"
      : "flex items-center justify-center p-4";
    
    const cardClass = isPageLevel 
      ? "w-full max-w-lg"
      : "w-full max-w-md mx-auto";

    return (
      <div className={containerClass}>
        <Card className={cardClass}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">
              {level === 'page' ? 'Something went wrong' : 'Section unavailable'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              {level === 'page' 
                ? "We're sorry, but something unexpected happened. Our team has been notified."
                : "This section is temporarily unavailable. Please try refreshing or contact support if the problem persists."
              }
            </p>
            
            {showErrorDetails && this.state.error && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-medium mb-2">Error Details:</h4>
                <p className="text-sm text-red-600 font-mono break-all">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              {level === 'page' && (
                <Button
                  onClick={this.handleGoHome}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  public render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
