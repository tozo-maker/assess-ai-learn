
import React from 'react';
import AssessmentsOverviewMetrics from './AssessmentsOverviewMetrics';
import AssessmentsAlertSystem from './AssessmentsAlertSystem';
import AssessmentList from './AssessmentList';

const AssessmentsMainContent: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="py-8 space-y-8">
        <AssessmentsOverviewMetrics />
        <AssessmentsAlertSystem />
        <AssessmentList />
      </div>
    </div>
  );
};

export default AssessmentsMainContent;
