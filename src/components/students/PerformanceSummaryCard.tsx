
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PerformanceSummaryCardProps {
  performanceData: {
    averageScore: number;
    assessmentsCompleted: number;
    needsAttention: boolean;
  };
}

const PerformanceSummaryCard: React.FC<PerformanceSummaryCardProps> = ({ performanceData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Summary</CardTitle>
        <CardDescription>Overview of student's academic performance</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <p className="text-lg font-medium">Average Score</p>
            <div className="text-2xl font-bold">{performanceData.averageScore}%</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <p className="text-lg font-medium">Assessments Completed</p>
            <div className="text-2xl font-bold">{performanceData.assessmentsCompleted}</div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <p className="text-lg font-medium">Needs Attention</p>
            <Badge variant={performanceData.needsAttention ? "destructive" : "secondary"}>
              {performanceData.needsAttention ? "Yes" : "No"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceSummaryCard;
