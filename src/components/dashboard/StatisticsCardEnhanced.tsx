
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner, Skeleton } from '@/components/ui/transitions';
import { cn } from '@/lib/utils';

interface StatisticsCardEnhancedProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
  };
  progress?: {
    value: number;
    max: number;
    label?: string;
  };
  priority?: 'high' | 'medium' | 'low' | 'none';
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

const StatisticsCardEnhanced: React.FC<StatisticsCardEnhancedProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  progress,
  priority = 'none',
  className,
  onClick,
  isLoading = false,
}) => {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return trend.isPositive !== false ? TrendingUp : ArrowUpRight;
      case 'down':
        return trend.isPositive === false ? TrendingDown : ArrowDownRight;
      default:
        return Minus;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    
    if (trend.isPositive !== undefined) {
      return trend.isPositive ? 'text-emerald-600' : 'text-red-600';
    }
    
    switch (trend.direction) {
      case 'up':
        return 'text-emerald-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityStyles = () => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20';
      case 'medium':
        return 'border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20';
      case 'low':
        return 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
      default:
        return '';
    }
  };

  const getPriorityBadgeVariant = () => {
    switch (priority) {
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'secondary' as const;
      case 'low':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const TrendIcon = getTrendIcon();

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton lines={2} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "group interactive-card",
        getPriorityStyles(),
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={onClick ? `View details for ${title}` : undefined}
    >
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-caption">
                {title}
              </h3>
              {priority !== 'none' && (
                <Badge 
                  variant={getPriorityBadgeVariant()} 
                  className="text-xs px-2 py-0"
                  aria-label={`Priority: ${priority}`}
                >
                  {priority}
                </Badge>
              )}
            </div>
          </div>
          
          {Icon && (
            <div className="flex-shrink-0">
              <div 
                className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors duration-300"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          )}
        </div>

        {/* Main Value Section */}
        <div className="space-y-3">
          <div className="text-hierarchy-2 micro-bounce">
            {value}
          </div>
          
          {/* Trend Section */}
          {trend && (
            <div className="flex items-center gap-2">
              <div 
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 transition-colors duration-200",
                  getTrendColor()
                )}
                aria-label={`Trend: ${trend.direction} ${trend.value}${trend.direction !== 'neutral' ? '%' : ''} ${trend.label}`}
              >
                <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="text-sm font-semibold">
                  {trend.value > 0 && trend.direction !== 'neutral' && '+'}
                  {trend.value}
                  {trend.direction !== 'neutral' && '%'}
                </span>
              </div>
              <span className="text-body-secondary">
                {trend.label}
              </span>
            </div>
          )}

          {/* Progress Section */}
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-body-secondary">
                  {progress.label || 'Progress'}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {Math.round((progress.value / progress.max) * 100)}%
                </span>
              </div>
              <Progress 
                value={(progress.value / progress.max) * 100} 
                className="h-2.5"
                aria-label={`Progress: ${Math.round((progress.value / progress.max) * 100)}%`}
              />
              <div className="text-caption">
                {progress.value} of {progress.max}
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-body-secondary">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCardEnhanced;
