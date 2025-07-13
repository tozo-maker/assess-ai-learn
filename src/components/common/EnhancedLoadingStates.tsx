import React from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const EnhancedLoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  size = 'md',
  message = 'Loading...',
  className
}) => {
  const { reducedMotion, announceMessage } = useAccessibility();

  React.useEffect(() => {
    announceMessage(message);
  }, [message, announceMessage]);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2 
            className={cn(
              'animate-spin text-primary',
              sizeClasses[size],
              reducedMotion && 'animate-none'
            )} 
          />
        );
      
      case 'skeleton':
        return (
          <div className={cn(
            'bg-muted rounded animate-pulse',
            size === 'sm' && 'h-4',
            size === 'md' && 'h-6', 
            size === 'lg' && 'h-8',
            'w-full',
            reducedMotion && 'animate-none bg-muted/50'
          )} />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-primary rounded-full',
                  sizeClasses[size],
                  !reducedMotion && 'animate-pulse',
                  `animation-delay-${i * 100}`
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn(
            'bg-primary/20 rounded animate-pulse',
            sizeClasses[size],
            reducedMotion && 'animate-none'
          )} />
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className={cn('flex items-center justify-center space-x-2', className)}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {renderVariant()}
      {message && variant !== 'skeleton' && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
};

interface ProgressLoadingProps {
  progress: number;
  message?: string;
  className?: string;
}

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  progress,
  message = 'Loading...',
  className
}) => {
  const { announceMessage } = useAccessibility();

  React.useEffect(() => {
    if (progress % 25 === 0 || progress === 100) {
      announceMessage(`${message} ${progress}% complete`);
    }
  }, [progress, message, announceMessage]);

  return (
    <div className={cn('w-full space-y-2', className)} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{message}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'idle';
  message?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  className
}) => {
  const { announceMessage } = useAccessibility();

  React.useEffect(() => {
    if (message) {
      announceMessage(message, status === 'error' ? 'assertive' : 'polite');
    }
  }, [status, message, announceMessage]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-semantic-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-semantic-danger" />;
      default:
        return null;
    }
  };

  const getColor = () => {
    switch (status) {
      case 'loading':
        return 'text-primary';
      case 'success':
        return 'text-semantic-success';
      case 'error':
        return 'text-semantic-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div 
      className={cn('flex items-center space-x-2', className)}
      role="status"
      aria-live={status === 'error' ? 'assertive' : 'polite'}
    >
      {getIcon()}
      {message && (
        <span className={cn('text-sm', getColor())}>{message}</span>
      )}
    </div>
  );
};

// Skeleton components for different content types
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('card-standard space-y-4', className)}>
    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded animate-pulse" />
      <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
    </div>
    <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded animate-pulse" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="h-3 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    ))}
  </div>
);