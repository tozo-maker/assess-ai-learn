
import React from 'react';
import AssessmentWizard from '@/components/assessments/AssessmentWizard';
import { PageShell } from '@/components/ui/page-shell';

const AddAssessment: React.FC = () => {
  return (
    <PageShell
      title="Create Assessment"
      description="Create a new assessment for your students"
      link="/app/assessments"
      linkText="Back to Assessments"
    >
      <AssessmentWizard />
    </PageShell>
  );
};

export default AddAssessment;
