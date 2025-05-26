
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle2,
  Calendar 
} from 'lucide-react';

interface Assessment {
  title: string;
  subject: string;
  assessment_date?: string;
}

interface StudentInsight {
  id: string;
  overall_summary?: string;
  strengths: string[];
  growth_areas: string[];
  recommendations: string[];
  patterns_observed: string[];
  created_at: string;
  assessments?: Assessment;
}

interface InsightsTabContentProps {
  insights: StudentInsight[];
  isLoading: boolean;
  onViewAssessments: () => void;
}

const InsightsTabContent: React.FC<InsightsTabContentProps> = ({ 
  insights, 
  isLoading, 
  onViewAssessments 
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading insights...</p>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">No insights available</h3>
        <p className="text-gray-500 mb-4">
          Insights will be generated after the student completes assessments and AI analysis is performed.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onViewAssessments}>
          View Assessments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Latest Overall Summary */}
      {insights[0]?.overall_summary && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Latest Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800">{insights[0].overall_summary}</p>
            <div className="text-sm text-blue-600 mt-2">
              Based on: {insights[0].assessments?.title} ({insights[0].assessments?.subject})
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {insights.some(insight => insight.strengths?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Array.from(new Set(
                insights.flatMap(insight => insight.strengths || [])
              )).map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-green-800">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Growth Areas */}
      {insights.some(insight => insight.growth_areas?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Areas for Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Array.from(new Set(
                insights.flatMap(insight => insight.growth_areas || [])
              )).map((area, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-orange-800">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights.some(insight => insight.recommendations?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-700 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(new Set(
                insights.flatMap(insight => insight.recommendations || [])
              )).map((recommendation, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={insight.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{insight.assessments?.title}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(insight.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Subject: {insight.assessments?.subject}
                </div>
                {insight.patterns_observed?.length > 0 && (
                  <div className="text-sm">
                    <strong>Patterns:</strong> {insight.patterns_observed.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsTabContent;
