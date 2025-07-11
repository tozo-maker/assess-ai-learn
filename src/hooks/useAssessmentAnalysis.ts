import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export const useAssessmentAnalysis = (studentId: string) => {
  const {
    data: analyses,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['assessment-analysis', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          assessment:assessments(title, subject, assessment_date)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Tables<'assessment_analysis'> & {
        assessment: Tables<'assessments'>;
      })[];
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    analyses,
    isLoading,
    error,
    refetch
  };
};