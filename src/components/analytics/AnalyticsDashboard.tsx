import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, Users, Clock, TrendingUp, BarChart3, Eye, Zap } from 'lucide-react';
import { analyticsService } from '@/services/analytics-service';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PerformanceData {
  timestamp: number;
  value: number;
  name: string;
}

interface SystemMetric {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  error_message?: string;
  created_at: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [behaviorEvents, setBehaviorEvents] = useState<any[]>([]);
  const [errorReports, setErrorReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Load local analytics data
      const localPerformance = analyticsService.getPerformanceMetrics();
      const localBehavior = analyticsService.getBehaviorEvents();
      const localErrors = analyticsService.getErrorReports();

      setPerformanceData(localPerformance);
      setBehaviorEvents(localBehavior);
      setErrorReports(localErrors);

      // Load system metrics from Supabase
      const { data: metrics } = await supabase
        .from('system_performance_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (metrics) {
        setSystemMetrics(metrics);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const flushAnalytics = async () => {
    await analyticsService.flushAnalytics();
    await loadAnalyticsData();
  };

  const getWebVitalsData = () => {
    return performanceData
      .filter(metric => ['LCP', 'FID', 'CLS'].includes(metric.name))
      .map(metric => ({
        name: metric.name,
        value: metric.value,
        timestamp: new Date(metric.timestamp).toLocaleTimeString()
      }));
  };

  const getPageLoadData = () => {
    return performanceData
      .filter(metric => metric.name === 'PageLoad')
      .map(metric => ({
        time: new Date(metric.timestamp).toLocaleTimeString(),
        loadTime: metric.value
      }));
  };

  const getErrorStats = () => {
    const errorsByType = errorReports.reduce((acc, error) => {
      acc[error.error_type] = (acc[error.error_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorsByType).map(([type, count]) => ({
      type,
      count
    }));
  };

  const getBehaviorStats = () => {
    const eventsByType = behaviorEvents.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(eventsByType).map(([type, count]) => ({
      type,
      count
    }));
  };

  const getSystemPerformanceMetrics = () => {
    const avgResponseTime = systemMetrics.length > 0 
      ? systemMetrics.reduce((sum, metric) => sum + metric.response_time_ms, 0) / systemMetrics.length 
      : 0;

    const errorRate = systemMetrics.length > 0
      ? (systemMetrics.filter(m => m.status_code >= 400).length / systemMetrics.length) * 100
      : 0;

    const totalRequests = systemMetrics.length;

    return {
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      totalRequests
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 animate-spin" />
            <span>Loading analytics data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const systemStats = getSystemPerformanceMetrics();
  const webVitalsData = getWebVitalsData();
  const pageLoadData = getPageLoadData();
  const errorStats = getErrorStats();
  const behaviorStats = getBehaviorStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor application performance, user behavior, and system health
          </p>
        </div>
        <Button onClick={flushAnalytics} variant="outline">
          <Zap className="h-4 w-4 mr-2" />
          Flush Analytics
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              System performance metric
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              Of total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              System requests logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Events</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{behaviorEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Tracked user interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="errors">Error Tracking</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                {webVitalsData.length > 0 ? (
                  <div className="space-y-2">
                    {webVitalsData.map((vital, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{vital.name}</span>
                        <Badge variant={
                          vital.name === 'LCP' && vital.value > 2500 ? 'destructive' :
                          vital.name === 'FID' && vital.value > 100 ? 'destructive' :
                          vital.name === 'CLS' && vital.value > 0.1 ? 'destructive' :
                          'secondary'
                        }>
                          {vital.name === 'CLS' ? vital.value.toFixed(3) : `${Math.round(vital.value)}ms`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No performance data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Load Times</CardTitle>
              </CardHeader>
              <CardContent>
                {pageLoadData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={pageLoadData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="loadTime" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No page load data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Interaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {behaviorStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={behaviorStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No user behavior data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent User Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {behaviorEvents.slice(0, 10).map((event, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{event.event_type}</Badge>
                      <span>{event.page}</span>
                      {event.element && <span className="text-muted-foreground">• {event.element}</span>}
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {errorStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No error data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {errorReports.slice(0, 10).map((error, index) => (
                  <div key={index} className="border rounded p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive">{error.error_type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{error.error_message}</p>
                    <p className="text-xs text-muted-foreground">{error.page}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {systemMetrics.slice(0, 20).map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={metric.status_code >= 400 ? 'destructive' : 'secondary'}>
                        {metric.status_code}
                      </Badge>
                      <span className="font-medium">{metric.method}</span>
                      <span>{metric.endpoint}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">{metric.response_time_ms}ms</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(metric.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};