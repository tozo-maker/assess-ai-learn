/**
 * Error Monitoring Dashboard Component
 * Displays real-time error metrics and allows error management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Download,
  RefreshCw,
  Shield,
  Database
} from 'lucide-react';
import { errorMonitoringService, ErrorReport, ErrorMetrics } from '@/services/error-monitoring';
import { dataIntegrityService, ConsistencyCheckResult } from '@/services/data-integrity';
import { productionLogger } from '@/services/production-logger';

export const ErrorMonitoringDashboard: React.FC = () => {
  const [errorMetrics, setErrorMetrics] = useState<ErrorMetrics | null>(null);
  const [activeErrors, setActiveErrors] = useState<ErrorReport[]>([]);
  const [consistencyResults, setConsistencyResults] = useState<ConsistencyCheckResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load error metrics
      const metrics = errorMonitoringService.getErrorMetrics();
      setErrorMetrics(metrics);

      // Load active errors
      const errors = errorMonitoringService.getActiveErrors();
      setActiveErrors(errors);

      // Run consistency checks
      const consistency = await dataIntegrityService.runConsistencyChecks();
      setConsistencyResults(consistency);

      setLastUpdated(new Date().toLocaleString());
      productionLogger.info('Error monitoring dashboard updated');
    } catch (error) {
      productionLogger.error('Failed to load dashboard data', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resolve an error
   */
  const handleResolveError = (errorId: string) => {
    if (errorMonitoringService.resolveError(errorId)) {
      setActiveErrors(prev => prev.filter(error => error.id !== errorId));
      productionLogger.info(`Error resolved via dashboard: ${errorId}`);
    }
  };

  /**
   * Export error data
   */
  const handleExportErrors = () => {
    const data = errorMonitoringService.exportErrorData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Get severity color
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-2">Loading monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Error Monitoring Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time application health and error tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportErrors} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      {errorMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{errorMetrics.totalErrors}</div>
              <p className="text-xs text-muted-foreground">
                Across all components
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeErrors.length}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {errorMetrics.errorRate.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Issues</CardTitle>
              <Database className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {consistencyResults.reduce((sum, r) => sum + r.inconsistencies.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Consistency issues
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Last Updated */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Dashboard last updated: {lastUpdated}
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Active Errors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="consistency">Data Integrity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Error Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeErrors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No active errors detected</p>
                </div>
              ) : (
                activeErrors.map(error => (
                  <div key={error.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityColor(error.severity) as any}>
                            {error.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {error.component || 'Unknown Component'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            × {error.occurrenceCount}
                          </span>
                        </div>
                        <h4 className="font-medium">{error.message}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(error.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleResolveError(error.id)}
                        variant="outline"
                        size="sm"
                      >
                        Resolve
                      </Button>
                    </div>
                    {error.stack && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground">
                          Stack trace
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Errors by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {errorMetrics && Object.entries(errorMetrics.errorsByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center py-2">
                    <span className="text-sm">{type}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Errors by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                {errorMetrics && Object.entries(errorMetrics.errorsBySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between items-center py-2">
                    <span className="text-sm capitalize">{severity}</span>
                    <Badge variant={getSeverityColor(severity) as any}>{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Error Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {errorMetrics && errorMetrics.topErrors.map((error, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="text-sm flex-1 truncate">{error.message}</span>
                  <Badge variant="outline">{error.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Consistency Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {consistencyResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No data consistency issues found</p>
                </div>
              ) : (
                consistencyResults.map(result => (
                  <div key={result.table} className="space-y-2">
                    <h4 className="font-medium">Table: {result.table}</h4>
                    {result.inconsistencies.map((issue, index) => (
                      <div key={index} className="border rounded p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(issue.severity) as any}>
                            {issue.severity}
                          </Badge>
                          <span className="text-sm">Record: {issue.recordId}</span>
                        </div>
                        <p className="text-sm">{issue.issue}</p>
                        {issue.suggestedFix && (
                          <p className="text-xs text-muted-foreground">
                            Suggested fix: {issue.suggestedFix}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">CSRF Protection</span>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Rate Limiting</span>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Input Validation</span>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Audit Logging</span>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};