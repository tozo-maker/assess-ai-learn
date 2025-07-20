import React, { useState } from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { TestTube, Play, Pause, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ComprehensiveTestSuite from '@/components/testing/ComprehensiveTestSuite';
import FunctionalityTester from '@/components/testing/FunctionalityTester';
import RLSSecurityTestSuite from '@/components/testing/RLSSecurityTestSuite';
import PerformanceTestSuite from '@/components/testing/PerformanceTestSuite';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message?: string;
  duration?: number;
}

const Testing: React.FC = () => {
  const [activeTestSuite, setActiveTestSuite] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const testSuites = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Test Suite',
      description: 'Full system testing including all components and integrations',
      component: ComprehensiveTestSuite,
      icon: TestTube
    },
    {
      id: 'functionality',
      name: 'Functionality Tests',
      description: 'Core application functionality and feature testing',
      component: FunctionalityTester,
      icon: CheckCircle
    },
    {
      id: 'security',
      name: 'Security & RLS Tests',
      description: 'Row Level Security policies and data protection testing',
      component: RLSSecurityTestSuite,
      icon: AlertTriangle
    },
    {
      id: 'performance',
      name: 'Performance Tests',
      description: 'Load testing, response times, and system performance metrics',
      component: PerformanceTestSuite,
      icon: Play
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-success';
      case 'failed':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      case 'running':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'running':
        return <Play className="h-4 w-4 text-primary animate-pulse" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-muted" />;
    }
  };

  const runTestSuite = (suiteId: string) => {
    setActiveTestSuite(suiteId);
    setTestResults([]);
    setOverallProgress(0);
  };

  const stopTestSuite = () => {
    setActiveTestSuite(null);
  };

  const resetTests = () => {
    setActiveTestSuite(null);
    setTestResults([]);
    setOverallProgress(0);
  };

  const actions = (
    <div className="flex items-center gap-2">
      <TestTube className="h-5 w-5 text-primary" />
      {activeTestSuite && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={stopTestSuite}
          >
            <Pause className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTests}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <StandardPageLayout
      title="Testing Infrastructure"
      description="Comprehensive testing suite for LearnSpark AI platform"
      actions={actions}
      breadcrumbs={[
        { label: 'Testing' }
      ]}
    >
      <div className="space-y-6">
        {/* Test Suite Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testSuites.map((suite) => (
            <Card key={suite.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <suite.icon className="h-6 w-6 text-primary" />
                  {activeTestSuite === suite.id && (
                    <Badge variant="default" className="text-xs">
                      Running
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm">{suite.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {suite.description}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => runTestSuite(suite.id)}
                  disabled={activeTestSuite === suite.id}
                >
                  {activeTestSuite === suite.id ? (
                    <>
                      <Pause className="h-3 w-3 mr-2" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-2" />
                      Run Tests
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Overview */}
        {activeTestSuite && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="w-full" />
                
                {testResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent Results</h4>
                    <div className="space-y-1">
                      {testResults.slice(-5).map((result) => (
                        <div key={result.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span>{result.name}</span>
                          </div>
                          <span className={getStatusColor(result.status)}>
                            {result.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Test Suite */}
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="details">Test Details</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {activeTestSuite ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {testSuites.find(s => s.id === activeTestSuite)?.name} Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const suite = testSuites.find(s => s.id === activeTestSuite);
                    if (!suite) return null;
                    
                    const TestComponent = suite.component;
                    return <TestComponent />;
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Tests</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a test suite above to begin comprehensive testing
                  </p>
                  <Button onClick={() => runTestSuite('comprehensive')}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Comprehensive Tests
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Suite Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testSuites.map((suite) => (
                    <div key={suite.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <suite.icon className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">{suite.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {suite.description}
                      </p>
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Test Categories
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {suite.id === 'comprehensive' && (
                            <>
                              <Badge variant="outline" className="text-xs">Database</Badge>
                              <Badge variant="outline" className="text-xs">Authentication</Badge>
                              <Badge variant="outline" className="text-xs">UI Components</Badge>
                              <Badge variant="outline" className="text-xs">API Endpoints</Badge>
                            </>
                          )}
                          {suite.id === 'functionality' && (
                            <>
                              <Badge variant="outline" className="text-xs">CRUD Operations</Badge>
                              <Badge variant="outline" className="text-xs">Business Logic</Badge>
                              <Badge variant="outline" className="text-xs">Data Validation</Badge>
                            </>
                          )}
                          {suite.id === 'security' && (
                            <>
                              <Badge variant="outline" className="text-xs">RLS Policies</Badge>
                              <Badge variant="outline" className="text-xs">Data Isolation</Badge>
                              <Badge variant="outline" className="text-xs">Access Control</Badge>
                            </>
                          )}
                          {suite.id === 'performance' && (
                            <>
                              <Badge variant="outline" className="text-xs">Load Testing</Badge>
                              <Badge variant="outline" className="text-xs">Response Times</Badge>
                              <Badge variant="outline" className="text-xs">Memory Usage</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StandardPageLayout>
  );
};

export default Testing;