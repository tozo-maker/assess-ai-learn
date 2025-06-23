
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SkillsInsights: React.FC = () => {
  const actions = (
    <Target className="h-5 w-5 text-primary" />
  );

  return (
    <StandardPageLayout 
      title="Skills Insights"
      description="Analyze skill mastery patterns and learning progression"
      actions={actions}
      breadcrumbs={[
        { label: 'Insights', href: '/app/insights' },
        { label: 'Skills Insights' }
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>Skills Mastery Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Skills insights and mastery analytics will be displayed here.</p>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
};

export default SkillsInsights;
