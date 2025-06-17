
import React from 'react';
import { LucideIcon } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSBodyText,
  DSStatusBadge
} from '@/components/ui/design-system';

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
  };
  priority?: 'high' | 'medium' | 'low';
  className?: string;
}

const EnhancedMetricCard: React.FC<EnhancedMetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  priority = 'low',
  className = ''
}) => {
  const priorityStyles = {
    high: 'border-l-4 border-l-red-500 bg-red-50',
    medium: 'border-l-4 border-l-amber-500 bg-amber-50',
    low: 'border-l-4 border-l-blue-500 bg-blue-50'
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.isPositive !== undefined) {
      return trend.isPositive ? 'text-green-600' : 'text-red-600';
    }
    return trend.direction === 'up' ? 'text-green-600' : 
           trend.direction === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <DSCard className={`${priorityStyles[priority]} hover:shadow-lg transition-all duration-200 ${className}`}>
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

        {/* Main Value */}
        <div className="mb-3">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {value}
          </div>
          {trend && (
            <DSFlexContainer align="center" gap="xs">
              <DSBodyText className={`text-sm font-medium ${getTrendColor()}`}>
                {trend.value}
              </DSBodyText>
            </DSFlexContainer>
          )}
        </div>

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

export default EnhancedMetricCard;
