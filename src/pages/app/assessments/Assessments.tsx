
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import AssessmentsPageHeader from '@/components/assessments/AssessmentsPageHeader';
import AssessmentsMainContent from '@/components/assessments/AssessmentsMainContent';

const Assessments: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-0">
        <AssessmentsPageHeader />
        <AssessmentsMainContent />
      </div>
    </AppLayout>
  );
};

export default Assessments;
