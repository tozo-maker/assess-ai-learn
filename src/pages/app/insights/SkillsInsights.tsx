
import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { Target } from 'lucide-react';
import { SkillsInsightsDashboard } from '@/components/insights/SkillsInsightsDashboard';

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
      <SkillsInsightsDashboard />
    </StandardPageLayout>
  );
};

export default SkillsInsights;
