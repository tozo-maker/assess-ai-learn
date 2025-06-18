
import React from 'react';
import { DSSection, DSPageContainer, DSSpacer } from '@/components/ui/design-system';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import AssessmentsPageHeader from './AssessmentsPageHeader';
import AssessmentsOverviewMetrics from './AssessmentsOverviewMetrics';
import AssessmentsAlertSystem from './AssessmentsAlertSystem';
import AssessmentList from './AssessmentList';

interface AssessmentsMainContentProps {
  assessments?: any[];
  totalAssessments: number;
  filteredCount: number;
}

const AssessmentsMainContent: React.FC<AssessmentsMainContentProps> = ({
  assessments,
  totalAssessments,
  filteredCount
}) => {
  return (
    <DSSection className="py-8">
      <DSPageContainer>
        <Breadcrumbs />
        
        <AssessmentsPageHeader 
          totalAssessments={totalAssessments}
          filteredCount={filteredCount}
        />

        <DSSpacer size="lg" />

        <div className="space-y-8">
          <AssessmentsOverviewMetrics />
          <AssessmentsAlertSystem />
          <AssessmentList />
        </div>
      </DSPageContainer>
    </DSSection>
  );
};

export default AssessmentsMainContent;
