
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
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
      <div className="space-y-0">
        <AssessmentsPageHeader 
          totalAssessments={assessments?.length || 0}
          filteredCount={assessments?.length || 0}
        />
        <AssessmentsMainContent />
      </div>
    </AppLayout>
  );
};

export default Assessments;
