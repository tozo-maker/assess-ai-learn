import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export const useStudentSkills = (studentId: string) => {
  const {
    data: skills,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['student-skills', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_skills')
        .select(`
          *,
          skill:skills(
            name,
            subject,
            grade_level,
            description,
            difficulty_level
          )
        `)
        .eq('student_id', studentId)
        .order('last_assessed_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as (Tables<'student_skills'> & {
        skill: Tables<'skills'>;
      })[];
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    skills,
    isLoading,
    error,
    refetch
  };
};