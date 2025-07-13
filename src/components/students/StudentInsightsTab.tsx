
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StudentInsightsTabProps {
  studentId: string;
}

const StudentInsightsTab: React.FC<StudentInsightsTabProps> = ({ studentId }) => {
  // Fetch student assessment analyses
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['student-insights', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          assessment:assessments(title, subject)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">No AI Insights Available</h3>
          <p className="text-gray-600 mb-4">
            Complete some assessments to see AI-generated insights and recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Aggregate insights from all analyses
  const allStrengths = analyses.flatMap(a => a.strengths || []);
  const allGrowthAreas = analyses.flatMap(a => a.growth_areas || []);
  const allRecommendations = analyses.flatMap(a => a.recommendations || []);

  const uniqueStrengths = [...new Set(allStrengths)];
  const uniqueGrowthAreas = [...new Set(allGrowthAreas)];
  const uniqueRecommendations = [...new Set(allRecommendations)];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Learning Insights
        </h3>
        <p className="text-gray-600">Analysis based on {analyses.length} assessment(s)</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uniqueStrengths.length > 0 ? (
              <div className="space-y-2">
                {uniqueStrengths.slice(0, 5).map((strength, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    {strength}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No strengths identified yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Growth Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uniqueGrowthAreas.length > 0 ? (
              <div className="space-y-2">
                {uniqueGrowthAreas.slice(0, 5).map((area, index) => (
                  <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {area}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No growth areas identified yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Lightbulb className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {uniqueRecommendations.length > 0 ? (
            <div className="space-y-3">
              {uniqueRecommendations.slice(0, 6).map((recommendation, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recommendations available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessment Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyses.slice(0, 3).map((analysis) => (
              <div key={analysis.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{analysis.assessment?.title || 'Assessment'}</h4>
                  <Badge variant="outline">{analysis.assessment?.subject}</Badge>
                </div>
                {analysis.overall_summary && (
                  <p className="text-sm text-gray-600">{analysis.overall_summary}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentInsightsTab;
