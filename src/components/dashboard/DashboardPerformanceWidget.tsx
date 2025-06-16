
import React from 'react';
import { Activity, Clock, Database, Zap, TrendingUp, TrendingDown } from 'lucide-react';
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

const DashboardPerformanceWidget: React.FC = () => {
  const [stats, setStats] = React.useState({
    avgResponseTime: 0,
    slowQueries: 0,
    errorRate: 0,
    totalRequests: 0,
    memoryUsage: 0,
    score: 100
  });

  React.useEffect(() => {
    const updateStats = () => {
      const perfStats = dashboardPerformanceService.getPerformanceStats();
      const score = dashboardPerformanceService.getDashboardScore();
      setStats({ ...perfStats, score });
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusVariant = (value: number, thresholds: { good: number; warning: number }): "success" | "warning" | "danger" => {
    if (value <= thresholds.good) return 'success';
    if (value <= thresholds.warning) return 'warning';
    return 'danger';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    return score >= 70 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const performanceItems = [
    {
      icon: <Clock className="h-4 w-4" />,
      label: 'Response Time',
      value: `${stats.avgResponseTime}ms`,
      status: getStatusVariant(stats.avgResponseTime, { good: 200, warning: 500 })
    },
    {
      icon: <Database className="h-4 w-4" />,
      label: 'Slow Queries',
      value: stats.slowQueries.toString(),
      status: getStatusVariant(stats.slowQueries, { good: 0, warning: 2 })
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: 'Error Rate',
      value: `${stats.errorRate}%`,
      status: getStatusVariant(stats.errorRate, { good: 1, warning: 5 })
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: 'Memory Usage',
      value: `${stats.memoryUsage}MB`,
      status: getStatusVariant(stats.memoryUsage, { good: 50, warning: 100 })
    }
  ];

  return (
    <DSCard>
      <DSCardHeader>
        <DSFlexContainer justify="between" align="center">
          <DSCardTitle>Dashboard Performance</DSCardTitle>
          <DSFlexContainer align="center" gap="sm" className={getScoreColor(stats.score)}>
            {getScoreIcon(stats.score)}
            <DSBodyText className="font-semibold">{stats.score}/100</DSBodyText>
          </DSFlexContainer>
        </DSFlexContainer>
      </DSCardHeader>
      <DSCardContent>
        <div className="grid grid-cols-2 gap-3">
          {performanceItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <DSFlexContainer align="center" gap="sm">
                <div className="text-gray-500">{item.icon}</div>
                <DSBodyText className="text-sm font-medium">{item.label}</DSBodyText>
              </DSFlexContainer>
              <DSFlexContainer align="center" justify="between">
                <DSBodyText className="font-semibold">{item.value}</DSBodyText>
                <DSStatusBadge variant={item.status} size="sm">
                  {item.status === 'success' ? 'Good' : item.status === 'warning' ? 'Fair' : 'Poor'}
                </DSStatusBadge>
              </DSFlexContainer>
            </div>
          ))}
        </div>
        
        {stats.score < 70 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <DSBodyText className="text-sm text-yellow-800">
              Dashboard performance needs attention. Consider refreshing or checking network connectivity.
            </DSBodyText>
          </div>
        )}
      </DSCardContent>
    </DSCard>
  );
};

export default DashboardPerformanceWidget;
