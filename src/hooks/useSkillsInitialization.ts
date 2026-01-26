import { useQuery } from '@tanstack/react-query';
import { skillsSeedingService } from '@/services/skills-seeding-service';
import { skillsService } from '@/services/skills-service';

export const useSkillsInitialization = () => {
  const { data: skillsCheck, isLoading: isLoadingCheck, error: checkError } = useQuery({
    queryKey: ['skills-count-check'],
    queryFn: async () => {
      const exists = await skillsSeedingService.checkIfSeeded();
      return { exists, count: exists ? 10 : 0 };
    },
    staleTime: 30 * 1000,
    retry: 2,
  });

  const { data: seedingResult, isLoading: isSeeding, error: seedingError } = useQuery({
    queryKey: ['skills-seeding', skillsCheck?.count],
    queryFn: async () => {
      if (!skillsCheck || skillsCheck.exists) {
        return { success: true, skillsCount: skillsCheck?.count || 0 };
      }
      
      await skillsSeedingService.createCategories();
      await skillsSeedingService.seedBasicSkills();
      
      return { success: true, skillsCount: 12 };
    },
    enabled: !!skillsCheck && !checkError,
    retry: 1,
    staleTime: 60 * 1000,
  });

  const { data: skills, isLoading: isLoadingSkills, refetch: refetchSkills } = useQuery({
    queryKey: ['skills-for-display'],
    queryFn: () => skillsService.getSkills(),
    enabled: !isSeeding && !seedingError,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingCheck || isSeeding || isLoadingSkills;
  const actualSkillsCount = skills?.length || 0;
  const hasSkills = actualSkillsCount > 0;

  return {
    skills: skills || [],
    isLoading,
    hasSkills,
    skillsCount: actualSkillsCount,
    seedingResult,
    status: isLoading ? 'loading' : hasSkills ? 'ready' : 'needs-seeding',
    errors: { checkError, seedingError },
    refetchSkills,
    debugInfo: { skillsCheck, seedingResult, actualSkillsCount }
  };
};
