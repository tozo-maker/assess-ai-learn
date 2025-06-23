
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Recommendations: React.FC = () => {
  const actions = (
    <Lightbulb className="h-5 w-5 text-primary" />
  );

  return (
    <StandardPageLayout 
      title="AI Recommendations"
      description="View personalized recommendations for student learning"
      actions={actions}
      breadcrumbs={[
        { label: 'Insights', href: '/app/insights' },
        { label: 'Recommendations' }
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>Personalized Learning Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">AI-powered recommendations and learning suggestions will be displayed here.</p>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
};

export default Recommendations;
