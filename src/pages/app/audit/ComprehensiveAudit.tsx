
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Shield, 
  Settings, 
  TrendingUp, 
  Eye, 
  Wrench,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { ComprehensiveAuditReport, AuditCategory } from '@/types/audit';

const ComprehensiveAudit = () => {
  const [auditReport, setAuditReport] = useState<ComprehensiveAuditReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const categoryIcons: Record<string, React.ComponentType<any>> = {
    database: Database,
    security: Shield,
    functionality: Settings,
    performance: TrendingUp,
    monitoring: Eye,
    configuration: Wrench
  };

  const runComprehensiveAudit = async () => {
    setIsRunning(true);
    setError(null);
    setProgress(0);
    setCurrentCategory(null);

    try {
      // Import the audit service dynamically to handle missing files gracefully
      let comprehensiveAuditService;
      try {
        const module = await import('@/services/comprehensive-audit-service');
        comprehensiveAuditService = module.comprehensiveAuditService;
      } catch (importError) {
        console.error('Failed to import audit service:', importError);
        throw new Error('Audit service is not available. Please check the system configuration.');
      }

      // Simulate progress updates
      const categories = ['database', 'security', 'functionality', 'performance', 'monitoring', 'configuration'];
      
      for (let i = 0; i < categories.length; i++) {
        setCurrentCategory(categories[i]);
        setProgress(((i + 1) / categories.length) * 100);
        
        // Add a small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const report = await comprehensiveAuditService.runCompleteAudit();
      setAuditReport(report);
      
      toast({
        title: "Audit Complete",
        description: `System audit completed with ${report.overallScore.toFixed(1)}% overall score`
      });
    } catch (auditError) {
      console.error('Audit failed:', auditError);
      const errorMessage = auditError instanceof Error ? auditError.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Audit Failed",
        description: errorMessage
      });
    } finally {
      setIsRunning(false);
      setCurrentCategory(null);
      setProgress(0);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comprehensive System Audit</h1>
            <p className="text-muted-foreground">
              Complete analysis of system health, security, and performance
            </p>
          </div>
          
          <Button
            onClick={runComprehensiveAudit}
            disabled={isRunning}
            size="lg"
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Run Complete Audit
              </>
            )}
          </Button>
        </div>

        {isRunning && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {currentCategory ? `Auditing ${currentCategory}...` : 'Preparing audit...'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <XCircle className="h-5 w-5" />
                Audit Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
              <Button
                onClick={runComprehensiveAudit}
                variant="outline"
                className="mt-4"
                size="sm"
              >
                Retry Audit
              </Button>
            </CardContent>
          </Card>
        )}

        {auditReport && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getScoreIcon(auditReport.overallScore)}
                  Overall System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {auditReport.overallScore.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {auditReport.criticalIssues.length} critical issues found
                    </p>
                  </div>
                  <Badge className={getScoreColor(auditReport.overallScore)}>
                    {auditReport.overallScore >= 90 ? 'Excellent' :
                     auditReport.overallScore >= 80 ? 'Good' :
                     auditReport.overallScore >= 70 ? 'Fair' : 'Poor'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Category Results */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {auditReport.categories.map((category) => {
                const IconComponent = categoryIcons[category.id] || Settings;
                return (
                  <Card key={category.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <IconComponent className="h-4 w-4" />
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            {category.score.toFixed(0)}%
                          </span>
                          {getScoreIcon(category.score)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.checks.filter(c => c.status === 'pass').length}/{category.checks.length} checks passed
                        </p>
                        <div className="space-y-1">
                          {category.checks.slice(0, 3).map((check, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              {check.status === 'pass' ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : check.status === 'warning' ? (
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span className="truncate">{check.check}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Critical Issues */}
            {auditReport.criticalIssues.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-5 w-5" />
                    Critical Issues ({auditReport.criticalIssues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditReport.criticalIssues.map((issue, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg">
                        <div className="font-medium text-red-800">
                          {issue.category.toUpperCase()}: {issue.check}
                        </div>
                        <div className="text-sm text-red-700 mt-1">
                          {issue.message}
                        </div>
                        {issue.recommendation && (
                          <div className="text-sm text-red-600 mt-2 italic">
                            Recommendation: {issue.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {auditReport.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    Actions to improve your system health and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {auditReport.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!auditReport && !isRunning && !error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <PlayCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to Run Audit</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Run Complete Audit" to analyze your system's health, security, and performance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ComprehensiveAudit;
