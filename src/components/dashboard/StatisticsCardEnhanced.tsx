
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatisticsCard } from '@/types/dashboard';

interface StatisticsCardEnhancedProps extends StatisticsCard {
  onClick?: () => void;
  className?: string;
}

const StatisticsCardEnhanced: React.FC<StatisticsCardEnhancedProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  progress,
  priority = 'none',
  onClick,
  className
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    if (trend.isPositive !== undefined) {
      return trend.isPositive ? 'text-green-600' : 'text-red-600';
    }
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityBadge = () => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Attention</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Info</Badge>;
      default:
        return null;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer hover:scale-[1.02]",
        priority === 'high' && "border-red-200 bg-red-50/50",
        priority === 'medium' && "border-yellow-200 bg-yellow-50/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {getPriorityBadge()}
          <div className="p-1 bg-primary/10 rounded">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold">{value}</div>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
            
            {progress && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{progress.label}</span>
                  <span className="font-medium">{progress.value}/{progress.max}</span>
                </div>
                <Progress 
                  value={(progress.value / progress.max) * 100} 
                  className="h-2"
                />
              </div>
            )}
            
            {trend && TrendIcon && (
              <div className="flex items-center gap-1">
                <TrendIcon className={cn("h-3 w-3", getTrendColor())} />
                <span className={cn("text-xs font-medium", getTrendColor())}>
                  {trend.value > 0 && trend.direction !== 'neutral' && '+'}
                  {trend.value}
                  {trend.direction !== 'neutral' && '%'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsCardEnhanced;
