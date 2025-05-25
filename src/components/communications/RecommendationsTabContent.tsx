
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationsTabContentProps {
  recommendations: string[];
}

const RecommendationsTabContent: React.FC<RecommendationsTabContentProps> = ({ recommendations }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-3">
          {recommendations.map((recommendation, index) => (
            <li key={index}>{recommendation}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecommendationsTabContent;
