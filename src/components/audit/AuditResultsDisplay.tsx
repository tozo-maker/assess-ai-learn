
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AuditCategory, AuditResult } from '@/types/audit';

interface AuditResultsDisplayProps {
  auditResults: AuditCategory[];
}

const AuditResultsDisplay: React.FC<AuditResultsDisplayProps> = ({ auditResults }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      default:
        return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="database">Database</TabsTrigger>
        <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        <TabsTrigger value="configuration">Config</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-4">
          {auditResults.map((category) => {
            const IconComponent = category.icon;
            const passCount = category.checks.filter(c => c.status === 'pass').length;
            const totalCount = category.checks.length;
            
            return (
              <Card key={category.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        category.score >= 80 ? 'bg-green-100' :
                        category.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          category.score >= 80 ? 'text-green-600' :
                          category.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        <p className="text-sm text-blue-600 mt-2">
                          {passCount}/{totalCount} checks passed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {category.score.toFixed(0)}%
                      </div>
                      <Badge variant={category.score >= 80 ? "default" : category.score >= 60 ? "secondary" : "destructive"}>
                        {category.score >= 80 ? "READY" : category.score >= 60 ? "NEEDS WORK" : "NOT READY"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      {auditResults.map((category) => (
        <TabsContent key={category.id} value={category.id} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                {category.name} Audit Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.checks.map((check, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <h4 className="font-medium">{check.check}</h4>
                          <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                          {check.recommendation && (
                            <p className="text-sm text-blue-600 mt-2">
                              💡 {check.recommendation}
                            </p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default AuditResultsDisplay;
