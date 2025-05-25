
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InsightsTabContentProps {
  aiInsights: {
    strengths: string[];
    growth_areas: string[];
  };
}

const InsightsTabContent: React.FC<InsightsTabContentProps> = ({ aiInsights }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {aiInsights.strengths.map((strength, index) => (
              <li key={index} className="text-green-700">{strength}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Areas for Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {aiInsights.growth_areas.map((area, index) => (
              <li key={index} className="text-amber-700">{area}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsTabContent;
