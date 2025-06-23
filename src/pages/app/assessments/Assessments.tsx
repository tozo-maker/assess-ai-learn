
import React from 'react';
import AssessmentsMainContent from '@/components/assessments/AssessmentsMainContent';
import { useQuery } from '@tanstack/react-query';

const Assessments: React.FC = () => {
  // Mock data for now - in a real app this would come from a service
  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      // This would be replaced with actual assessment service call
      return [];
    },
  });

  const totalAssessments = assessments.length;
  const filteredCount = assessments.length; // For now, no filtering applied

  return (
    <div className="p-6">
      <AssessmentsMainContent 
        assessments={assessments}
        totalAssessments={totalAssessments}
        filteredCount={filteredCount}
      />
    </div>
  );
};

export default Assessments;
