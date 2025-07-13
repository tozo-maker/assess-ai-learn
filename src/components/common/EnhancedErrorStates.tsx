import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Mail, Wifi, Server, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

interface ErrorStateProps {
  type?: 'network' | 'server' | 'validation' | 'permission' | 'generic';
  title?: string;
  message?: string;
  details?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive';
    icon?: React.ReactNode;
  }>;
  className?: string;
  showDetails?: boolean;
}

export const EnhancedErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  details,
  actions = [],
  className,
  showDetails = false
}) => {
  const { announceMessage } = useAccessibility();
  const [expanded, setExpanded] = React.useState(showDetails);

  React.useEffect(() => {
    if (title && message) {
      announceMessage(`Error: ${title}. ${message}`, 'assertive');
    }
  }, [title, message, announceMessage]);

  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <Wifi className="h-12 w-12 text-semantic-danger" />,
          defaultTitle: 'Connection Problem',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
          color: 'text-semantic-danger'
        };
      case 'server':
        return {
          icon: <Server className="h-12 w-12 text-semantic-warning" />,
          defaultTitle: 'Server Error',
          defaultMessage: 'Our servers are experiencing issues. Please try again in a few moments.',
          color: 'text-semantic-warning'
        };
      case 'validation':
        return {
          icon: <AlertCircle className="h-12 w-12 text-semantic-warning" />,
          defaultTitle: 'Invalid Input',
          defaultMessage: 'Please correct the highlighted fields and try again.',
          color: 'text-semantic-warning'
        };
      case 'permission':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-semantic-warning" />,
          defaultTitle: 'Access Denied',
          defaultMessage: 'You don\'t have permission to perform this action.',
          color: 'text-semantic-warning'
        };
      default:
        return {
          icon: <AlertTriangle className="h-12 w-12 text-semantic-danger" />,
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          color: 'text-semantic-danger'
        };
    }
  };

  const config = getErrorConfig();
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  const defaultActions = () => {
    switch (type) {
      case 'network':
        return [
          {
            label: 'Retry',
            onClick: () => window.location.reload(),
            icon: <RefreshCw className="h-4 w-4" />
          }
        ];
      case 'server':
        return [
          {
            label: 'Try Again',
            onClick: () => window.location.reload(),
            icon: <RefreshCw className="h-4 w-4" />
          },
          {
            label: 'Contact Support',
            onClick: () => window.open('mailto:support@learnspark.ai'),
            variant: 'outline' as const,
            icon: <Mail className="h-4 w-4" />
          }
        ];
      default:
        return [
          {
            label: 'Go Back',
            onClick: () => window.history.back(),
            variant: 'outline' as const,
            icon: <ArrowLeft className="h-4 w-4" />
          }
        ];
    }
  };

  const finalActions = actions.length > 0 ? actions : defaultActions();

  return (
    <div className={cn('flex items-center justify-center min-h-64', className)}>
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            {config.icon}
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {displayTitle}
          </h2>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className={cn('text-sm', config.color)}>
            {displayMessage}
          </p>
          
          {details && (
            <div className="text-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {expanded ? 'Hide' : 'Show'} Details
              </Button>
              
              {expanded && (
                <Alert className="mt-2 text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error Details</AlertTitle>
                  <AlertDescription className="text-xs font-mono mt-2">
                    {details}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        
        {finalActions.length > 0 && (
          <CardFooter className="flex flex-col gap-2">
            {finalActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'default'}
                className="w-full"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

// Inline error component for forms and smaller contexts
export const InlineError: React.FC<{
  message: string;
  className?: string;
}> = ({ message, className }) => {
  const { announceMessage } = useAccessibility();

  React.useEffect(() => {
    announceMessage(message, 'assertive');
  }, [message, announceMessage]);

  return (
    <div 
      className={cn('flex items-center space-x-2 text-semantic-danger text-sm', className)}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

// Success message component
export const SuccessMessage: React.FC<{
  message: string;
  className?: string;
  onDismiss?: () => void;
}> = ({ message, className, onDismiss }) => {
  const { announceMessage } = useAccessibility();

  React.useEffect(() => {
    announceMessage(message, 'polite');
  }, [message, announceMessage]);

  return (
    <Alert className={cn('border-semantic-success bg-semantic-success-light', className)}>
      <AlertCircle className="h-4 w-4 text-semantic-success" />
      <AlertTitle className="text-semantic-success">Success</AlertTitle>
      <AlertDescription className="text-semantic-success">
        {message}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="ml-2 h-auto p-1 text-semantic-success hover:text-semantic-success-hover"
          >
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

// Warning message component
export const WarningMessage: React.FC<{
  message: string;
  className?: string;
  onDismiss?: () => void;
}> = ({ message, className, onDismiss }) => {
  const { announceMessage } = useAccessibility();

  React.useEffect(() => {
    announceMessage(message, 'polite');
  }, [message, announceMessage]);

  return (
    <Alert className={cn('border-semantic-warning bg-semantic-warning-light', className)}>
      <AlertTriangle className="h-4 w-4 text-semantic-warning" />
      <AlertTitle className="text-semantic-warning">Warning</AlertTitle>
      <AlertDescription className="text-semantic-warning">
        {message}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="ml-2 h-auto p-1 text-semantic-warning hover:text-semantic-warning-hover"
          >
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};