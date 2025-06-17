
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import AssessmentsPageHeader from '@/components/assessments/AssessmentsPageHeader';
import AssessmentsOverviewMetrics from '@/components/assessments/AssessmentsOverviewMetrics';
import AssessmentList from '@/components/assessments/AssessmentList';

const Assessments: React.FC = () => {
  return (
    <AppLayout>
      <Breadcrumbs />
      <AssessmentsPageHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AssessmentsOverviewMetrics />
        <AssessmentList />
      </div>
    </AppLayout>
  );
};

export default Assessments;
