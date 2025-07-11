
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Lightbulb } from 'lucide-react';
import { RecommendationsDashboard } from '@/components/insights/RecommendationsDashboard';

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
      <RecommendationsDashboard />
    </StandardPageLayout>
  );
};

export default Recommendations;
