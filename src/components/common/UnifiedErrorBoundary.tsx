/**
 * Unified Error Boundary Component
 * Replaces multiple error boundary implementations with a single, configurable solution
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { unifiedErrorSystem, ErrorSeverity } from '@/services/unified-error-system';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  severity?: ErrorSeverity;
  componentName?: string;
  showErrorDetails?: boolean;
  allowRetry?: boolean;
  allowReset?: boolean;
  allowReload?: boolean;
  className?: string;
}

class UnifiedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    const componentName = this.props.componentName || 'UnknownComponent';
    
    // Log to unified error system
    unifiedErrorSystem.handleComponentError(error, errorInfo, componentName);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3;
    
    if (this.state.retryCount < maxRetries) {
      unifiedErrorSystem.logUserAction('error_boundary_retry', {
        component: this.props.componentName,
        retryCount: this.state.retryCount + 1,
        errorId: this.state.errorId
      });

      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    unifiedErrorSystem.logUserAction('error_boundary_reset', {
      component: this.props.componentName,
      errorId: this.state.errorId
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: null
    });
  };

  handleReload = () => {
    unifiedErrorSystem.logUserAction('error_boundary_reload', {
      component: this.props.componentName,
      errorId: this.state.errorId
    });

    window.location.reload();
  };

  getSeverityColor(): string {
    switch (this.props.severity) {
      case 'CRITICAL': return 'border-red-600 bg-red-50';
      case 'HIGH': return 'border-red-400 bg-red-25';
      case 'MEDIUM': return 'border-yellow-400 bg-yellow-25';
      case 'LOW': return 'border-blue-400 bg-blue-25';
      default: return 'border-red-400 bg-red-25';
    }
  }

  getSeverityIcon() {
    switch (this.props.severity) {
      case 'CRITICAL': return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'HIGH': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'MEDIUM': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'LOW': return <Bug className="h-5 w-5 text-blue-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  }

  getErrorTitle(): string {
    const componentName = this.props.componentName || 'Component';
    switch (this.props.severity) {
      case 'CRITICAL': return `Critical Error in ${componentName}`;
      case 'HIGH': return `Error in ${componentName}`;
      case 'MEDIUM': return `Problem with ${componentName}`;
      case 'LOW': return `Minor Issue in ${componentName}`;
      default: return `Error in ${componentName}`;
    }
  }

  getErrorMessage(): string {
    const { error } = this.state;
    const defaultMessage = 'An unexpected error occurred. Please try again.';
    
    if (!error) return defaultMessage;
    
    // In production, show user-friendly messages
    if (process.env.NODE_ENV === 'production') {
      return error.message || defaultMessage;
    }
    
    // In development, show detailed messages
    return error.message || defaultMessage;
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { fallback: Fallback, maxRetries = 3, allowRetry = true, allowReset = true, allowReload = false } = this.props;
    const { error, retryCount, errorId } = this.state;

    // Use custom fallback if provided
    if (Fallback && error) {
      return <Fallback error={error} retry={this.handleRetry} reset={this.handleReset} />;
    }

    const canRetry = allowRetry && retryCount < maxRetries;
    const severityColor = this.getSeverityColor();

    return (
      <div className={`w-full max-w-2xl mx-auto p-4 ${this.props.className || ''}`}>
        <Card className={severityColor}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {this.getSeverityIcon()}
              <div>
                <div className="text-lg font-semibold">
                  {this.getErrorTitle()}
                </div>
                {errorId && (
                  <div className="text-xs text-gray-500 font-normal mt-1">
                    Error ID: {errorId}
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {this.getErrorMessage()}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry ({maxRetries - retryCount} left)
                </Button>
              )}
              
              {allowReset && (
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Reset
                </Button>
              )}
              
              {allowReload && (
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
              )}
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.props.showErrorDetails !== false && error && (
              <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Development Error Details
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-red-600">
                      {error.message}
                    </pre>
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-600 text-xs max-h-32 overflow-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-600 text-xs max-h-32 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Production Help */}
            {process.env.NODE_ENV === 'production' && (
              <div className="text-sm text-gray-600">
                If this problem persists, please contact support with the Error ID above.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default UnifiedErrorBoundary;