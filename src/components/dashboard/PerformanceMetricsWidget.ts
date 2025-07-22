
import React from 'react';
import { Activity, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSStatusBadge
} from '@/components/ui/design-system';
import { dashboardPerformanceService } from '@/services/dashboard-performance-service';

const PerformanceMetricsWidget: React.FC = () => {
  const [metrics, setMetrics] = React.useState({
    responseTime: 0,
    activeQueries: 0,
    errorRate: 0,
    cacheHitRate: 0,
    score: 100
  });

  React.useEffect(() => {
    const updateMetrics = () => {
      const stats = dashboardPerformanceService.getPerformanceStats();
      const score = dashboardPerformanceService.getDashboardScore();
      
      setMetrics({
        responseTime: stats.avgResponseTime,
        activeQueries: 5, // Mock data
        errorRate: stats.errorRate,
        cacheHitRate: 85, // Mock data
        score
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const performanceItems = [
    {
      icon: <Clock className="h-4 w-4" />,
      label: 'Response Time',
      value: `${metrics.responseTime}ms`,
      status: metrics.responseTime <= 200 ? 'success' : metrics.responseTime <= 500 ? 'warning' : 'danger'
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: 'Cache Hit Rate',
      value: `${metrics.cacheHitRate}%`,
      status: metrics.cacheHitRate >= 80 ? 'success' : metrics.cacheHitRate >= 60 ? 'warning' : 'danger'
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'Error Rate',
      value: `${metrics.errorRate}%`,
      status: metrics.errorRate <= 1 ? 'success' : metrics.errorRate <= 5 ? 'warning' : 'danger'
    }
  ];

  return (
    <DSCard>
      <DSCardHeader>
        <DSFlexContainer justify="between" align="center">
          <DSCardTitle>System Performance</DSCardTitle>
          <DSFlexContainer align="center" gap="sm">
            <DSBodyText className={`font-semibold ${getStatusColor(100 - metrics.score, { good: 10, warning: 30 })}`}>
              {metrics.score}/100
            </DSBodyText>
          </DSFlexContainer>
        </DSFlexContainer>
      </DSCardHeader>
      <DSCardContent>
        <div className="grid grid-cols-1 gap-3">
          {performanceItems.map((item, index) => (
            <DSFlexContainer key={index} justify="between" align="center">
              <DSFlexContainer align="center" gap="sm">
                <div className="text-gray-500">{item.icon}</div>
                <DSBodyText className="text-sm">{item.label}</DSBodyText>
              </DSFlexContainer>
              <DSFlexContainer align="center" gap="sm">
                <DSBodyText className="font-medium">{item.value}</DSBodyText>
                <DSStatusBadge variant={item.status as any} size="sm">
                  {item.status === 'success' ? 'Good' : item.status === 'warning' ? 'Fair' : 'Poor'}
                </DSStatusBadge>
              </DSFlexContainer>
            </DSFlexContainer>
          ))}
        </div>

        {metrics.score < 80 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <DSFlexContainer align="center" gap="sm">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <DSBodyText className="text-sm text-yellow-800">
                Performance monitoring detected some issues. Consider refreshing or checking connectivity.
              </DSBodyText>
            </DSFlexContainer>
          </div>
        )}
      </DSCardContent>
    </DSCard>
  );
};

export default PerformanceMetricsWidget;
