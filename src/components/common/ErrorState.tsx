
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorStateProps {
  error?: Error;
  onRetry?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
  description = 'There was an error loading the data. Please try again.',
  className = ''
}) => {
  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{description}</p>
        {error && (
          <details className="text-xs text-gray-500">
            <summary>Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs">
              {error.message}
            </pre>
          </details>
        )}
        {onRetry && (
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorState;
