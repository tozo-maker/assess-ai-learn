import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Gauge, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Activity,
  Lock,
  Zap,
  Database,
  Monitor,
  FileText,
  TrendingUp,
  Users,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/hooks/use-toast';
import { securityAuditService, SecurityReport } from '@/services/security-audit';
import { productionReadinessService, ProductionReadinessReport } from '@/services/production-readiness';

interface Phase4DashboardProps {
  onComplete?: () => void;
}

export const Phase4Dashboard: React.FC<Phase4DashboardProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('security');
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  // Security Audit State
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [isRunningSecurityAudit, setIsRunningSecurityAudit] = useState(false);
  
  // Production Readiness State
  const [readinessReport, setReadinessReport] = useState<ProductionReadinessReport | null>(null);
  const [isRunningReadinessCheck, setIsRunningReadinessCheck] = useState(false);

  useEffect(() => {
    if (user?.id) {
      runInitialAssessments();
    }
  }, [user?.id]);

  const runInitialAssessments = async () => {
    if (!user?.id) return;
    
    setIsRunningTests(true);
    try {
      await Promise.all([
        runSecurityAudit(),
        runProductionReadinessCheck()
      ]);
    } catch (error) {
      console.error('Failed to run initial assessments:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const runSecurityAudit = async () => {
    if (!user?.id) return;
    
    setIsRunningSecurityAudit(true);
    try {
      const report = await securityAuditService.runSecurityAudit(user.id);
      setSecurityReport(report);
      
      toast({
        title: "Security Audit Complete",
        description: `Security score: ${report.overall_score}/100`,
        variant: report.overall_score >= 80 ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Security Audit Failed",
        description: "Unable to complete security assessment",
        variant: "destructive"
      });
    } finally {
      setIsRunningSecurityAudit(false);
    }
  };

  const runProductionReadinessCheck = async () => {
    if (!user?.id) return;
    
    setIsRunningReadinessCheck(true);
    try {
      const report = await productionReadinessService.assessProductionReadiness(user.id);
      setReadinessReport(report);
      
      toast({
        title: "Production Readiness Check Complete",
        description: `Overall readiness: ${report.overall_readiness}%`,
        variant: report.overall_readiness >= 80 ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Readiness Check Failed",
        description: "Unable to assess production readiness",
        variant: "destructive"
      });
    } finally {
      setIsRunningReadinessCheck(false);
    }
  };

  const generateSecurityReport = async () => {
    if (!user?.id) return;
    
    try {
      const reportUrl = await securityAuditService.generateSecurityReport(user.id);
      window.open(reportUrl, '_blank');
      
      toast({
        title: "Security Report Generated",
        description: "Detailed security report has been generated"
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate security report",
        variant: "destructive"
      });
    }
  };

  const generateReadinessReport = async () => {
    if (!user?.id) return;
    
    try {
      const reportUrl = await productionReadinessService.generateReadinessReport(user.id);
      window.open(reportUrl, '_blank');
      
      toast({
        title: "Readiness Report Generated",
        description: "Detailed production readiness report has been generated"
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate readiness report",
        variant: "destructive"
      });
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadinessScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Phase 4: Production Readiness & Security</h2>
          <p className="text-gray-600 mt-2">
            Comprehensive security audit and production deployment assessment
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runInitialAssessments}
            disabled={isRunningTests}
            variant="outline"
          >
            <Activity className="w-4 h-4 mr-2" />
            {isRunningTests ? 'Running Tests...' : 'Re-run All Tests'}
          </Button>
          {onComplete && (
            <Button onClick={onComplete} variant="default">
              Complete Phase 4
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className={`text-2xl font-bold ${securityReport ? getSecurityScoreColor(securityReport.overall_score) : ''}`}>
                  {securityReport ? `${securityReport.overall_score}/100` : '--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Production Ready</p>
                <p className={`text-2xl font-bold ${readinessReport ? getReadinessScoreColor(readinessReport.overall_readiness) : ''}`}>
                  {readinessReport ? `${readinessReport.overall_readiness}%` : '--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold">
                  {securityReport && readinessReport 
                    ? securityReport.critical_issues + readinessReport.critical_issues.length
                    : '--'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tests Passed</p>
                <p className="text-2xl font-bold">
                  {readinessReport?.load_test_results 
                    ? readinessReport.load_test_results.filter(t => t.status === 'pass').length
                    : '--'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security">Security Audit</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="readiness">Production Readiness</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Security Audit Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Assessment</CardTitle>
                  <CardDescription>
                    Comprehensive security audit results and recommendations
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={runSecurityAudit}
                    disabled={isRunningSecurityAudit}
                    variant="outline"
                    size="sm"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {isRunningSecurityAudit ? 'Running...' : 'Re-run Audit'}
                  </Button>
                  <Button 
                    onClick={generateSecurityReport}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {securityReport ? (
                <>
                  {/* Security Score Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getSecurityScoreColor(securityReport.overall_score)}`}>
                        {securityReport.overall_score}/100
                      </div>
                      <p className="text-sm text-gray-600">Overall Security Score</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {securityReport.critical_issues}
                      </div>
                      <p className="text-sm text-gray-600">Critical Issues</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {securityReport.high_issues}
                      </div>
                      <p className="text-sm text-gray-600">High Issues</p>
                    </div>
                  </div>

                  {/* Security Categories */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Issues by Category</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(securityReport.categories).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                          <Badge variant={count > 0 ? "destructive" : "secondary"}>
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Critical Issues */}
                  {securityReport.issues.filter(i => i.severity === 'critical').length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Critical Security Issues Found:</strong>
                        <ul className="mt-2 list-disc list-inside">
                          {securityReport.issues
                            .filter(i => i.severity === 'critical')
                            .map(issue => (
                              <li key={issue.id}>{issue.title}</li>
                            ))
                          }
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Security Recommendations</h4>
                    <ul className="space-y-1">
                      {securityReport.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Run security audit to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Real-time performance monitoring and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readinessReport?.performance_metrics ? (
                <div className="space-y-6">
                  {/* Performance Score */}
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getReadinessScoreColor(readinessReport.performance_score)}`}>
                      {readinessReport.performance_score}/100
                    </div>
                    <p className="text-sm text-gray-600">Performance Score</p>
                  </div>

                  {/* Metrics by Component */}
                  <div className="space-y-4">
                    {['Frontend', 'Database', 'API'].map(component => {
                      const componentMetrics = readinessReport.performance_metrics.filter(
                        m => m.component === component
                      );
                      
                      if (componentMetrics.length === 0) return null;
                      
                      return (
                        <div key={component} className="space-y-2">
                          <h4 className="font-semibold flex items-center">
                            {component === 'Frontend' && <Monitor className="w-4 h-4 mr-2" />}
                            {component === 'Database' && <Database className="w-4 h-4 mr-2" />}
                            {component === 'API' && <Zap className="w-4 h-4 mr-2" />}
                            {component}
                          </h4>
                          <div className="grid gap-2">
                            {componentMetrics.map(metric => (
                              <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <span className="font-medium">{metric.metric_name}</span>
                                  <span className="text-sm text-gray-600 ml-2">
                                    {metric.value.toFixed(1)} {metric.unit}
                                  </span>
                                </div>
                                <Badge 
                                  variant={
                                    metric.status === 'good' ? 'secondary' :
                                    metric.status === 'warning' ? 'outline' : 'destructive'
                                  }
                                >
                                  {metric.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gauge className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Run performance assessment to see metrics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Production Readiness Tab */}
        <TabsContent value="readiness" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Production Deployment Assessment</CardTitle>
                  <CardDescription>
                    Comprehensive readiness evaluation and deployment checklist
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={runProductionReadinessCheck}
                    disabled={isRunningReadinessCheck}
                    variant="outline"
                    size="sm"
                  >
                    <Server className="w-4 h-4 mr-2" />
                    {isRunningReadinessCheck ? 'Checking...' : 'Re-check Readiness'}
                  </Button>
                  <Button 
                    onClick={generateReadinessReport}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {readinessReport ? (
                <>
                  {/* Readiness Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getReadinessScoreColor(readinessReport.overall_readiness)}`}>
                        {readinessReport.overall_readiness}%
                      </div>
                      <p className="text-xs text-gray-600">Overall</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getReadinessScoreColor(readinessReport.performance_score)}`}>
                        {readinessReport.performance_score}%
                      </div>
                      <p className="text-xs text-gray-600">Performance</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getReadinessScoreColor(readinessReport.scalability_score)}`}>
                        {readinessReport.scalability_score}%
                      </div>
                      <p className="text-xs text-gray-600">Scalability</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getReadinessScoreColor(readinessReport.reliability_score)}`}>
                        {readinessReport.reliability_score}%
                      </div>
                      <p className="text-xs text-gray-600">Reliability</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getReadinessScoreColor(readinessReport.deployment_score)}`}>
                        {readinessReport.deployment_score}%
                      </div>
                      <p className="text-xs text-gray-600">Deployment</p>
                    </div>
                  </div>

                  {/* Deployment Checklist */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Deployment Checklist</h4>
                    <div className="space-y-2">
                      {readinessReport.deployment_checklist.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            {item.status === 'complete' && <CheckCircle className="h-4 w-4 text-green-600 mr-2" />}
                            {item.status === 'pending' && <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />}
                            {item.status === 'not_applicable' && <div className="h-4 w-4 mr-2" />}
                            <div>
                              <span className="font-medium">{item.item}</span>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={
                              item.status === 'complete' ? 'secondary' :
                              item.status === 'pending' ? 'destructive' : 'outline'
                            }
                          >
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Load Test Results */}
                  {readinessReport.load_test_results.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Load Test Results</h4>
                      <div className="space-y-2">
                        {readinessReport.load_test_results.map((test, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{test.test_name}</span>
                              <Badge 
                                variant={
                                  test.status === 'pass' ? 'secondary' :
                                  test.status === 'warning' ? 'outline' : 'destructive'
                                }
                              >
                                {test.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Users:</span> {test.concurrent_users}
                              </div>
                              <div>
                                <span className="text-gray-600">Requests:</span> {test.total_requests}
                              </div>
                              <div>
                                <span className="text-gray-600">Avg Response:</span> {test.average_response_time}ms
                              </div>
                              <div>
                                <span className="text-gray-600">Error Rate:</span> {test.error_rate}%
                              </div>
                            </div>
                            {test.bottlenecks.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-600">Bottlenecks:</span>
                                <ul className="list-disc list-inside text-sm ml-4">
                                  {test.bottlenecks.map((bottleneck, idx) => (
                                    <li key={idx}>{bottleneck}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Run readiness assessment to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Assessment</CardTitle>
              <CardDescription>
                Educational data privacy and security compliance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityReport?.compliance_checks ? (
                <div className="space-y-6">
                  {/* Compliance Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        {securityReport.compliance_checks.ferpa_compliant ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                      <h3 className="font-semibold">FERPA</h3>
                      <p className="text-sm text-gray-600">
                        Family Educational Rights and Privacy Act
                      </p>
                      <Badge 
                        variant={securityReport.compliance_checks.ferpa_compliant ? "secondary" : "destructive"}
                        className="mt-2"
                      >
                        {securityReport.compliance_checks.ferpa_compliant ? "Compliant" : "Non-Compliant"}
                      </Badge>
                    </div>

                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        {securityReport.compliance_checks.gdpr_compliant ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                      <h3 className="font-semibold">GDPR</h3>
                      <p className="text-sm text-gray-600">
                        General Data Protection Regulation
                      </p>
                      <Badge 
                        variant={securityReport.compliance_checks.gdpr_compliant ? "secondary" : "destructive"}
                        className="mt-2"
                      >
                        {securityReport.compliance_checks.gdpr_compliant ? "Compliant" : "Non-Compliant"}
                      </Badge>
                    </div>

                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        {securityReport.compliance_checks.coppa_compliant ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                      <h3 className="font-semibold">COPPA</h3>
                      <p className="text-sm text-gray-600">
                        Children's Online Privacy Protection Act
                      </p>
                      <Badge 
                        variant={securityReport.compliance_checks.coppa_compliant ? "secondary" : "destructive"}
                        className="mt-2"
                      >
                        {securityReport.compliance_checks.coppa_compliant ? "Compliant" : "Non-Compliant"}
                      </Badge>
                    </div>
                  </div>

                  {/* Compliance Recommendations */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Compliance Recommendations</h4>
                    <div className="space-y-3">
                      {!securityReport.compliance_checks.ferpa_compliant && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>FERPA Compliance Required:</strong> Ensure proper handling of educational records and implement necessary consent mechanisms.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {!securityReport.compliance_checks.gdpr_compliant && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>GDPR Compliance Required:</strong> Implement data subject rights, privacy notices, and consent management.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {!securityReport.compliance_checks.coppa_compliant && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>COPPA Compliance Required:</strong> Implement parental consent mechanisms for users under 13 years old.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Run security audit to see compliance status</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};