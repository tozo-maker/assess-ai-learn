
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';

interface ProgressReportSummaryProps {
  performance: {
    average_score: number;
    assessment_count: number;
    performance_level: string;
    needs_attention: boolean;
  };
}

const ProgressReportSummary: React.FC<ProgressReportSummaryProps> = ({ performance }) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{performance.average_score}%</div>
          <p className="text-xs text-muted-foreground">Based on {performance.assessment_count} assessments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Performance Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{performance.performance_level}</div>
          <p className="text-xs text-muted-foreground">Overall academic standing</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {performance.needs_attention ? (
              <>
                <Badge variant="destructive" className="mr-2">Needs Support</Badge>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </>
            ) : (
              <>
                <Badge variant="default" className="mr-2 bg-green-500">On Track</Badge>
                <Check className="h-4 w-4 text-green-500" />
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Based on recent performance</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressReportSummary;
