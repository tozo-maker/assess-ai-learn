
import { useQuery } from '@tanstack/react-query';
import { skillsSeedingService } from '@/services/skills-seeding-service';
import { skillsService } from '@/services/skills-service';

export const useSkillsInitialization = () => {
  const { data: skillsCheck, isLoading: isLoadingCheck } = useQuery({
    queryKey: ['skills-count-check'],
    queryFn: async () => {
      console.log('Checking skills count...');
      const result = await skillsSeedingService.checkSkillsExist();
      console.log('Skills check result:', result);
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const { data: seedingResult, isLoading: isSeeding } = useQuery({
    queryKey: ['skills-seeding', skillsCheck?.count],
    queryFn: async () => {
      if (!skillsCheck) return null;
      
      console.log(`Skills count: ${skillsCheck.count}, exists: ${skillsCheck.exists}`);
      
      if (skillsCheck.count < 50) {
        console.log('Skills count is below 50, initiating seeding...');
        
        // First create categories
        await skillsSeedingService.createSkillCategories();
        
        // Then seed skills
        const result = await skillsSeedingService.seedSkills();
        console.log('Seeding result:', result);
        
        return result;
      }
      
      console.log('Skills already properly seeded, skipping');
      return { success: true, skillsCount: skillsCheck.count };
    },
    enabled: skillsCheck !== undefined,
    retry: false,
  });

  // Get actual skills for display
  const { data: skills, isLoading: isLoadingSkills, refetch: refetchSkills } = useQuery({
    queryKey: ['skills-for-display'],
    queryFn: async () => {
      return await skillsService.getSkills();
    },
    enabled: !isSeeding && (seedingResult?.success || (skillsCheck?.count || 0) >= 50),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = isLoadingCheck || isSeeding || isLoadingSkills;
  const hasSkills = (skills?.length || 0) >= 50;
  const skillsCount = skills?.length || skillsCheck?.count || 0;

  console.log('useSkillsInitialization state:', {
    isLoading,
    hasSkills,
    skillsCount,
    seedingResult,
    skillsCheck
  });

  return {
    skills: skills || [],
    isLoading,
    hasSkills,
    skillsCount,
    seedingResult,
    refetchSkills
  };
};
