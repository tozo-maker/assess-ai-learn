
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Lightbulb } from 'lucide-react';

interface Insight {
  id: string;
  student_id: string;
  strengths: string[];
  growth_areas: string[];
  recommendations: string[];
  overall_summary: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface InsightSelectionProps {
  insights: Insight[];
  students: Student[];
  selectedInsights: Set<string>;
  onInsightSelection: (insightId: string, checked: boolean) => void;
}

const InsightSelection: React.FC<InsightSelectionProps> = ({
  insights,
  students,
  selectedInsights,
  onInsightSelection
}) => {
  if (insights.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No insights available. Complete some assessments to generate AI insights.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Available Insights ({insights.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {insights.map(insight => {
            const student = students.find(s => s.id === insight.student_id);
            const isSelected = selectedInsights.has(insight.id);
            
            return (
              <div 
                key={insight.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => onInsightSelection(insight.id, !isSelected)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">
                      {student?.first_name} {student?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{insight.overall_summary}</p>
                  </div>
                  {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                </div>
                
                {insight.growth_areas.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Growth Areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {insight.growth_areas.slice(0, 2).map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightSelection;
