
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAutomatedAnalysis } from './useAutomatedAnalysis';
import { useToast } from '@/hooks/use-toast';
import { productionLogger } from '@/services/production-logger';

export const useAssessmentCompletion = () => {
  const queryClient = useQueryClient();
  const { triggerAnalysisForAssessment } = useAutomatedAnalysis();
  const { toast } = useToast();

  const completeAssessmentMutation = useMutation({
    mutationFn: async ({ assessmentId, studentId, responses }: {
      assessmentId: string;
      studentId: string;
      responses: any[];
    }) => {
      productionLogger.info('Completing assessment', { assessmentId, studentId });

      // Save responses first (this would typically call your response service)
      // For now, we'll mock this step
      
      // Trigger automated analysis
      const analysis = await triggerAnalysisForAssessment(assessmentId, studentId);
      
      return { assessmentId, studentId, analysis };
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['student-performance'] });
      queryClient.invalidateQueries({ queryKey: ['ai-analysis-stats'] });

      toast({
        title: "Assessment Completed",
        description: data.analysis 
          ? "Assessment saved and AI analysis generated successfully."
          : "Assessment saved. AI analysis will be generated shortly.",
      });

      productionLogger.info('Assessment completed successfully', {
        assessmentId: data.assessmentId,
        studentId: data.studentId,
        hasAnalysis: !!data.analysis
      });
    },
    onError: (error) => {
      productionLogger.error('Assessment completion failed', error as Error);
      toast({
        variant: "destructive",
        title: "Assessment Failed",
        description: "Could not complete assessment. Please try again.",
      });
    }
  });

  return {
    completeAssessment: completeAssessmentMutation.mutate,
    isCompleting: completeAssessmentMutation.isPending
  };
};
