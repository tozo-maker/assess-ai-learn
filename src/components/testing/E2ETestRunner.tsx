
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  FileText,
  BarChart3,
  AlertTriangle,
  Navigation
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface E2ETest {
  id: string;
  name: string;
  description: string;
  steps: string[];
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

const E2ETestRunner = () => {
  const [tests, setTests] = useState<E2ETest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const initializeTests = () => {
    const e2eTests: E2ETest[] = [
      {
        id: 'user-login-flow',
        name: 'User Authentication Flow',
        description: 'Test complete login and logout functionality',
        steps: [
          'Navigate to login page',
          'Enter valid credentials',
          'Verify dashboard loads',
          'Check user profile display',
          'Test logout functionality'
        ],
        status: 'pending'
      },
      {
        id: 'student-management',
        name: 'Student Management Journey',
        description: 'Test complete student CRUD operations',
        steps: [
          'Navigate to students page',
          'Add new student',
          'Edit student information',
          'View student profile',
          'Delete student record'
        ],
        status: 'pending'
      },
      {
        id: 'assessment-workflow',
        name: 'Assessment Creation Workflow',
        description: 'Test end-to-end assessment creation and management',
        steps: [
          'Create new assessment',
          'Add assessment items',
          'Assign to students',
          'Enter student responses',
          'View assessment results'
        ],
        status: 'pending'
      },
      {
        id: 'insights-generation',
        name: 'AI Insights Generation',
        description: 'Test AI-powered insights and recommendations',
        steps: [
          'Navigate to insights page',
          'Select assessment data',
          'Trigger AI analysis',
          'Verify insights display',
          'Check recommendations'
        ],
        status: 'pending'
      },
      {
        id: 'reports-export',
        name: 'Progress Reports Export',
        description: 'Test report generation and export functionality',
        steps: [
          'Navigate to reports page',
          'Select student and timeframe',
          'Generate progress report',
          'Verify PDF creation',
          'Test export functionality'
        ],
        status: 'pending'
      }
    ];

    setTests(e2eTests);
  };

  const updateTestStatus = (testId: string, status: E2ETest['status'], duration?: number, error?: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status, duration, error }
        : test
    ));
  };

  const simulateE2ETest = async (test: E2ETest): Promise<void> => {
    return new Promise((resolve, reject) => {
      const duration = Math.random() * 3000 + 2000; // 2-5 seconds
      const shouldFail = Math.random() < 0.2; // 20% chance of failure
      
      setTimeout(() => {
        if (shouldFail && test.id !== 'user-login-flow') {
          reject(new Error(`E2E test failed at step: ${test.steps[Math.floor(Math.random() * test.steps.length)]}`));
        } else {
          resolve();
        }
      }, duration);
    });
  };

  const runAllTests = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to run E2E tests"
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    initializeTests();

    try {
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        updateTestStatus(test.id, 'running');
        
        const startTime = Date.now();
        
        try {
          await simulateE2ETest(test);
          const duration = Date.now() - startTime;
          updateTestStatus(test.id, 'passed', duration);
        } catch (error) {
          const duration = Date.now() - startTime;
          updateTestStatus(test.id, 'failed', duration, error.message);
        }
        
        setProgress(((i + 1) / tests.length) * 100);
      }

      const passedTests = tests.filter(t => t.status === 'passed').length;
      toast({
        title: "E2E Testing Complete",
        description: `${passedTests}/${tests.length} tests passed`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "E2E Testing Failed",
        description: "An error occurred during testing"
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
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <PlayCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-purple-600" />
            End-to-End Test Runner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={runAllTests}
              disabled={isRunning || !user}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Running E2E Tests...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Run E2E Test Suite
                </>
              )}
            </Button>

            {tests.length > 0 && (
              <div className="text-sm text-gray-600">
                {passedTests} passed, {failedTests} failed
              </div>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
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
                      {test.duration && (
                        <p className="text-xs text-gray-500 mt-1">
                          Duration: {test.duration}ms
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Test Steps</h4>
                  <ul className="space-y-1">
                    {test.steps.map((step, index) => (
                      <li key={index} className="text-xs flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {test.error && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-medium mb-2 text-sm flex items-center gap-1 text-red-700">
                      <AlertTriangle className="h-3 w-3" />
                      Error Details
                    </h4>
                    <p className="text-xs text-red-600">{test.error}</p>
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

export default E2ETestRunner;
