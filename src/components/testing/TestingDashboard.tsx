import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  Database,
  AlertCircle,
  Brain,
  Target,
  Zap,
  Network
} from 'lucide-react';
import { testingHelpers, TestingReport } from '@/utils/testing-helpers';
import { useToast } from '@/hooks/use-toast';

const TestingDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [phase1Results, setPhase1Results] = useState<TestingReport[]>([]);
  const [phase2Results, setPhase2Results] = useState<TestingReport[]>([]);
  const [activePhase, setActivePhase] = useState<'phase1' | 'phase2'>('phase1');
  const { toast } = useToast();

  const runPhase1Tests = async () => {
    setIsRunning(true);
    setPhase1Results([]);
    
    try {
      toast({
        title: "Starting Phase 1 Tests",
        description: "Running foundation platform validation..."
      });

      const testResults = await testingHelpers.runFoundationTests();
      setPhase1Results(testResults);

      const successCount = testResults.filter(r => r.success).length;
      const totalCount = testResults.length;

      if (successCount === totalCount) {
        toast({
          title: "Phase 1 Complete! ✅",
          description: `${successCount}/${totalCount} foundation tests passed`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Phase 1 Issues ⚠️",
          description: `${successCount}/${totalCount} tests passed. Review failed tests.`
        });
      }
    } catch (error) {
      console.error('Phase 1 testing failed:', error);
      toast({
        variant: "destructive",
        title: "Testing Error",
        description: "An error occurred while running Phase 1 tests"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runPhase2Tests = async () => {
    setIsRunning(true);
    setPhase2Results([]);
    
    try {
      toast({
        title: "Starting Phase 2 Tests",
        description: "Running Anthropic AI integration validation..."
      });

      const testResults = await testingHelpers.runPhase2Tests();
      setPhase2Results(testResults);

      const successCount = testResults.filter(r => r.success).length;
      const totalCount = testResults.length;

      if (successCount === totalCount) {
        toast({
          title: "Phase 2 Complete! 🚀",
          description: `${successCount}/${totalCount} Anthropic AI tests passed`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Phase 2 Issues ⚠️",
          description: `${successCount}/${totalCount} tests passed. Review failed tests.`
        });
      }
    } catch (error) {
      console.error('Phase 2 testing failed:', error);
      toast({
        variant: "destructive",
        title: "Testing Error",
        description: "An error occurred while running Phase 2 tests"
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

  const renderTestResults = (results: TestingReport[]) => {
    if (results.length === 0) return null;

    return (
      <Card className="mt-6">
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
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          LearnSpark AI Platform Testing
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive validation using Anthropic Claude AI integration
        </p>
      </div>

      <Tabs value={activePhase} onValueChange={(value) => setActivePhase(value as 'phase1' | 'phase2')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="phase1">Phase 1: Foundation</TabsTrigger>
          <TabsTrigger value="phase2">Phase 2: Anthropic AI</TabsTrigger>
        </TabsList>

        <TabsContent value="phase1" className="space-y-6">
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
                  onClick={runPhase1Tests} 
                  disabled={isRunning}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Clock className="h-5 w-5 animate-spin" />
                      <span>Running Foundation Tests...</span>
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

          {renderTestResults(phase1Results)}
        </TabsContent>

        <TabsContent value="phase2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <span>Phase 2: Anthropic AI Integration Testing</span>
              </CardTitle>
              <CardDescription>
                Tests Anthropic Claude analysis generation, goal suggestions, and advanced data relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <Brain className="h-8 w-8 text-purple-600 mx-auto" />
                  <p className="text-sm font-medium">Claude Analysis</p>
                </div>
                <div className="space-y-2">
                  <Target className="h-8 w-8 text-green-600 mx-auto" />
                  <p className="text-sm font-medium">AI Goal Suggestions</p>
                </div>
                <div className="space-y-2">
                  <Zap className="h-8 w-8 text-yellow-600 mx-auto" />
                  <p className="text-sm font-medium">API Configuration</p>
                </div>
                <div className="space-y-2">
                  <Network className="h-8 w-8 text-blue-600 mx-auto" />
                  <p className="text-sm font-medium">Data Relations</p>
                </div>
                <div className="space-y-2">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
                  <p className="text-sm font-medium">Error Handling</p>
                </div>
                <div className="space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                  <p className="text-sm font-medium">Integration</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-center">
                <Button 
                  onClick={runPhase2Tests} 
                  disabled={isRunning}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center space-x-2"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Clock className="h-5 w-5 animate-spin" />
                      <span>Running Anthropic Tests...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5" />
                      <span>Start Anthropic AI Tests</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {phase1Results.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">Phase 1 Required</h3>
                <p className="text-gray-500 mb-4">
                  Please run Phase 1 foundation tests first to create the necessary test data for Anthropic AI integration testing.
                </p>
                <Button 
                  onClick={() => setActivePhase('phase1')}
                  variant="outline"
                >
                  Go to Phase 1
                </Button>
              </CardContent>
            </Card>
          )}

          {renderTestResults(phase2Results)}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <span>Testing Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Phase 1 (Foundation):</strong> Creates test students, assessments, and responses</p>
            <p><strong>Phase 2 (Anthropic AI):</strong> Tests Claude analysis, goal suggestions, and error handling</p>
            <p><strong>Prerequisites:</strong> Ensure you're logged in and have ANTHROPIC_API_KEY configured</p>
            <p><strong>AI Services:</strong> Uses only Anthropic Claude for all AI functionality with proper fallbacks</p>
            <p><strong>Clean Up:</strong> Test data can be deleted manually after validation completes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingDashboard;
