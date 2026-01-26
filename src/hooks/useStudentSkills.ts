import { useQuery } from '@tanstack/react-query';

// Define the skill data type since student_skills table doesn't exist yet
export interface StudentSkillData {
  id: string;
  student_id: string;
  skill_id: string;
  current_mastery_level: 'Beginning' | 'Developing' | 'Proficient' | 'Advanced';
  mastery_score: number | null;
  last_assessed_at: string | null;
  skill: {
    name: string;
    subject: string | null;
    grade_level?: string[] | null;
    description?: string | null;
  } | null;
}

export const useStudentSkills = (studentId: string) => {
  const {
    data: skills,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['student-skills', studentId],
    queryFn: async (): Promise<StudentSkillData[]> => {
      // student_skills table doesn't exist yet - return empty array
      // This will be populated once the table is created
      return [];
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    skills: skills || [],
    isLoading,
    error,
    refetch
  };
};
