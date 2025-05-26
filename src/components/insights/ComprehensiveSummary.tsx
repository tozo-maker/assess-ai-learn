
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  subject: string;
  assessment_date?: string;
}

interface StudentInsight {
  id: string;
  overall_summary?: string;
  created_at: string;
  assessments?: Assessment;
}

interface ComprehensiveSummaryProps {
  insights: StudentInsight[];
}

const ComprehensiveSummary: React.FC<ComprehensiveSummaryProps> = ({ insights }) => {
  const [showAllSummaries, setShowAllSummaries] = useState(false);

  if (insights.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-900 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {insights.length > 1 ? 'Comprehensive Learning Analysis' : 'Latest Assessment Summary'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-800 mb-3">{insights[0]?.overall_summary}</p>
        <div className="text-sm text-blue-600">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">
              Based on {insights.length} assessment{insights.length > 1 ? 's' : ''}:
            </span>
            {insights.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllSummaries(!showAllSummaries)}
                className="h-6 px-2 text-blue-600 hover:text-blue-700"
              >
                {showAllSummaries ? (
                  <>Hide Details <ChevronUp className="h-3 w-3 ml-1" /></>
                ) : (
                  <>Show Details <ChevronDown className="h-3 w-3 ml-1" /></>
                )}
              </Button>
            )}
          </div>
          
          {!showAllSummaries ? (
            <p className="text-blue-600">
              {insights.map(insight => `${insight.assessments?.title} (${insight.assessments?.subject})`).join(', ')}
            </p>
          ) : (
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={insight.id} className="p-2 bg-blue-100 rounded border-l-2 border-blue-400">
                  <div className="font-medium text-blue-800">
                    {insight.assessments?.title} ({insight.assessments?.subject})
                  </div>
                  {insight.overall_summary && (
                    <p className="text-sm text-blue-700 mt-1">{insight.overall_summary}</p>
                  )}
                  <div className="text-xs text-blue-600 mt-1">
                    {new Date(insight.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveSummary;
