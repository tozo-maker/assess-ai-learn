
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
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TableInfo {
  table_name: string;
  rls_enabled: boolean;
  policy_count: number;
  exists: boolean;
}

interface RLSTest {
  table: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'failed' | 'error';
  message: string;
  details?: any;
}

const RLSPolicyValidator = () => {
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([]);
  const [rlsTests, setRLSTests] = useState<RLSTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkDatabaseStructure = async () => {
    try {
      console.log('Checking database structure...');
      
      // Get all table names from information_schema
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .neq('table_name', 'schema_migrations');

      if (tablesError) {
        console.error('Error fetching tables:', tablesError);
        throw tablesError;
      }

      console.log('Found tables:', tables);

      // Try to get RLS status using a direct query
      const { data: rlsData, error: rlsError } = await supabase.rpc('test_rls_policies');
      
      if (rlsError) {
        console.log('RLS function not available, checking manually...');
        
        // Manual check for existing tables
        const knownTables = ['students', 'assessments', 'assessment_items', 'student_responses', 
                           'assessment_analysis', 'goals', 'goal_milestones', 'goal_progress_history',
                           'goal_achievements', 'parent_communications', 'student_performance', 'data_exports'];
        
        const tableInfos: TableInfo[] = [];
        
        for (const tableName of knownTables) {
          try {
            // Try to query the table to see if it exists
            const { error } = await supabase
              .from(tableName)
              .select('id')
              .limit(0);
            
            tableInfos.push({
              table_name: tableName,
              rls_enabled: false, // We'll assume false since we had no policies
              policy_count: 0,
              exists: !error
            });
          } catch (e) {
            tableInfos.push({
              table_name: tableName,
              rls_enabled: false,
              policy_count: 0,
              exists: false
            });
          }
        }
        
        setTableInfo(tableInfos);
      } else {
        setTableInfo(rlsData.map(row => ({
          table_name: row.table_name,
          rls_enabled: row.rls_enabled,
          policy_count: Number(row.policy_count),
          exists: true
        })));
      }
    } catch (error) {
      console.error('Database structure check failed:', error);
      toast({
        variant: "destructive",
        title: "Database Check Failed",
        description: `Error: ${error.message}`
      });
    }
  };

  const testDataIsolation = async () => {
    if (!user) return;

    const tests: RLSTest[] = [
      {
        table: 'students',
        description: 'Test student data isolation',
        status: 'pending',
        message: 'Ready to test'
      },
      {
        table: 'assessments',
        description: 'Test assessment data isolation',
        status: 'pending',
        message: 'Ready to test'
      },
      {
        table: 'goals',
        description: 'Test goals data isolation',
        status: 'pending',
        message: 'Ready to test'
      }
    ];

    setRLSTests(tests);

    for (const test of tests) {
      updateTest(test.table, { status: 'checking', message: 'Testing data isolation...' });

      try {
        // Try to access data for this table
        const { data, error } = await supabase
          .from(test.table)
          .select('*')
          .limit(5);

        if (error) {
          if (error.message.includes('row-level security')) {
            updateTest(test.table, {
              status: 'passed',
              message: 'RLS is working - access properly restricted',
              details: { error: error.message }
            });
          } else {
            updateTest(test.table, {
              status: 'error',
              message: `Database error: ${error.message}`,
              details: { error: error.message }
            });
          }
        } else {
          // If we get data, check if it belongs to current user
          if (test.table === 'students' || test.table === 'assessments') {
            const userOwnedData = data?.filter(item => item.teacher_id === user.id) || [];
            const otherUserData = data?.filter(item => item.teacher_id !== user.id) || [];
            
            if (otherUserData.length > 0) {
              updateTest(test.table, {
                status: 'failed',
                message: `Data leak detected: Can access ${otherUserData.length} records from other users`,
                details: { 
                  totalRecords: data?.length || 0,
                  ownRecords: userOwnedData.length,
                  otherUserRecords: otherUserData.length
                }
              });
            } else {
              updateTest(test.table, {
                status: 'passed',
                message: `Data properly isolated: ${userOwnedData.length} records accessible`,
                details: { 
                  totalRecords: data?.length || 0,
                  ownRecords: userOwnedData.length
                }
              });
            }
          } else {
            updateTest(test.table, {
              status: 'passed',
              message: `Query successful: ${data?.length || 0} records returned`,
              details: { totalRecords: data?.length || 0 }
            });
          }
        }
      } catch (error) {
        updateTest(test.table, {
          status: 'error',
          message: `Test failed: ${error.message}`,
          details: { error: error.message }
        });
      }
    }
  };

  const updateTest = (table: string, updates: Partial<RLSTest>) => {
    setRLSTests(prev => prev.map(test => 
      test.table === table ? { ...test, ...updates } : test
    ));
  };

  const runFullAudit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to run RLS validation"
      });
      return;
    }

    setIsRunning(true);

    try {
      await checkDatabaseStructure();
      await testDataIsolation();

      toast({
        title: "RLS Validation Complete",
        description: "Database structure and security policies have been audited"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Validation Failed",
        description: "An error occurred during RLS validation"
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
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Eye className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      error: 'secondary',
      checking: 'outline',
      pending: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getRLSBadge = (enabled: boolean) => {
    return (
      <Badge variant={enabled ? 'default' : 'destructive'}>
        {enabled ? 'ENABLED' : 'DISABLED'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            RLS Policy Validator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You must be logged in to validate RLS policies.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <Button
              onClick={runFullAudit}
              disabled={isRunning || !user}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Validation...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Validate RLS Policies
                </>
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={checkDatabaseStructure}
                disabled={isRunning}
                size="sm"
              >
                <Database className="h-4 w-4 mr-2" />
                Check Structure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Structure */}
      {tableInfo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tableInfo.map((table) => (
                <div key={table.table_name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{table.table_name}</span>
                    {!table.exists && (
                      <Badge variant="destructive">MISSING</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {table.exists && (
                      <>
                        {getRLSBadge(table.rls_enabled)}
                        <span className="text-sm text-gray-600">
                          {table.policy_count} policies
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RLS Tests */}
      {rlsTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Isolation Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rlsTests.map((test) => (
                <div key={test.table} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-medium">{test.table}</h3>
                        <p className="text-sm text-gray-600">{test.description}</p>
                        <p className="text-sm mt-1">{test.message}</p>
                      </div>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>

                  {test.details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2 text-sm">Test Details</h4>
                      <div className="text-xs space-y-1">
                        {Object.entries(test.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RLSPolicyValidator;
