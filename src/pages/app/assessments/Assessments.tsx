
import React from 'react';
import { PageShell } from '@/components/ui/page-shell';
import AssessmentList from '@/components/assessments/AssessmentList';

const Assessments: React.FC = () => {
  return (
    <PageShell>
      <AssessmentList />
    </PageShell>
  );
};

export default Assessments;
