import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  status?: 'success' | 'warning' | 'error' | 'pending';
  label?: string;
  description?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'circular';
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  status,
  label,
  description,
  showPercentage = true,
  size = 'md',
  variant = 'default',
}) => {
  const percentage = Math.round((value / max) * 100);
  
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getProgressColor = () => {
    if (status) {
      switch (status) {
        case 'success':
          return 'bg-success';
        case 'warning':
          return 'bg-warning';
        case 'error':
          return 'bg-destructive';
        default:
          return 'bg-primary';
      }
    }
    
    // Default color based on percentage
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-warning';
    if (percentage >= 40) return 'bg-primary';
    return 'bg-destructive';
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  if (variant === 'circular') {
    const radius = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
    const strokeWidth = size === 'sm' ? 2 : 3;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <svg
            className="transform -rotate-90"
            width={radius * 2 + strokeWidth * 2}
            height={radius * 2 + strokeWidth * 2}
          >
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-muted-foreground/20"
            />
            <circle
              cx={radius + strokeWidth}
              cy={radius + strokeWidth}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                "transition-all duration-300 ease-in-out",
                status === 'success' ? 'text-success' :
                status === 'warning' ? 'text-warning' :
                status === 'error' ? 'text-destructive' :
                percentage >= 80 ? 'text-success' :
                percentage >= 60 ? 'text-warning' :
                'text-primary'
              )}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "font-medium",
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
            )}>
              {percentage}%
            </span>
          </div>
        </div>
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{label}</span>
                {getStatusIcon()}
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {label && <span className="text-sm font-medium">{label}</span>}
            {getStatusIcon()}
          </div>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">
              {percentage}%
            </span>
          )}
        </div>
      )}
      
      <Progress 
        value={percentage} 
        className={cn("w-full", sizeClasses[size])}
      />
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

// Multi-step progress indicator
interface Step {
  label: string;
  status: 'completed' | 'current' | 'pending' | 'error';
  description?: string;
}

interface StepProgressProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  orientation = 'horizontal',
}) => {
  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'current':
        return <div className="h-5 w-5 rounded-full bg-primary border-2 border-background" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-muted" />;
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex flex-col items-center">
              {getStepIcon(step.status)}
              {index < steps.length - 1 && (
                <div className="h-8 w-px bg-muted mt-2" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className={cn(
                "text-sm font-medium",
                step.status === 'completed' ? 'text-success' :
                step.status === 'current' ? 'text-primary' :
                step.status === 'error' ? 'text-destructive' :
                'text-muted-foreground'
              )}>
                {step.label}
              </div>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center text-center">
            {getStepIcon(step.status)}
            <div className={cn(
              "text-xs font-medium mt-2",
              step.status === 'completed' ? 'text-success' :
              step.status === 'current' ? 'text-primary' :
              step.status === 'error' ? 'text-destructive' :
              'text-muted-foreground'
            )}>
              {step.label}
            </div>
            {step.description && (
              <p className="text-xs text-muted-foreground mt-1 max-w-20">
                {step.description}
              </p>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-px bg-muted mx-4" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};