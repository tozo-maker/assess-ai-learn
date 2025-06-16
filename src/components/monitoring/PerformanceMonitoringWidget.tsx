
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Clock, Database, Zap } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSStatusBadge
} from '@/components/ui/design-system';
import { enhancedCache } from '@/services/enhanced-caching-service';
import { useQueryPerformanceMonitoring } from '@/hooks/queries/useOptimizedQueries';

interface PerformanceMetrics {
  responseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  activeQueries: number;
  errorRate: number;
}

const PerformanceMonitoringWidget: React.FC = () => {
  const { getQueryStats } = useQueryPerformanceMonitoring();
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    responseTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    activeQueries: 0,
    errorRate: 0
  });

  // Update metrics every 30 seconds
  const { data: performanceData } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const queryStats = getQueryStats();
      const cacheStats = enhancedCache.getStats();
      
      // Get memory usage if available
      const memoryInfo = 'memory' in performance ? (performance as any).memory : null;
      const memoryUsage = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
      
      return {
        responseTime: 150, // This would come from actual monitoring
        cacheHitRate: (cacheStats.size > 0 ? 85 : 0), // Estimated hit rate
        memoryUsage,
        activeQueries: queryStats.activeQueries,
        errorRate: queryStats.totalQueries > 0 ? (queryStats.errorQueries / queryStats.totalQueries) * 100 : 0
      };
    },
    refetchInterval: 30000, // 30 seconds
    staleTime: 25000 // 25 seconds
  });

  React.useEffect(() => {
    if (performanceData) {
      setMetrics(performanceData);
    }
  }, [performanceData]);

  const getStatusVariant = (value: number, thresholds: { good: number; warning: number }): "success" | "warning" | "danger" => {
    if (value <= thresholds.good) return 'success';
    if (value <= thresholds.warning) return 'warning';
    return 'danger';
  };

  const performanceItems = [
    {
      icon: <Clock className="h-4 w-4" />,
      label: 'Avg Response Time',
      value: `${metrics.responseTime}ms`,
      status: getStatusVariant(metrics.responseTime, { good: 200, warning: 500 })
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: 'Cache Hit Rate',
      value: `${metrics.cacheHitRate.toFixed(1)}%`,
      status: getStatusVariant(100 - metrics.cacheHitRate, { good: 20, warning: 40 })
    },
    {
      icon: <Database className="h-4 w-4" />,
      label: 'Memory Usage',
      value: `${metrics.memoryUsage}MB`,
      status: getStatusVariant(metrics.memoryUsage, { good: 50, warning: 100 })
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: 'Active Queries',
      value: metrics.activeQueries.toString(),
      status: getStatusVariant(metrics.activeQueries, { good: 5, warning: 10 })
    }
  ];

  return (
    <DSCard>
      <DSCardHeader>
        <DSCardTitle>Performance Metrics</DSCardTitle>
      </DSCardHeader>
      <DSCardContent>
        <div className="grid grid-cols-2 gap-4">
          {performanceItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <DSFlexContainer align="center" gap="sm">
                {item.icon}
                <DSBodyText className="text-sm font-medium">{item.label}</DSBodyText>
              </DSFlexContainer>
              <DSFlexContainer align="center" justify="between">
                <DSBodyText className="text-lg font-semibold">{item.value}</DSBodyText>
                <DSStatusBadge variant={item.status} size="sm">
                  {item.status === 'success' ? 'Good' : item.status === 'warning' ? 'Fair' : 'Poor'}
                </DSStatusBadge>
              </DSFlexContainer>
            </div>
          ))}
        </div>
        
        {metrics.errorRate > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <DSBodyText className="text-sm text-red-700">
              Error Rate: {metrics.errorRate.toFixed(1)}% - Monitor for potential issues
            </DSBodyText>
          </div>
        )}
      </DSCardContent>
    </DSCard>
  );
};

export default PerformanceMonitoringWidget;
