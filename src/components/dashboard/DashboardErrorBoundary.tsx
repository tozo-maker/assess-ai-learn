
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSButton,
  DSBodyText,
  DSFlexContainer
} from '@/components/ui/design-system';

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<DashboardErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error for debugging
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    
    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      const { error, retryCount } = this.state;
      const maxRetries = this.props.maxRetries || 3;

      if (Fallback && error) {
        return <Fallback error={error} retry={this.handleRetry} />;
      }

      return (
        <DSCard className="border-red-200 bg-red-50">
          <DSCardHeader>
            <DSFlexContainer align="center" gap="sm">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <DSCardTitle className="text-red-800">
                Dashboard Error
              </DSCardTitle>
            </DSFlexContainer>
          </DSCardHeader>
          <DSCardContent>
            <DSBodyText className="text-red-700 mb-4">
              {error?.message || 'An unexpected error occurred while loading the dashboard.'}
            </DSBodyText>
            
            <DSFlexContainer gap="sm">
              {retryCount < maxRetries && (
                <DSButton 
                  variant="primary" 
                  size="sm" 
                  onClick={this.handleRetry}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry ({maxRetries - retryCount} left)
                </DSButton>
              )}
              
              <DSButton 
                variant="secondary" 
                size="sm" 
                onClick={this.handleReset}
              >
                Reset Dashboard
              </DSButton>
              
              <DSButton 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </DSButton>
            </DSFlexContainer>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <summary className="cursor-pointer font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </DSCardContent>
        </DSCard>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
