
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Database, 
  Shield, 
  Settings, 
  Activity, 
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ComprehensiveAuditReport, AuditResult } from '@/types/audit';
import { comprehensiveAuditService } from '@/services/comprehensive-audit-service';

const ComprehensiveAudit = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [auditReport, setAuditReport] = useState<ComprehensiveAuditReport | null>(null);
  const { toast } = useToast();

  const runComprehensiveAudit = async () => {
    setIsRunning(true);
    setAuditReport(null);
    
    try {
      toast({
        title: "Starting Comprehensive Audit",
        description: "Running complete application assessment..."
      });

      const report = await comprehensiveAuditService.runCompleteAudit();
      setAuditReport(report);

      const criticalCount = report.criticalIssues.length;
      const overallScore = report.overallScore;

      if (overallScore >= 90 && criticalCount === 0) {
        toast({
          title: "Audit Complete - Excellent! 🎉",
          description: `Overall score: ${overallScore.toFixed(1)}% - Production ready!`
        });
      } else if (overallScore >= 80) {
        toast({
          title: "Audit Complete - Good ✅",
          description: `Overall score: ${overallScore.toFixed(1)}% - ${criticalCount} critical issues to address`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Audit Complete - Needs Work ⚠️",
          description: `Overall score: ${overallScore.toFixed(1)}% - ${criticalCount} critical issues found`
        });
      }
    } catch (error) {
      console.error('Comprehensive audit failed:', error);
      toast({
        variant: "destructive",
        title: "Audit Failed",
        description: "An error occurred while running the comprehensive audit"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: 'pass' | 'fail' | 'warning') => {
    const variants = {
      pass: "default" as const,
      fail: "destructive" as const,
      warning: "secondary" as const
    };
    
    return (
      <Badge variant={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'database':
        return <Database className="h-5 w-5 text-blue-600" />;
      case 'security':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'functionality':
        return <Settings className="h-5 w-5 text-green-600" />;
      case 'performance':
        return <Zap className="h-5 w-5 text-yellow-600" />;
      case 'monitoring':
        return <Activity className="h-5 w-5 text-purple-600" />;
      case 'configuration':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderAuditResults = (results: AuditResult[]) => {
    if (results.length === 0) return null;

    return (
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getStatusIcon(result.status)}
                <h4 className="font-medium">{result.check}</h4>
              </div>
              <div className="flex items-center space-x-2">
                {result.duration && (
                  <span className="text-xs text-gray-500">
                    {result.duration}ms
                  </span>
                )}
                {getStatusBadge(result.status)}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{result.message}</p>
            
            {result.recommendation && (
              <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                <p className="font-medium text-blue-800 mb-1">Recommendation:</p>
                <p className="text-blue-700">{result.recommendation}</p>
              </div>
            )}
            
            {result.details && (
              <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {typeof result.details === 'string' 
                    ? result.details 
                    : JSON.stringify(result.details, null, 2)
                  }
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comprehensive Application Audit</h1>
        <p className="text-gray-600 mt-2">
          Complete assessment of functionality, performance, security, and production readiness
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span>Application Health Assessment</span>
          </CardTitle>
          <CardDescription>
            Comprehensive audit covering database, security, functionality, performance, monitoring, and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div className="space-y-2">
              <Database className="h-8 w-8 text-blue-600 mx-auto" />
              <p className="text-sm font-medium">Database</p>
            </div>
            <div className="space-y-2">
              <Shield className="h-8 w-8 text-red-600 mx-auto" />
              <p className="text-sm font-medium">Security</p>
            </div>
            <div className="space-y-2">
              <Settings className="h-8 w-8 text-green-600 mx-auto" />
              <p className="text-sm font-medium">Functionality</p>
            </div>
            <div className="space-y-2">
              <Zap className="h-8 w-8 text-yellow-600 mx-auto" />
              <p className="text-sm font-medium">Performance</p>
            </div>
            <div className="space-y-2">
              <Activity className="h-8 w-8 text-purple-600 mx-auto" />
              <p className="text-sm font-medium">Monitoring</p>
            </div>
            <div className="space-y-2">
              <Settings className="h-8 w-8 text-gray-600 mx-auto" />
              <p className="text-sm font-medium">Configuration</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-center">
            <Button 
              onClick={runComprehensiveAudit} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  <span>Running Comprehensive Audit...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Start Comprehensive Audit</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {auditReport && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Audit Summary</span>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {auditReport.overallScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={auditReport.overallScore} className="w-full" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {auditReport.categories.reduce((acc, cat) => 
                      acc + cat.checks.filter(c => c.status === 'pass').length, 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Passed Checks</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {auditReport.categories.reduce((acc, cat) => 
                      acc + cat.checks.filter(c => c.status === 'warning').length, 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {auditReport.criticalIssues.length}
                  </div>
                  <div className="text-sm text-gray-600">Critical Issues</div>
                </div>
              </div>

              {auditReport.criticalIssues.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{auditReport.criticalIssues.length} critical issue{auditReport.criticalIssues.length > 1 ? 's' : ''} found</strong> - 
                    Address these immediately for production readiness
                  </AlertDescription>
                </Alert>
              )}

              {auditReport.recommendations.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Top Recommendations:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {auditReport.recommendations.slice(0, 5).map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Category Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
              <TabsTrigger value="critical">Critical Issues</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auditReport.categories.map((category, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        {getCategoryIcon(category.name)}
                        <span>{category.name}</span>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            {category.score.toFixed(1)}%
                          </span>
                          <Badge 
                            variant={category.score >= 90 ? "default" : category.score >= 70 ? "secondary" : "destructive"}
                          >
                            {category.score >= 90 ? "Excellent" : category.score >= 70 ? "Good" : "Needs Work"}
                          </Badge>
                        </div>
                        <Progress value={category.score} className="w-full" />
                        <div className="text-sm text-gray-600">
                          {category.checks.filter(c => c.status === 'pass').length}/{category.checks.length} checks passed
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              {auditReport.categories.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getCategoryIcon(category.name)}
                      <span>{category.name} - {category.score.toFixed(1)}%</span>
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderAuditResults(category.checks)}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="critical" className="space-y-6">
              {auditReport.criticalIssues.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-600">
                      <XCircle className="h-6 w-6" />
                      <span>Critical Issues ({auditReport.criticalIssues.length})</span>
                    </CardTitle>
                    <CardDescription>
                      These issues must be addressed immediately for production readiness
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderAuditResults(auditReport.criticalIssues)}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Critical Issues Found!</h3>
                    <p className="text-gray-500">
                      Your application has passed all critical checks and is ready for production.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            <span>Audit Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Database:</strong> Tests connectivity, query performance, data integrity, and indexing</p>
            <p><strong>Security:</strong> Validates authentication, RLS policies, HTTPS, and security headers</p>
            <p><strong>Functionality:</strong> Tests core workflows, CRUD operations, and feature completeness</p>
            <p><strong>Performance:</strong> Measures load times, query speed, bundle size, and memory usage</p>
            <p><strong>Monitoring:</strong> Checks error tracking, logging, and observability systems</p>
            <p><strong>Configuration:</strong> Validates build settings, environment, and deployment readiness</p>
            <p><strong>Scoring:</strong> 90%+ Excellent, 80-89% Good, 70-79% Needs Improvement, &lt;70% Significant Work Needed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveAudit;
