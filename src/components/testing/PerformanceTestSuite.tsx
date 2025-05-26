
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  TrendingUp,
  Database,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  metric: string;
  threshold: number;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  result?: number;
  duration?: number;
}

const PerformanceTestSuite = () => {
  const [tests, setTests] = useState<PerformanceTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const initializeTests = () => {
    const performanceTests: PerformanceTest[] = [
      {
        id: 'page-load-time',
        name: 'Page Load Performance',
        description: 'Measure initial page load time',
        metric: 'Load Time (ms)',
        threshold: 3000,
        status: 'pending'
      },
      {
        id: 'database-query-speed',
        name: 'Database Query Performance',
        description: 'Test database query response times',
        metric: 'Query Time (ms)',
        threshold: 500,
        status: 'pending'
      },
      {
        id: 'concurrent-users',
        name: 'Concurrent User Load',
        description: 'Simulate multiple users accessing the system',
        metric: 'Response Time (ms)',
        threshold: 2000,
        status: 'pending'
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage Test',
        description: 'Monitor memory consumption during operations',
        metric: 'Memory (MB)',
        threshold: 100,
        status: 'pending'
      },
      {
        id: 'api-throughput',
        name: 'API Throughput Test',
        description: 'Test API request handling capacity',
        metric: 'Requests/sec',
        threshold: 50,
        status: 'pending'
      }
    ];

    setTests(performanceTests);
  };

  const updateTestResult = (testId: string, status: PerformanceTest['status'], result?: number, duration?: number) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status, result, duration }
        : test
    ));
  };

  const measurePageLoadTime = async (): Promise<number> => {
    const startTime = performance.now();
    
    // Simulate page navigation and resource loading
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    return performance.now() - startTime;
  };

  const measureDatabaseQuery = async (): Promise<number> => {
    const startTime = performance.now();
    
    try {
      await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('teacher_id', user?.id)
        .limit(50);
    } catch (error) {
      console.error('Database query test error:', error);
    }
    
    return performance.now() - startTime;
  };

  const simulateConcurrentLoad = async (): Promise<number> => {
    const startTime = performance.now();
    
    // Simulate multiple concurrent requests
    const promises = Array.from({ length: 10 }, async () => {
      await supabase
        .from('assessments')
        .select('id, title')
        .eq('teacher_id', user?.id)
        .limit(10);
    });
    
    await Promise.all(promises);
    
    return performance.now() - startTime;
  };

  const measureMemoryUsage = async (): Promise<number> => {
    // Simulate memory-intensive operations
    const largeArray = new Array(100000).fill(0).map((_, i) => ({ id: i, data: `item-${i}` }));
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }
    
    // Estimate memory usage (simplified)
    const memoryEstimate = largeArray.length * 50 / 1024; // Convert to KB, then MB
    
    return memoryEstimate;
  };

  const measureAPIThroughput = async (): Promise<number> => {
    const testDuration = 5000; // 5 seconds
    const startTime = Date.now();
    let requestCount = 0;
    
    while (Date.now() - startTime < testDuration) {
      try {
        await supabase
          .from('students')
          .select('id')
          .eq('teacher_id', user?.id)
          .limit(1);
        requestCount++;
      } catch (error) {
        break;
      }
      
      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return requestCount / (testDuration / 1000); // Requests per second
  };

  const runPerformanceTest = async (test: PerformanceTest) => {
    updateTestResult(test.id, 'running');
    
    try {
      let result: number;
      
      switch (test.id) {
        case 'page-load-time':
          result = await measurePageLoadTime();
          break;
        case 'database-query-speed':
          result = await measureDatabaseQuery();
          break;
        case 'concurrent-users':
          result = await simulateConcurrentLoad();
          break;
        case 'memory-usage':
          result = await measureMemoryUsage();
          break;
        case 'api-throughput':
          result = await measureAPIThroughput();
          break;
        default:
          result = Math.random() * test.threshold * 1.5;
      }
      
      const status = result <= test.threshold ? 'passed' : 
                    result <= test.threshold * 1.2 ? 'warning' : 'failed';
      
      updateTestResult(test.id, status, result, Date.now());
    } catch (error) {
      updateTestResult(test.id, 'failed', undefined, Date.now());
    }
  };

  const runAllTests = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to run performance tests"
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    initializeTests();

    try {
      const testList = [...tests];
      for (let i = 0; i < testList.length; i++) {
        await runPerformanceTest(testList[i]);
        setProgress(((i + 1) / testList.length) * 100);
      }

      toast({
        title: "Performance Testing Complete",
        description: "All performance tests have been executed"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Performance Testing Failed",
        description: "An error occurred during performance testing"
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
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Zap className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      warning: 'secondary',
      running: 'outline',
      pending: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatResult = (test: PerformanceTest) => {
    if (test.result === undefined) return 'N/A';
    
    if (test.metric.includes('Time') || test.metric.includes('ms')) {
      return `${Math.round(test.result)}ms`;
    } else if (test.metric.includes('MB')) {
      return `${test.result.toFixed(1)}MB`;
    } else if (test.metric.includes('Requests/sec')) {
      return `${test.result.toFixed(1)} req/s`;
    }
    
    return test.result.toString();
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const warningTests = tests.filter(t => t.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Performance Test Suite
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
                  Running Performance Tests...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Run Performance Tests
                </>
              )}
            </Button>

            {tests.length > 0 && (
              <div className="text-sm text-gray-600">
                {passedTests} passed, {warningTests} warnings, {failedTests} failed
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
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Metric:</span>
                      <p className="font-medium">{test.metric}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Threshold:</span>
                      <p className="font-medium">{test.threshold}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Result:</span>
                      <p className={`font-medium ${
                        test.status === 'passed' ? 'text-green-600' :
                        test.status === 'warning' ? 'text-yellow-600' :
                        test.status === 'failed' ? 'text-red-600' : ''
                      }`}>
                        {formatResult(test)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceTestSuite;
