
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ProductionErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/app/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-gray-700 mb-4">
                  We're sorry, but something unexpected happened. This error has been logged and we'll work to fix it.
                </p>
                
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Error ID:</strong> {this.state.errorId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {new Date().toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Error details for development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <summary className="cursor-pointer text-red-800 font-medium flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Developer Details
                  </summary>
                  <div className="mt-3 space-y-2">
                    <div>
                      <strong className="text-red-800">Error:</strong>
                      <pre className="text-sm text-red-700 mt-1 whitespace-pre-wrap">
                        {this.state.error.message}
                      </pre>
                    </div>
                    <div>
                      <strong className="text-red-800">Stack Trace:</strong>
                      <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong className="text-red-800">Component Stack:</strong>
                        <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  If this problem persists, please contact support with the error ID above.
                </p>
                <Button variant="link" className="text-sm flex items-center gap-1 mx-auto">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProductionErrorBoundary;
