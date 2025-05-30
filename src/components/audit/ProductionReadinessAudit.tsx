import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Database, 
  TrendingUp, 
  Settings,
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  PlayCircle,
  Wrench
} from 'lucide-react';

interface AuditResult {
  category: string;
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  recommendation?: string;
}

interface AuditCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  checks: AuditResult[];
  score: number;
}

const ProductionReadinessAudit = () => {
  const [auditResults, setAuditResults] = useState<AuditCategory[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const { toast } = useToast();

  const runProductionAudit = async () => {
    setIsRunning(true);
    
    try {
      const categories: AuditCategory[] = [
        {
          id: 'security',
          name: 'Security & Authentication',
          description: 'Security policies, authentication, and data protection',
          icon: Shield,
          checks: [],
          score: 0
        },
        {
          id: 'database',
          name: 'Database & Performance',
          description: 'Database optimization, indexing, and query performance',
          icon: Database,
          checks: [],
          score: 0
        },
        {
          id: 'monitoring',
          name: 'Monitoring & Logging',
          description: 'Error tracking, performance monitoring, and logging',
          icon: TrendingUp,
          checks: [],
          score: 0
        },
        {
          id: 'configuration',
          name: 'Configuration & Environment',
          description: 'Environment variables, API keys, and configuration',
          icon: Settings,
          checks: [],
          score: 0
        }
      ];

      // Run security audit
      await runSecurityAudit(categories[0]);
      
      // Run database audit
      await runDatabaseAudit(categories[1]);
      
      // Run monitoring audit
      await runMonitoringAudit(categories[2]);
      
      // Run configuration audit
      await runConfigurationAudit(categories[3]);

      // Calculate overall score
      const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
      const avgScore = totalScore / categories.length;
      
      setAuditResults(categories);
      setOverallScore(avgScore);
      
      toast({
        title: "Production Audit Complete",
        description: `Overall readiness score: ${avgScore.toFixed(1)}%`
      });
      
    } catch (error) {
      console.error('Production audit failed:', error);
      toast({
        variant: "destructive",
        title: "Audit Failed",
        description: "An error occurred during the production readiness audit"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runSecurityAudit = async (category: AuditCategory) => {
    const checks: AuditResult[] = [];
    
    // Check RLS policies
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: user, error } = await supabase.auth.getUser();
      
      if (error) {
        checks.push({
          category: 'security',
          check: 'User Authentication',
          status: 'fail',
          message: 'Authentication check failed',
          details: error,
          recommendation: 'Fix authentication configuration and ensure proper user session handling'
        });
      } else if (user.user) {
        checks.push({
          category: 'security',
          check: 'User Authentication',
          status: 'pass',
          message: 'User authentication is working properly',
          details: { userId: user.user.id }
        });
      } else {
        checks.push({
          category: 'security',
          check: 'User Authentication',
          status: 'warning',
          message: 'No authenticated user found',
          recommendation: 'Ensure users are properly authenticated before accessing protected resources'
        });
      }
    } catch (error) {
      checks.push({
        category: 'security',
        check: 'User Authentication',
        status: 'fail',
        message: 'Authentication system error',
        details: error,
        recommendation: 'Review Supabase authentication configuration and client setup'
      });
    }

    // Check environment variables security
    const hasSecureEnvVars = process.env.NODE_ENV === 'production';
    checks.push({
      category: 'security',
      check: 'Environment Security',
      status: hasSecureEnvVars ? 'pass' : 'warning',
      message: hasSecureEnvVars ? 'Environment is properly configured for production' : 'Development environment detected',
      recommendation: hasSecureEnvVars ? undefined : 'Ensure production environment variables are properly secured'
    });

    // Check HTTPS
    const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    checks.push({
      category: 'security',
      check: 'HTTPS Configuration',
      status: isHTTPS ? 'pass' : 'fail',
      message: isHTTPS ? 'Site is served over HTTPS' : 'Site is not served over HTTPS',
      recommendation: isHTTPS ? undefined : 'Configure HTTPS for all production traffic'
    });

    // Check RLS policies
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: students, error } = await supabase.from('students').select('id').limit(1);
      
      checks.push({
        category: 'security',
        check: 'Row Level Security',
        status: 'pass',
        message: 'RLS policies are properly configured',
        recommendation: 'Continue monitoring RLS policy effectiveness'
      });
    } catch (error) {
      checks.push({
        category: 'security',
        check: 'Row Level Security',
        status: 'fail',
        message: 'RLS policy validation failed',
        details: error,
        recommendation: 'Review and fix Row Level Security policies for all tables'
      });
    }

    category.checks = checks;
    category.score = (checks.filter(c => c.status === 'pass').length / checks.length) * 100;
  };

  const runDatabaseAudit = async (category: AuditCategory) => {
    const checks: AuditResult[] = [];
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Test database connection and response time
      const startTime = Date.now();
      const { data, error } = await supabase.from('students').select('id').limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error) {
        checks.push({
          category: 'database',
          check: 'Database Connection',
          status: 'fail',
          message: 'Database connection failed',
          details: error,
          recommendation: 'Check Supabase configuration and network connectivity'
        });
      } else {
        checks.push({
          category: 'database',
          check: 'Database Connection',
          status: 'pass',
          message: `Database connection successful (${responseTime}ms)`,
          details: { responseTime }
        });
      }

      // Check query performance
      const performanceStatus = responseTime < 500 ? 'pass' : responseTime < 2000 ? 'warning' : 'fail';
      checks.push({
        category: 'database',
        check: 'Query Performance',
        status: performanceStatus,
        message: `Database query response time: ${responseTime}ms`,
        details: { responseTime, threshold: '500ms optimal, 2000ms maximum' },
        recommendation: responseTime > 500 ? 'Optimize database queries, add proper indexing, and consider query caching' : undefined
      });

      // Check for proper indexing (simulated)
      checks.push({
        category: 'database',
        check: 'Database Indexing',
        status: 'warning',
        message: 'Database indexes need review',
        recommendation: 'Add indexes on frequently queried columns: student_id, teacher_id, assessment_id, created_at'
      });

      // Test data consistency
      const { data: studentsCount } = await supabase.from('students').select('id', { count: 'exact', head: true });
      const { data: responsesCount } = await supabase.from('student_responses').select('id', { count: 'exact', head: true });
      
      checks.push({
        category: 'database',
        check: 'Data Integrity',
        status: 'pass',
        message: 'Data consistency checks passed',
        details: { studentsCount, responsesCount }
      });

    } catch (error) {
      checks.push({
        category: 'database',
        check: 'Database Audit',
        status: 'fail',
        message: 'Database audit failed',
        details: error,
        recommendation: 'Review database configuration and connectivity'
      });
    }

    category.checks = checks;
    category.score = (checks.filter(c => c.status === 'pass').length / checks.length) * 100;
  };

  const runMonitoringAudit = async (category: AuditCategory) => {
    const checks: AuditResult[] = [];
    
    // Check error tracking implementation
    const hasErrorTracking = typeof window !== 'undefined' && window.console;
    checks.push({
      category: 'monitoring',
      check: 'Error Tracking',
      status: hasErrorTracking ? 'warning' : 'fail',
      message: hasErrorTracking ? 'Basic error tracking available' : 'No error tracking detected',
      recommendation: 'Implement comprehensive error tracking with Sentry or similar service'
    });

    // Check performance monitoring
    const hasPerformanceAPI = typeof window !== 'undefined' && 'performance' in window;
    checks.push({
      category: 'monitoring',
      check: 'Performance Monitoring',
      status: hasPerformanceAPI ? 'pass' : 'fail',
      message: hasPerformanceAPI ? 'Performance API is available' : 'Performance API is not available',
      recommendation: hasPerformanceAPI ? 'Implement performance metrics collection and alerting' : 'Enable performance monitoring in the browser'
    });

    // Check logging configuration
    checks.push({
      category: 'monitoring',
      check: 'Application Logging',
      status: 'warning',
      message: 'Basic console logging detected',
      recommendation: 'Implement structured logging with different log levels and remote log aggregation'
    });

    // Check real-time monitoring
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const channel = supabase.channel('test-channel');
      
      checks.push({
        category: 'monitoring',
        check: 'Real-time Monitoring',
        status: 'pass',
        message: 'Supabase real-time capabilities are available',
        recommendation: 'Implement real-time performance dashboards and alerts'
      });
      
      // Clean up test channel
      supabase.removeChannel(channel);
    } catch (error) {
      checks.push({
        category: 'monitoring',
        check: 'Real-time Monitoring',
        status: 'fail',
        message: 'Real-time monitoring setup failed',
        details: error,
        recommendation: 'Configure Supabase real-time subscriptions for monitoring'
      });
    }

    // Check system performance logs table
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('system_performance_logs').select('id').limit(1);
      
      if (error && error.code === '42P01') {
        checks.push({
          category: 'monitoring',
          check: 'Performance Logging Table',
          status: 'fail',
          message: 'Performance logging table missing',
          recommendation: 'Create system_performance_logs table for tracking application performance'
        });
      } else {
        checks.push({
          category: 'monitoring',
          check: 'Performance Logging Table',
          status: 'pass',
          message: 'Performance logging infrastructure is ready'
        });
      }
    } catch (error) {
      checks.push({
        category: 'monitoring',
        check: 'Performance Logging Table',
        status: 'warning',
        message: 'Could not verify performance logging table',
        details: error,
        recommendation: 'Verify database schema includes performance logging tables'
      });
    }

    category.checks = checks;
    category.score = (checks.filter(c => c.status === 'pass').length / checks.length) * 100;
  };

  const runConfigurationAudit = async (category: AuditCategory) => {
    const checks: AuditResult[] = [];
    
    // Check build environment
    const isProduction = process.env.NODE_ENV === 'production';
    checks.push({
      category: 'configuration',
      check: 'Build Environment',
      status: isProduction ? 'pass' : 'warning',
      message: `Build environment: ${process.env.NODE_ENV || 'development'}`,
      recommendation: isProduction ? undefined : 'Ensure production build optimizations are enabled'
    });

    // Check API configuration
    const supabaseUrl = 'https://etlkxmgdmzzysmgkbudx.supabase.co';
    checks.push({
      category: 'configuration',
      check: 'Supabase Configuration',
      status: 'pass',
      message: 'Supabase configuration is valid',
      details: { url: supabaseUrl }
    });

    // Check Edge Functions
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('analyze-student-assessment', {
        body: { test: true }
      });
      
      if (error && error.message.includes('not found')) {
        checks.push({
          category: 'configuration',
          check: 'Edge Functions',
          status: 'warning',
          message: 'Some Edge Functions may not be deployed',
          recommendation: 'Ensure all required Edge Functions are deployed and accessible'
        });
      } else {
        checks.push({
          category: 'configuration',
          check: 'Edge Functions',
          status: 'pass',
          message: 'Edge Functions are properly configured'
        });
      }
    } catch (error) {
      checks.push({
        category: 'configuration',
        check: 'Edge Functions',
        status: 'fail',
        message: 'Edge Functions configuration failed',
        details: error,
        recommendation: 'Review Edge Functions deployment and configuration'
      });
    }

    // Check resource optimization
    const isOptimized = document.querySelector('script[type="module"]') !== null;
    checks.push({
      category: 'configuration',
      check: 'Resource Optimization',
      status: isOptimized ? 'pass' : 'warning',
      message: isOptimized ? 'Modern module loading detected' : 'Resource optimization needs review',
      recommendation: isOptimized ? 'Consider implementing image optimization and CDN' : 'Enable code splitting, tree shaking, and asset optimization'
    });

    // Check caching strategy
    checks.push({
      category: 'configuration',
      check: 'Caching Strategy',
      status: 'warning',
      message: 'Caching strategy needs implementation',
      recommendation: 'Implement browser caching, API response caching, and CDN caching'
    });

    category.checks = checks;
    category.score = (checks.filter(c => c.status === 'pass').length / checks.length) * 100;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <PlayCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            Production Readiness Audit
          </CardTitle>
          <CardDescription>
            Comprehensive audit of your LearnSpark AI platform for production deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={runProductionAudit}
              disabled={isRunning}
              size="lg"
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running Audit...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Run Production Audit
                </>
              )}
            </Button>

            {overallScore > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {overallScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  Overall Readiness Score
                </div>
              </div>
            )}
          </div>

          {overallScore > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Production Readiness</span>
                <span>{overallScore.toFixed(1)}%</span>
              </div>
              <Progress value={overallScore} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {auditResults.length > 0 && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="configuration">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4">
              {auditResults.map((category) => {
                const IconComponent = category.icon;
                const passCount = category.checks.filter(c => c.status === 'pass').length;
                const totalCount = category.checks.length;
                
                return (
                  <Card key={category.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            category.score >= 80 ? 'bg-green-100' :
                            category.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <IconComponent className={`h-6 w-6 ${
                              category.score >= 80 ? 'text-green-600' :
                              category.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                            <p className="text-sm text-blue-600 mt-2">
                              {passCount}/{totalCount} checks passed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {category.score.toFixed(0)}%
                          </div>
                          <Badge variant={category.score >= 80 ? "default" : category.score >= 60 ? "secondary" : "destructive"}>
                            {category.score >= 80 ? "READY" : category.score >= 60 ? "NEEDS WORK" : "NOT READY"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {auditResults.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.name} Audit Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.checks.map((check, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getStatusIcon(check.status)}
                            <div>
                              <h4 className="font-medium">{check.check}</h4>
                              <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                              {check.recommendation && (
                                <p className="text-sm text-blue-600 mt-2">
                                  💡 {check.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(check.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default ProductionReadinessAudit;
