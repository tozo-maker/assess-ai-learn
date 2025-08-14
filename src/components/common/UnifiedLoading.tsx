/**
 * Unified Loading Component
 * Standardizes loading states across the application
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'pulse' | 'skeleton' | 'dots';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

export const UnifiedLoading: React.FC<UnifiedLoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  message,
  fullScreen = false,
  className
}) => {
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2 
            className={cn(
              'animate-spin text-primary',
              sizeClasses[size]
            )} 
          />
        );
      
      case 'pulse':
        return (
          <div 
            className={cn(
              'bg-primary/20 rounded-full animate-pulse',
              sizeClasses[size]
            )}
          />
        );
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-primary rounded-full animate-bounce',
                  size === 'sm' ? 'h-1 w-1' : 
                  size === 'md' ? 'h-2 w-2' :
                  size === 'lg' ? 'h-3 w-3' : 'h-4 w-4'
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      case 'skeleton':
        return (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/5" />
          </div>
        );
      
      default:
        return (
          <Loader2 
            className={cn(
              'animate-spin text-primary',
              sizeClasses[size]
            )} 
          />
        );
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-3',
      fullScreen && 'min-h-screen',
      className
    )}>
      {renderLoader()}
      {message && (
        <p className={cn(
          'text-muted-foreground text-center',
          textSizes[size]
        )}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Convenient pre-configured variants
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <UnifiedLoading 
    size="lg" 
    variant="spinner" 
    message={message}
    className="min-h-64"
  />
);

export const ButtonLoader: React.FC = () => (
  <UnifiedLoading size="sm" variant="spinner" />
);

export const CardLoader: React.FC<{ message?: string }> = ({ message }) => (
  <UnifiedLoading 
    size="md" 
    variant="skeleton" 
    message={message}
    className="p-6"
  />
);

export const FullScreenLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <UnifiedLoading 
    size="xl" 
    variant="spinner" 
    message={message}
    fullScreen
  />
);

export default UnifiedLoading;