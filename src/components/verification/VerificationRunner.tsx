
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { comprehensiveVerification, VerificationReport } from '@/utils/comprehensive-verification';
import EmailTestButton from './EmailTestButton';

const VerificationRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<VerificationReport[]>([]);
  const [progress, setProgress] = useState(0);

  const runVerification = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const verificationResults = await comprehensiveVerification.runCompleteVerification();
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(verificationResults);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'success' as const,
      fail: 'destructive' as const,
      warning: 'secondary' as const,
      info: 'outline' as const
    };
    
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Verification Suite</CardTitle>
          <CardDescription>
            Comprehensive testing of build, deployment, workflows, performance, and email systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              onClick={runVerification} 
              disabled={isRunning}
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Verification...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Complete Verification
                </>
              )}
            </Button>
            
            <EmailTestButton />
          </div>

          {isRunning && (
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Verification Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
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

              <div className="space-y-4">
                {Object.entries(groupedResults).map(([category, categoryResults]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categoryResults.map((result, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(result.status)}
                              <div>
                                <div className="font-medium">{result.test}</div>
                                <div className="text-sm text-muted-foreground">
                                  {result.message}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationRunner;
