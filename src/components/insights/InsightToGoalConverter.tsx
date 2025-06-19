
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { goalService } from '@/services/goal-service';
import { Target, Lightbulb, Plus, CheckCircle2 } from 'lucide-react';

interface InsightToGoalConverterProps {
  insight: {
    id: string;
    overall_summary?: string;
    recommendations?: string[];
    growth_areas?: string[];
    student_id?: string;
  };
  studentName?: string;
  onGoalCreated?: () => void;
}

const InsightToGoalConverter: React.FC<InsightToGoalConverterProps> = ({
  insight,
  studentName,
  onGoalCreated
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [convertedGoals, setConvertedGoals] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createGoalMutation = useMutation({
    mutationFn: (goalData: any) => goalService.createGoal(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Goal Created",
        description: "Successfully converted insight to actionable goal"
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create goal"
      });
    }
  });

  const convertInsightToGoal = async (recommendation: string, growthArea?: string) => {
    if (!insight.student_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No student associated with this insight"
      });
      return;
    }

    setIsConverting(true);

    try {
      const goalTitle = growthArea 
        ? `Improve: ${growthArea}`
        : `Action: ${recommendation.substring(0, 50)}${recommendation.length > 50 ? '...' : ''}`;

      const goalDescription = `Generated from AI insight: ${insight.overall_summary || 'Assessment analysis'}\n\nRecommendation: ${recommendation}`;

      const goalData = {
        student_id: insight.student_id,
        title: goalTitle,
        description: goalDescription,
        status: 'active' as const,
        priority: 'medium' as const,
        progress_percentage: 0,
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
      };

      await createGoalMutation.mutateAsync(goalData);
      setConvertedGoals(prev => [...prev, recommendation]);
      onGoalCreated?.();

    } catch (error) {
      console.error('Failed to convert insight to goal:', error);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Lightbulb className="h-5 w-5" />
          Convert Insights to Goals
          {studentName && <Badge variant="outline">{studentName}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insight.overall_summary && (
          <div className="p-3 bg-white rounded-lg border">
            <h4 className="font-medium text-sm mb-2">Insight Summary</h4>
            <p className="text-sm text-gray-600">{insight.overall_summary}</p>
          </div>
        )}

        {insight.recommendations && insight.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Actionable Recommendations
            </h4>
            <div className="space-y-2">
              {insight.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm">{rec}</p>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {convertedGoals.includes(rec) ? (
                      <Button size="sm" variant="outline" disabled className="text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Converted
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => convertInsightToGoal(rec)}
                        disabled={isConverting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Goal
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {insight.growth_areas && insight.growth_areas.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-3">Growth Areas</h4>
            <div className="space-y-2">
              {insight.growth_areas.map((area, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{area}</p>
                  </div>
                  <div className="ml-3">
                    {convertedGoals.includes(area) ? (
                      <Button size="sm" variant="outline" disabled className="text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Goal Created
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => convertInsightToGoal(`Focus on improving ${area}`, area)}
                        disabled={isConverting}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        Set Goal
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!insight.recommendations || insight.recommendations.length === 0) && 
         (!insight.growth_areas || insight.growth_areas.length === 0) && (
          <div className="text-center py-6">
            <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No actionable recommendations available for goal conversion.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightToGoalConverter;
