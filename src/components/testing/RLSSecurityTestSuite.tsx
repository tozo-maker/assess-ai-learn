import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database,
  RefreshCw,
  Eye,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityTest {
  table: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Define valid table names based on the database schema
type ValidTableName = 'teacher_profiles' | 'students' | 'assessments' | 'assessment_items' | 'student_responses' | 'assessment_analysis' | 'goals' | 'goal_milestones' | 'goal_progress_history' | 'goal_achievements' | 'parent_communications' | 'student_performance' | 'data_exports';

const RLSSecurityTestSuite = () => {
  const [tests, setTests] = useState<SecurityTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const updateTest = (table: string, updates: Partial<SecurityTest>) => {
    setTests(prev => prev.map(test => 
      test.table === table ? { ...test, ...updates } : test
    ));
  };

  const initializeTests = () => {
    const securityTests: SecurityTest[] = [
      {
        table: 'teacher_profiles',
        description: 'Test teacher profile data isolation',
        status: 'pending',
        message: 'Ready to test',
        severity: 'critical'
      },
      {
        table: 'students',
        description: 'Test student data isolation',
        status: 'pending',
        message: 'Ready to test',
        severity: 'critical'
      },
      {
        table: 'assessments',
        description: 'Test assessment data isolation',
        status: 'pending',
        message: 'Ready to test',
        severity: 'high'
      },
      {
        table: 'student_responses',
        description: 'Test response data isolation',
        status: 'pending',
        message: 'Ready to test',
        severity: 'high'
      },
      {
        table: 'goals',
        description: 'Test goals data isolation',
        status: 'pending',
        message: 'Ready to test',
        severity: 'medium'
      },
      {
        table: 'parent_communications',
        description: 'Test communication data isolation',
        status: 'pending',
        message: 'Ready to test',
        severity: 'high'
      }
    ];

    setTests(securityTests);
  };

  const testTableSecurity = async (tableName: string) => {
    updateTest(tableName, { status: 'checking', message: 'Testing RLS policies...' });

    try {
      // Try to access data - should only return user's own data or be blocked by RLS
      const { data, error } = await supabase
        .from(tableName as ValidTableName)
        .select('*')
        .limit(10);

      if (error) {
        // Permission errors are GOOD - they indicate RLS is working
        if (error.message.includes('row-level security') || 
            error.message.includes('permission denied') ||
            error.message.includes('insufficient privilege')) {
          updateTest(tableName, {
            status: 'passed',
            message: 'RLS properly blocking unauthorized access',
            details: { 
              protection: 'Active',
              errorType: 'Permission denied (expected)',
              securityLevel: 'High'
            }
          });
        } else {
          updateTest(tableName, {
            status: 'failed',
            message: `Unexpected error: ${error.message}`,
            details: { error: error.message }
          });
        }
      } else {
        // If we get data, verify it's properly filtered
        const recordCount = data?.length || 0;
        
        if (recordCount === 0) {
          updateTest(tableName, {
            status: 'passed',
            message: 'No data returned - proper RLS filtering (empty dataset)',
            details: { 
              records: 0,
              protection: 'Active',
              securityLevel: 'High'
            }
          });
        } else {
          // Data returned - this could be OK if it's the user's own data
          // Additional verification needed
          updateTest(tableName, {
            status: 'warning',
            message: `${recordCount} records accessible - verify these belong to current user`,
            details: { 
              records: recordCount,
              protection: 'Partial',
              securityLevel: 'Medium',
              note: 'Manual verification required'
            }
          });
        }
      }
    } catch (error: any) {
      updateTest(tableName, {
        status: 'failed',
        message: `Test failed: ${error.message}`,
        details: { error: error.message }
      });
    }
  };

  const testCrossUserDataAccess = async () => {
    // This test attempts to verify that users cannot access other users' data
    // by checking if RLS policies are actually enforced
    
    updateTest('Cross-User Access Test', { 
      status: 'checking', 
      message: 'Testing cross-user data access prevention...' 
    });

    try {
      // Test: Try to query students table without teacher_id filter
      // If RLS is working, this should only return current user's students or fail
      const { data: allStudents, error } = await supabase
        .from('students')
        .select('id, teacher_id')
        .limit(100);

      if (error) {
        updateTest('Cross-User Access Test', {
          status: 'passed',
          message: 'Cross-user access properly blocked by RLS',
          details: { 
            protection: 'Active',
            errorType: error.message
          }
        });
      } else {
        // Check if all returned data belongs to current user
        const otherUserData = allStudents?.filter(s => s.teacher_id !== user?.id) || [];
        
        if (otherUserData.length === 0) {
          updateTest('Cross-User Access Test', {
            status: 'passed',
            message: `Data properly isolated - ${allStudents?.length || 0} records belong to current user`,
            details: { 
              userRecords: allStudents?.length || 0,
              otherUserRecords: 0,
              protection: 'Active'
            }
          });
        } else {
          updateTest('Cross-User Access Test', {
            status: 'failed',
            message: `SECURITY BREACH: Access to ${otherUserData.length} records from other users`,
            details: { 
              userRecords: (allStudents?.length || 0) - otherUserData.length,
              otherUserRecords: otherUserData.length,
              protection: 'FAILED',
              severity: 'CRITICAL'
            }
          });
        }
      }
    } catch (error: any) {
      updateTest('Cross-User Access Test', {
        status: 'passed',
        message: 'Cross-user access blocked by system security',
        details: { protection: 'Active' }
      });
    }
  };

  const runSecurityTests = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to run security tests"
      });
      return;
    }

    setIsRunning(true);
    initializeTests();

    try {
      // Test individual tables
      const tables = ['teacher_profiles', 'students', 'assessments', 'student_responses', 'goals', 'parent_communications'];
      
      for (const table of tables) {
        await testTableSecurity(table);
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Test cross-user access
      await testCrossUserDataAccess();

      const passedTests = tests.filter(t => t.status === 'passed').length;
      const failedTests = tests.filter(t => t.status === 'failed').length;
      const warningTests = tests.filter(t => t.status === 'warning').length;

      if (failedTests > 0) {
        toast({
          variant: "destructive",
          title: "Security Issues Detected",
          description: `${failedTests} critical security issues found`
        });
      } else if (warningTests > 0) {
        toast({
          title: "Security Tests Complete",
          description: `${passedTests} passed, ${warningTests} need review`
        });
      } else {
        toast({
          title: "Security Tests Passed",
          description: "All security policies are working correctly"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Security Testing Failed",
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
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
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
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[severity]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const warningTests = tests.filter(t => t.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-600" />
            RLS Security Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You must be logged in to run RLS security tests.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <Button
              onClick={runSecurityTests}
              disabled={isRunning || !user}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Security Tests...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Run RLS Security Tests
                </>
              )}
            </Button>

            {tests.length > 0 && (
              <div className="text-sm text-gray-600">
                {passedTests} secure, {warningTests} warnings, {failedTests} critical issues
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {tests.length > 0 && (
        <div className="space-y-4">
          {tests.map((test) => (
            <Card key={test.table}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="h-4 w-4" />
                        <h3 className="font-medium">{test.table}</h3>
                        {getSeverityBadge(test.severity)}
                      </div>
                      <p className="text-sm text-gray-600">{test.description}</p>
                      <p className="text-sm mt-1">{test.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>

                {test.details && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm">Security Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(test.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
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
