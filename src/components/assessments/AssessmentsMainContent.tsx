
import React from 'react';
import { DSPageContainer, DSSection } from '@/components/ui/design-system';
import AssessmentsOverviewMetrics from './AssessmentsOverviewMetrics';
import AssessmentList from './AssessmentList';

const AssessmentsMainContent: React.FC = () => {
  return (
    <DSPageContainer className="pb-12">
      <DSSection className="py-8 space-y-8">
        <AssessmentsOverviewMetrics />
        <AssessmentList />
      </DSSection>
    </DSPageContainer>
  );
};

export default AssessmentsMainContent;
