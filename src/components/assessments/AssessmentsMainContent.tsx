
import React from 'react';
import AssessmentsOverviewMetrics from './AssessmentsOverviewMetrics';
import AssessmentsAlertSystem from './AssessmentsAlertSystem';
import AssessmentList from './AssessmentList';

const AssessmentsMainContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <AssessmentsOverviewMetrics />
      <AssessmentsAlertSystem />
      <AssessmentList />
    </div>
  );
};

export default AssessmentsMainContent;
