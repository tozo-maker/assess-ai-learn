
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSBodyText,
  DSStatusBadge
} from '@/components/ui/design-system';
import { Progress } from '@/components/ui/progress';

interface TrendData {
  value: string;
  direction: 'up' | 'down' | 'neutral';
  percentage?: number;
  isPositive?: boolean;
}

interface EnhancedMetricCardWithTrendsProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: TrendData;
  priority?: 'high' | 'medium' | 'low';
  progress?: number;
  target?: number;
  sparklineData?: number[];
  className?: string;
}

const EnhancedMetricCardWithTrends: React.FC<EnhancedMetricCardWithTrendsProps> = ({
  title,
  value,
  icon,
  trend,
  priority = 'low',
  progress,
  target,
  sparklineData,
  className = ''
}) => {
  const priorityStyles = {
    high: 'border-l-4 border-l-red-500 bg-red-50 hover:bg-red-100',
    medium: 'border-l-4 border-l-amber-500 bg-amber-50 hover:bg-amber-100',
    low: 'border-l-4 border-l-blue-500 bg-blue-50 hover:bg-blue-100'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className={`h-3 w-3 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`} />;
      case 'down':
        return <TrendingDown className={`h-3 w-3 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`} />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';
    if (trend.isPositive !== undefined) {
      return trend.isPositive ? 'text-green-600' : 'text-red-600';
    }
    return trend.direction === 'up' ? 'text-green-600' : 
           trend.direction === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  const getMiniSparkline = () => {
    if (!sparklineData || sparklineData.length === 0) return null;
    
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    
    return (
      <div className="flex items-end gap-0.5 h-6 w-16">
        {sparklineData.map((point, index) => {
          const height = ((point - min) / range) * 100;
          return (
            <div
              key={index}
              className="bg-blue-400 opacity-70 rounded-sm flex-1"
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <DSCard className={`${priorityStyles[priority]} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <DSCardContent className="p-6">
        {/* Header */}
        <DSFlexContainer justify="between" align="center" className="mb-4">
          <DSBodyText className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </DSBodyText>
          <div className="text-gray-400">
            {icon}
          </div>
        </DSFlexContainer>

        {/* Main Value and Trend */}
        <DSFlexContainer justify="between" align="end" className="mb-3">
          <div className="text-3xl font-bold text-gray-900">
            {value}
          </div>
          {sparklineData && (
            <div className="ml-4">
              {getMiniSparkline()}
            </div>
          )}
        </DSFlexContainer>

        {/* Trend Information */}
        {trend && (
          <DSFlexContainer align="center" gap="xs" className="mb-3">
            {getTrendIcon()}
            <DSBodyText className={`text-sm font-medium ${getTrendColor()}`}>
              {trend.percentage && `${trend.percentage > 0 ? '+' : ''}${trend.percentage}% `}
              {trend.value}
            </DSBodyText>
          </DSFlexContainer>
        )}

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-3">
            <DSFlexContainer justify="between" align="center" className="mb-1">
              <DSBodyText className="text-xs text-gray-500">Progress</DSBodyText>
              <DSBodyText className="text-xs text-gray-500">
                {target ? `${progress}/${target}` : `${progress}%`}
              </DSBodyText>
            </DSFlexContainer>
            <Progress value={target ? (progress / target) * 100 : progress} className="h-2" />
          </div>
        )}

        {/* Priority Badge */}
        {priority !== 'low' && (
          <DSStatusBadge 
            variant={priority === 'high' ? 'danger' : 'warning'} 
            size="sm"
          >
            {priority === 'high' ? 'Needs Attention' : 'Monitor'}
          </DSStatusBadge>
        )}
      </DSCardContent>
    </DSCard>
  );
};

export default EnhancedMetricCardWithTrends;
