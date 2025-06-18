
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { DSSection, DSPageContainer, DSSpacer } from '@/components/ui/design-system';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import AssessmentsPageHeader from '@/components/assessments/AssessmentsPageHeader';
import AssessmentsMainContent from '@/components/assessments/AssessmentsMainContent';
import { assessmentService } from '@/services/assessment-service';

const Assessments: React.FC = () => {
  const { data: assessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentService.getAssessments,
  });

  return (
    <AppLayout>
      <DSSection className="py-8">
        <DSPageContainer>
          <Breadcrumbs />
          
          <AssessmentsPageHeader 
            totalAssessments={assessments?.length || 0}
            filteredCount={assessments?.length || 0}
          />

          <DSSpacer size="lg" />

          <AssessmentsMainContent />
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default Assessments;
