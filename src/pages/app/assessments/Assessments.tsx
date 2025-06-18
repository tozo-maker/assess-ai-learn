
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import AssessmentsMainContent from '@/components/assessments/AssessmentsMainContent';
import { assessmentService } from '@/services/assessment-service';

const Assessments: React.FC = () => {
  const { data: assessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentService.getAssessments,
  });

  return (
    <AppLayout>
      <AssessmentsMainContent
        assessments={assessments}
        totalAssessments={assessments?.length || 0}
        filteredCount={assessments?.length || 0}
      />
    </AppLayout>
  );
};

export default Assessments;
