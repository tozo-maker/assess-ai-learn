
import React from 'react';
import { PageShell } from '@/components/ui/page-shell';

const BatchAssessment: React.FC = () => {
  return (
    <PageShell
      title="Batch Assessment Entry"
      description="Enter assessment data for multiple students at once"
      link="/app/assessments"
      linkText="Back to Assessments"
    >
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">Coming Soon</h2>
        <p className="mt-2">Batch assessment entry functionality is under development.</p>
      </div>
    </PageShell>
  );
};

export default BatchAssessment;
