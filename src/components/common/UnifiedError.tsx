/**
 * Unified Error Display Component
 * Standardizes error states across the application
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UnifiedErrorProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  variant?: 'alert' | 'card' | 'full-page';
  className?: string;
}

export const UnifiedError: React.FC<UnifiedErrorProps> = ({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  showHomeButton = false,
  variant = 'card',
  className
}) => {
  const navigate = useNavigate();

  const errorMessage = React.useMemo(() => {
    if (message) return message;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred. Please try again.';
  }, [message, error]);

  const handleGoHome = () => {
    navigate('/app/dashboard');
  };

  const actionButtons = (
    <div className="flex gap-3 mt-4">
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
      {showHomeButton && (
        <Button onClick={handleGoHome} size="sm">
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      )}
    </div>
  );

  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {errorMessage}
          {(onRetry || showHomeButton) && actionButtons}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'full-page') {
    return (
      <div className={cn(
        'min-h-screen flex items-center justify-center bg-background p-4',
        className
      )}>
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          {(onRetry || showHomeButton) && actionButtons}
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        {(onRetry || showHomeButton) && actionButtons}
      </CardContent>
    </Card>
  );
};

// Convenient pre-configured variants
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <UnifiedError 
    title="Network Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    variant="card"
  />
);

export const NotFoundError: React.FC = () => (
  <UnifiedError 
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    showHomeButton
    variant="full-page"
  />
);

export const PermissionError: React.FC = () => (
  <UnifiedError 
    title="Access Denied"
    message="You don't have permission to access this resource."
    showHomeButton
    variant="card"
  />
);

export const DataLoadError: React.FC<{ onRetry?: () => void; resource?: string }> = ({ 
  onRetry, 
  resource = 'data' 
}) => (
  <UnifiedError 
    title={`Failed to load ${resource}`}
    message={`There was an error loading the ${resource}. Please try again.`}
    onRetry={onRetry}
    variant="card"
  />
);

export default UnifiedError;