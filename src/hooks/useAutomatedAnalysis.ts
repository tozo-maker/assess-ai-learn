
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { enhancedAnalysisService } from '@/services/enhanced-analysis-service';
import { useToast } from '@/hooks/use-toast';
import { productionLogger } from '@/services/production-logger';

export const useAutomatedAnalysis = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const triggerAnalysisForAssessment = async (assessmentId: string, studentId: string) => {
    try {
      productionLogger.info('Triggering automated analysis', { assessmentId, studentId });
      
      // Check if analysis already exists
      const existingAnalysis = await enhancedAnalysisService.getAnalysis(assessmentId, studentId);
      if (existingAnalysis) {
        productionLogger.info('Analysis already exists, skipping', { assessmentId, studentId });
        return existingAnalysis;
      }

      // Fetch student responses for analysis
      const responses = await queryClient.fetchQuery({
        queryKey: ['student-responses', assessmentId, studentId],
        queryFn: async () => {
          // This would typically fetch from your responses service
          return [];
        }
      });

      if (responses.length === 0) {
        productionLogger.warn('No responses found for analysis', { assessmentId, studentId });
        return null;
      }

      // Generate analysis
      const analysis = await enhancedAnalysisService.generateComprehensiveAnalysis({
        assessmentId,
        studentId,
        responses: responses.map((r: any) => ({
          question_id: r.question_id || r.id,
          answer: r.answer || r.response,
          points_earned: r.points_earned || r.score || 0,
          is_correct: r.is_correct || (r.score > 0)
        }))
      });

      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['assessment-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['student-performance'] });

      toast({
        title: "Analysis Complete",
        description: `AI analysis generated for student assessment.`,
      });

      return analysis;
    } catch (error) {
      productionLogger.error('Automated analysis failed', error as Error, { assessmentId, studentId });
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not generate automated analysis. Please try again.",
      });
      throw error;
    }
  };

  const triggerBatchAnalysis = async (assessmentId: string, studentIds: string[]) => {
    const results = [];
    
    for (const studentId of studentIds) {
      try {
        const result = await triggerAnalysisForAssessment(assessmentId, studentId);
        if (result) results.push(result);
      } catch (error) {
        productionLogger.error('Batch analysis failed for student', error as Error, { assessmentId, studentId });
      }
    }

    return results;
  };

  return {
    triggerAnalysisForAssessment,
    triggerBatchAnalysis
  };
};
