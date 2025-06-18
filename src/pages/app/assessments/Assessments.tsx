
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import AssessmentsPageHeader from '@/components/assessments/AssessmentsPageHeader';
import AssessmentsOverviewMetrics from '@/components/assessments/AssessmentsOverviewMetrics';
import AssessmentList from '@/components/assessments/AssessmentList';

const Assessments: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-0">
        <AssessmentsPageHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <AssessmentsOverviewMetrics />
          <AssessmentList />
        </div>
      </div>
    </AppLayout>
  );
};

export default Assessments;
