
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InteractiveInsightCard from './InteractiveInsightCard';

interface Assessment {
  id: string;
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

interface InsightsDisplayProps {
  filteredInsights: StudentInsight[];
  aggregatedInsights: {
    strengths: string[];
    growthAreas: string[];
    recommendations: string[];
  };
  onMarkAsAddressed: (item: string) => void;
  onCreateGoal: (item: string) => void;
}

const InsightsDisplay: React.FC<InsightsDisplayProps> = ({
  filteredInsights,
  aggregatedInsights,
  onMarkAsAddressed,
  onCreateGoal
}) => {
  return (
    <>
      {/* Interactive Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InteractiveInsightCard
          title="Strengths"
          items={aggregatedInsights.strengths}
          type="strength"
          onCreateGoal={onCreateGoal}
        />
        
        <InteractiveInsightCard
          title="Growth Areas"
          items={aggregatedInsights.growthAreas}
          type="growth"
          onCreateGoal={onCreateGoal}
        />
        
        <InteractiveInsightCard
          title="Recommendations"
          items={aggregatedInsights.recommendations}
          type="recommendation"
          onMarkAsAddressed={onMarkAsAddressed}
          onCreateGoal={onCreateGoal}
        />
      </div>

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredInsights.map((insight, index) => (
              <div key={insight.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
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
    </>
  );
};

export default InsightsDisplay;
