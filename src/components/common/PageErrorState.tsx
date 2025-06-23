
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface PageErrorStateProps {
  error?: Error | string;
  onRetry?: () => void;
  title?: string;
  description?: string;
  showNavigationOptions?: boolean;
  className?: string;
}

const PageErrorState: React.FC<PageErrorStateProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
  description = 'There was an error loading the page. Please try again.',
  showNavigationOptions = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className={`flex items-center justify-center min-h-64 ${className}`}>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{description}</p>
          
          {errorMessage && (
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700">
                View error details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded border overflow-auto">
                {errorMessage}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {showNavigationOptions && (
              <Button 
                variant="secondary" 
                onClick={() => navigate('/app/dashboard')}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageErrorState;
