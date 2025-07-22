
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AssessmentsMainContent from '@/components/assessments/AssessmentsMainContent';
import { assessmentService } from '@/services/assessment-service';
import { useToast } from '@/hooks/use-toast';

const Assessments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { 
    data: assessments = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['assessments', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return await assessmentService.getAssessments();
    },
    enabled: !!user?.id,
    retry: 2,
    onError: (error: Error) => {
      console.error('Failed to fetch assessments:', error);
      toast({
        variant: "destructive",
        title: "Error loading assessments",
        description: error.message || "Please try again later.",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Failed to load assessments</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalAssessments = assessments.length;
  const filteredCount = assessments.length;

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
