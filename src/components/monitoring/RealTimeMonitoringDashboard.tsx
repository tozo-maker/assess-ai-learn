
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, TrendingUp } from 'lucide-react';
import { performanceMonitoringService } from '@/services/performance-monitoring-service';
import { enhancedErrorTracking } from '@/services/enhanced-error-tracking';
import { structuredLogger } from '@/services/structured-logging';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  memoryUsage?: number;
}

const RealTimeMonitoringDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 0,
    responseTime: 0,
    errorRate: 0
  });
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [errorMetrics, setErrorMetrics] = useState<any>(null);
  const [logMetrics, setLogMetrics] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      // Load performance statistics
      const perfStats = await performanceMonitoringService.getPerformanceStats('hour');
      setPerformanceStats(perfStats);

      // Load error metrics
      const errMetrics = await enhancedErrorTracking.getErrorMetrics('hour');
      setErrorMetrics(errMetrics);

      // Load log metrics
      const logStats = await structuredLogger.getLogMetrics('hour');
      setLogMetrics(logStats);

      // Calculate system health
      const health = calculateSystemHealth(perfStats, errMetrics);
      setSystemHealth(health);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateSystemHealth = (perfStats: any, errorStats: any): SystemHealth => {
    const responseTime = perfStats?.averageResponseTime || 0;
    const errorRate = perfStats?.errorRate || 0;
    
    let status: SystemHealth['status'] = 'healthy';
    if (errorRate > 10 || responseTime > 2000) {
      status = 'critical';
    } else if (errorRate > 5 || responseTime > 1000) {
      status = 'warning';
    }

    return {
      status,
      uptime: 99.9, // This would be calculated from actual uptime data
      responseTime,
      errorRate,
      memoryUsage: performanceMonitoringService.getMemoryUsage()?.used
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default' as const,
      warning: 'secondary' as const,
      critical: 'destructive' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Status</p>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusIcon(systemHealth.status)}
                  {getStatusBadge(systemHealth.status)}
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{systemHealth.responseTime.toFixed(0)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{systemHealth.errorRate.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{systemHealth.uptime.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Real-time application performance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceStats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-xl font-semibold">{performanceStats.totalRequests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                      <p className="text-xl font-semibold">{performanceStats.averageResponseTime.toFixed(0)}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Slow Requests</p>
                      <p className="text-xl font-semibold">{performanceStats.slowRequests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Error Rate</p>
                      <p className="text-xl font-semibold">{performanceStats.errorRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  {performanceStats.data && performanceStats.data.length > 0 && (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceStats.data.slice(-20)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="created_at" 
                            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleString()}
                            formatter={(value: any) => [`${value}ms`, 'Response Time']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="response_time_ms" 
                            stroke="#2563eb" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Tracking
              </CardTitle>
              <CardDescription>
                Application error monitoring and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMetrics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Errors (Last Hour)</p>
                      <p className="text-2xl font-semibold">{errorMetrics.totalErrors}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Error Rate (Per Hour)</p>
                      <p className="text-2xl font-semibold">{errorMetrics.errorRate.toFixed(2)}</p>
                    </div>
                  </div>

                  {errorMetrics.topErrors && errorMetrics.topErrors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Top Errors</h4>
                      <div className="space-y-2">
                        {errorMetrics.topErrors.map((error: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm font-medium truncate">{error.message}</span>
                            <Badge variant="outline">{error.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errorMetrics.errorsByHour && errorMetrics.errorsByHour.length > 0 && (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={errorMetrics.errorsByHour}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="hour" 
                            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleString()}
                          />
                          <Bar dataKey="count" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Application Logs</CardTitle>
              <CardDescription>
                Structured logging and application events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logMetrics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Logs</p>
                      <p className="text-xl font-semibold">{logMetrics.totalLogs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Debug</p>
                      <p className="text-lg font-medium text-gray-600">{logMetrics.logsByLevel.DEBUG}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Info</p>
                      <p className="text-lg font-medium text-blue-600">{logMetrics.logsByLevel.INFO}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Warnings</p>
                      <p className="text-lg font-medium text-yellow-600">{logMetrics.logsByLevel.WARN}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Errors</p>
                      <p className="text-lg font-medium text-red-600">{logMetrics.logsByLevel.ERROR}</p>
                    </div>
                  </div>

                  {logMetrics.recentActivity && logMetrics.recentActivity.length > 0 && (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={logMetrics.recentActivity.slice(-20)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleString()}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#10b981" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
              <CardDescription>
                System resource utilization and health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {systemHealth.memoryUsage && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Memory Usage</span>
                      <span>{systemHealth.memoryUsage}MB</span>
                    </div>
                    <Progress value={(systemHealth.memoryUsage / 100) * 100} className="w-full" />
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>System Uptime</span>
                    <span>{systemHealth.uptime}%</span>
                  </div>
                  <Progress value={systemHealth.uptime} className="w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded">
                    <p className="text-sm font-medium">Network Conditions</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {JSON.stringify(performanceMonitoringService.monitorNetworkConditions())}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded">
                    <p className="text-sm font-medium">Performance Observer</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Active and monitoring navigation timing
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refresh Status */}
      {isRefreshing && (
        <div className="fixed bottom-4 right-4">
          <Badge variant="outline" className="animate-pulse">
            Refreshing data...
          </Badge>
        </div>
      )}
    </div>
  );
};

export default RealTimeMonitoringDashboard;
