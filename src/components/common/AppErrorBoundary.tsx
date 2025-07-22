import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { errorService } from '@/services/error-service';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = errorService.logError(
      this.props.componentName || 'AppErrorBoundary',
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    );
    
    this.setState({ errorId });
  }

  private handleRetry = () => {
    if (this.state.errorId) {
      errorService.markErrorResolved(this.state.errorId);
    }
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  private handleGoHome = () => {
    if (this.state.errorId) {
      errorService.markErrorResolved(this.state.errorId);
    }
    window.location.href = '/app/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred in the {this.props.componentName || 'application'}. 
                This has been logged for our team to investigate.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    Error details (Development only)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-32 p-2 bg-muted rounded">
                    {this.state.error.stack || this.state.error.message}
                  </pre>
                </details>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
              
              {this.state.errorId && (
                <p className="text-xs text-muted-foreground text-center">
                  Error ID: {this.state.errorId.slice(0, 8)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;