
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { comprehensiveVerification, VerificationReport } from '@/utils/comprehensive-verification';

const VerificationRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<VerificationReport[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  const runVerification = async () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setResults([]);

    try {
      const verificationResults = await comprehensiveVerification.runCompleteVerification();
      setResults(verificationResults);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Info className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
      info: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, VerificationReport[]>);

  const summary = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const criticalIssues = results.filter(r => r.status === 'fail');
  const warnings = results.filter(r => r.status === 'warning');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Complete System Verification
          </CardTitle>
          <CardDescription>
            Run comprehensive tests for build, deployment, workflows, performance, and email systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runVerification} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Verification...
              </>
            ) : (
              'Start Complete Verification'
            )}
          </Button>
          
          {startTime && (
            <p className="text-sm text-muted-foreground mt-2">
              {isRunning ? 'Running...' : `Completed in ${Date.now() - startTime}ms`}
            </p>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{summary.pass || 0}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{summary.warning || 0}</div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{summary.fail || 0}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{summary.info || 0}</div>
                  <div className="text-sm text-muted-foreground">Info</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          {criticalIssues.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">🚨 Critical Issues for Final Polish</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {criticalIssues.map((issue, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium">{issue.category}:</span>
                      <span>{issue.test} - {issue.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-600">⚠️ Warnings for Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {warnings.map((warning, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">{warning.category}:</span>
                      <span>{warning.test} - {warning.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Results */}
          <div className="space-y-4">
            {Object.entries(groupedResults).map(([category, categoryResults]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <div className="font-medium">{result.test}</div>
                            <div className="text-sm text-muted-foreground">{result.message}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.duration && (
                            <span className="text-xs text-muted-foreground">
                              {result.duration}ms
                            </span>
                          )}
                          {getStatusBadge(result.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Manual Testing Required */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-600">🎯 Manual Testing Still Required</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• CSV student import workflow</li>
                <li>• Email sending with Resend API key</li>
                <li>• AI features with Anthropic API key</li>
                <li>• User registration flow</li>
                <li>• File uploads and exports</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default VerificationRunner;
