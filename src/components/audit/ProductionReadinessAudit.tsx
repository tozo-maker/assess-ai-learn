
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Database, 
  TrendingUp, 
  Settings,
  PlayCircle,
  Wrench
} from 'lucide-react';
import { AuditCategory } from '@/types/audit';
import { runSecurityAudit } from '@/services/audit/security-audit';
import { runDatabaseAudit } from '@/services/audit/database-audit';
import { runMonitoringAudit } from '@/services/audit/monitoring-audit';
import { runConfigurationAudit } from '@/services/audit/configuration-audit';
import AuditResultsDisplay from './AuditResultsDisplay';

const ProductionReadinessAudit = () => {
  const [auditResults, setAuditResults] = useState<AuditCategory[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const { toast } = useToast();

  const runProductionAudit = async () => {
    setIsRunning(true);
    
    try {
      const categories: AuditCategory[] = [
        {
          id: 'security',
          name: 'Security & Authentication',
          description: 'Security policies, authentication, and data protection',
          icon: Shield,
          checks: [],
          score: 0
        },
        {
          id: 'database',
          name: 'Database & Performance',
          description: 'Database optimization, indexing, and query performance',
          icon: Database,
          checks: [],
          score: 0
        },
        {
          id: 'monitoring',
          name: 'Monitoring & Logging',
          description: 'Error tracking, performance monitoring, and logging',
          icon: TrendingUp,
          checks: [],
          score: 0
        },
        {
          id: 'configuration',
          name: 'Configuration & Environment',
          description: 'Environment variables, API keys, and configuration',
          icon: Settings,
          checks: [],
          score: 0
        }
      ];

      // Run audits
      await runSecurityAudit(categories[0]);
      await runDatabaseAudit(categories[1]);
      await runMonitoringAudit(categories[2]);
      await runConfigurationAudit(categories[3]);

      // Calculate overall score
      const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
      const avgScore = totalScore / categories.length;
      
      setAuditResults(categories);
      setOverallScore(avgScore);
      
      toast({
        title: "Production Audit Complete",
        description: `Overall readiness score: ${avgScore.toFixed(1)}%`
      });
      
    } catch (error) {
      console.error('Production audit failed:', error);
      toast({
        variant: "destructive",
        title: "Audit Failed",
        description: "An error occurred during the production readiness audit"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            Production Readiness Audit
          </CardTitle>
          <CardDescription>
            Comprehensive audit of your LearnSpark AI platform for production deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={runProductionAudit}
              disabled={isRunning}
              size="lg"
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running Audit...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Run Production Audit
                </>
              )}
            </Button>

            {overallScore > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {overallScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  Overall Readiness Score
                </div>
              </div>
            )}
          </div>

          {overallScore > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Production Readiness</span>
                <span>{overallScore.toFixed(1)}%</span>
              </div>
              <Progress value={overallScore} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {auditResults.length > 0 && (
        <AuditResultsDisplay auditResults={auditResults} />
      )}
    </div>
  );
};

export default ProductionReadinessAudit;
