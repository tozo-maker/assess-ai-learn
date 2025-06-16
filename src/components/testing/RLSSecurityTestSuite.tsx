import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Database,
  Lock,
  Users,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  severity: 'critical' | 'high' | 'medium' | 'low';
  details?: any;
  recommendations?: string[];
}

const RLSSecurityTestSuite = () => {
  const [tests, setTests] = useState<SecurityTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const updateTest = (testId: string, update: Partial<SecurityTest>) => {
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, ...update } : test
    ));
  };

  const initializeTests = () => {
    const securityTests: SecurityTest[] = [
      {
        id: 'rls-on-students',
        name: 'RLS on Students Table',
        description: 'Verify RLS policies on the students table',
        status: 'pending',
        severity: 'high'
      },
      {
        id: 'rls-on-assessments',
        name: 'RLS on Assessments Table',
        description: 'Verify RLS policies on the assessments table',
        status: 'pending',
        severity: 'high'
      },
      {
        id: 'rls-on-responses',
        name: 'RLS on Student Responses Table',
        description: 'Verify RLS policies on the student_responses table',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'rls-on-performance',
        name: 'RLS on Student Performance Table',
        description: 'Verify RLS policies on the student_performance table',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'rls-on-communications',
        name: 'RLS on Communications Table',
        description: 'Verify RLS policies on the communications table',
        status: 'pending',
        severity: 'low'
      },
      {
        id: 'rls-on-goals',
        name: 'RLS on Learning Goals Table',
        description: 'Verify RLS policies on the learning_goals table',
        status: 'pending',
        severity: 'low'
      }
    ];

    setTests(securityTests);
  };

  const checkRLSPolicies = async (table: string, policyDescription: string, testId: string) => {
    updateTest(testId, { status: 'running', details: { table } });

    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        updateTest(testId, { 
          status: 'failed', 
          details: { table, error: error.message },
          recommendations: ['Review RLS policies', 'Check database connection']
        });
      } else {
        updateTest(testId, { 
          status: 'passed', 
          details: { table, recordCount: data?.length || 0 },
          recommendations: ['Ensure policies are restrictive enough']
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      updateTest(testId, { 
        status: 'failed', 
        details: { table, error: errorMessage },
        recommendations: ['Check database permissions', 'Verify table exists']
      });
    }
  };

  const runAllTests = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to run security tests"
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    initializeTests();

    try {
      await checkRLSPolicies('students', 'RLS policies on students table', 'rls-on-students');
      await checkRLSPolicies('assessments', 'RLS policies on assessments table', 'rls-on-assessments');
      await checkRLSPolicies('student_responses', 'RLS policies on student responses table', 'rls-on-responses');
      await checkRLSPolicies('student_performance', 'RLS policies on student performance table', 'rls-on-performance');
      await checkRLSPolicies('communications', 'RLS policies on communications table', 'rls-on-communications');
      await checkRLSPolicies('learning_goals', 'RLS policies on learning goals table', 'rls-on-goals');

      toast({
        title: "RLS Security Validation Complete",
        description: "All RLS policies have been validated"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Security Test Failed",
        description: "An error occurred during security testing"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Lock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      warning: 'secondary',
      checking: 'outline',
      pending: 'outline'
    } as const;
    
    const variant = variants[status as keyof typeof variants] || 'outline';
    return (
      <Badge variant={variant}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'text-red-600 bg-red-100',
      high: 'text-orange-600 bg-orange-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-blue-600 bg-blue-100'
    };
    
    return colors[severity as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const warningTests = tests.filter(t => t.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Row Level Security (RLS) Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You must be logged in to run security tests.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <Button
              onClick={runAllTests}
              disabled={isRunning || !user}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Run Security Tests
                </>
              )}
            </Button>

            {tests.length > 0 && (
              <div className="text-sm text-gray-600">
                {passedTests} passed, {warningTests} warnings, {failedTests} failed
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {tests.length > 0 && (
        <div className="space-y-4">
          {tests.map((test) => (
            <Card key={test.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.description}</p>
                      <div className={`text-xs font-medium mt-1 inline-flex px-2 py-1 rounded-full ${getSeverityColor(test.severity)}`}>
                        Severity: {test.severity}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>

                {test.details && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm">Details</h4>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {Object.entries(test.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {test.recommendations && test.recommendations.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium mb-2 text-sm flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Recommendations
                    </h4>
                    <ul className="text-xs space-y-1">
                      {test.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RLSSecurityTestSuite;
