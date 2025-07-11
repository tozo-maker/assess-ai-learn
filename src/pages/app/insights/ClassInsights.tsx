
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { TrendingUp } from 'lucide-react';
import { ClassInsightsDashboard } from '@/components/insights/ClassInsightsDashboard';

const ClassInsights: React.FC = () => {
  const actions = (
    <TrendingUp className="h-5 w-5 text-primary" />
  );

  return (
    <StandardPageLayout 
      title="Class Insights"
      description="Analyze class-wide performance patterns and trends"
      actions={actions}
      breadcrumbs={[
        { label: 'Insights', href: '/app/insights' },
        { label: 'Class Insights' }
      ]}
    >
      <ClassInsightsDashboard />
    </StandardPageLayout>
  );
};

export default ClassInsights;
