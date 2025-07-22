
import { useQuery } from '@tanstack/react-query';
import { skillsSeedingService } from '@/services/skills-seeding-service';
import { skillsService } from '@/services/skills-service';

export const useSkillsInitialization = () => {
  const { data: skills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ['skills-check'],
    queryFn: async () => {
      return await skillsService.getSkills();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { isLoading: isSeeding } = useQuery({
    queryKey: ['skills-seeding'],
    queryFn: async () => {
      if (skills && skills.length === 0) {
        console.log('No skills found, initializing...');
        await skillsSeedingService.createSkillCategories();
        await skillsSeedingService.seedSkills();
        return true;
      }
      return false;
    },
    enabled: skills !== undefined && skills.length === 0,
    retry: false,
  });

  return {
    skills: skills || [],
    isLoading: isLoadingSkills || isSeeding,
    hasSkills: skills && skills.length > 0
  };
};
