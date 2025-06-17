
import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import AssessmentsPageHeader from '@/components/assessments/AssessmentsPageHeader';
import AssessmentsOverviewMetrics from '@/components/assessments/AssessmentsOverviewMetrics';
import AssessmentList from '@/components/assessments/AssessmentList';

const Assessments: React.FC = () => {
  return (
    <StandardPageLayout>
      <AssessmentsPageHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AssessmentsOverviewMetrics />
        <AssessmentList />
      </div>
    </StandardPageLayout>
  );
};

export default Assessments;
