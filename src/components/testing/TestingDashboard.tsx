
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  Database,
  AlertCircle
} from 'lucide-react';
import { testingHelpers, TestingReport } from '@/utils/testing-helpers';
import { useToast } from '@/hooks/use-toast';

const TestingDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestingReport[]>([]);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      toast({
        title: "Starting Foundation Tests",
        description: "Running comprehensive platform validation..."
      });

      const testResults = await testingHelpers.runFoundationTests();
      setResults(testResults);

      const successCount = testResults.filter(r => r.success).length;
      const totalCount = testResults.length;

      if (successCount === totalCount) {
        toast({
          title: "All Tests Passed! ✅",
          description: `${successCount}/${totalCount} tests completed successfully`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Some Tests Failed ⚠️",
          description: `${successCount}/${totalCount} tests passed. Review failed tests below.`
        });
      }
    } catch (error) {
      console.error('Testing failed:', error);
      toast({
        variant: "destructive",
        title: "Testing Error",
        description: "An error occurred while running tests"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          LearnSpark AI Platform Testing
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive validation of core platform functionality
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-blue-600" />
            <span>Phase 1: Foundation Testing</span>
          </CardTitle>
          <CardDescription>
            Validates authentication, student management, assessments, and data integrity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <Users className="h-8 w-8 text-blue-600 mx-auto" />
              <p className="text-sm font-medium">Authentication</p>
            </div>
            <div className="space-y-2">
              <Users className="h-8 w-8 text-green-600 mx-auto" />
              <p className="text-sm font-medium">Student Management</p>
            </div>
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-purple-600 mx-auto" />
              <p className="text-sm font-medium">Assessments</p>
            </div>
            <div className="space-y-2">
              <Database className="h-8 w-8 text-orange-600 mx-auto" />
              <p className="text-sm font-medium">Data Integrity</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-center">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Clock className="h-5 w-5 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Start Foundation Tests</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Results</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {results.filter(r => r.success).length}/{results.length} passed
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.success)}
                      <h3 className="font-medium">{result.message}</h3>
                    </div>
                    {getStatusBadge(result.success)}
                  </div>
                  
                  {result.details && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                      <pre className="text-xs overflow-x-auto">
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
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <span>Testing Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Before Testing:</strong> Ensure you're logged in with a valid teacher account</p>
            <p><strong>Test Data:</strong> Tests will create sample students and assessments for validation</p>
            <p><strong>Clean Up:</strong> Test data can be deleted manually after validation</p>
            <p><strong>Next Phase:</strong> Once foundation tests pass, proceed to AI integration testing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingDashboard;
