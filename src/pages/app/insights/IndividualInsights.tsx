
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const IndividualInsights: React.FC = () => {
  const actions = (
    <User className="h-5 w-5 text-primary" />
  );

  return (
    <StandardPageLayout 
      title="Individual Insights"
      description="Analyze individual student performance and learning patterns"
      actions={actions}
      breadcrumbs={[
        { label: 'Insights', href: '/app/insights' },
        { label: 'Individual Insights' }
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>Student Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Individual student insights and analytics will be displayed here.</p>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
};

export default IndividualInsights;
