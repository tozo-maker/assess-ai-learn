
import { useQuery } from '@tanstack/react-query';
import { skillsSeedingService } from '@/services/skills-seeding-service';
import { skillsService } from '@/services/skills-service';

export const useSkillsInitialization = () => {
  // First, check the current skills count
  const { data: skillsCheck, isLoading: isLoadingCheck, error: checkError } = useQuery({
    queryKey: ['skills-count-check'],
    queryFn: async () => {
      console.log('🔍 useSkillsInitialization: Checking skills count...');
      const result = await skillsSeedingService.checkSkillsExist();
      console.log('📊 Skills check result:', result);
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Then, seed skills if needed
  const { data: seedingResult, isLoading: isSeeding, error: seedingError } = useQuery({
    queryKey: ['skills-seeding', skillsCheck?.count],
    queryFn: async () => {
      if (!skillsCheck) {
        console.log('⏳ Waiting for skills check to complete...');
        return null;
      }
      
      console.log(`📊 Skills check complete: count=${skillsCheck.count}, exists=${skillsCheck.exists}`);
      
      // Target: 60+ skills (we have 67 total)
      if (skillsCheck.count < 60) {
        console.log(`🌱 Skills count (${skillsCheck.count}) below threshold (60), initiating seeding...`);
        
        try {
          // First create categories (optional)
          await skillsSeedingService.createSkillCategories();
          
          // Then seed skills
          const result = await skillsSeedingService.seedSkills();
          console.log('🎉 Seeding process result:', result);
          
          return result;
        } catch (error) {
          console.error('💥 Error during seeding process:', error);
          throw error;
        }
      }
      
      console.log('✅ Skills already properly seeded, skipping automatic seeding');
      return { success: true, skillsCount: skillsCheck.count };
    },
    enabled: !!skillsCheck && !checkError,
    retry: 1, // Only retry once for seeding
    staleTime: 60 * 1000, // 1 minute
  });

  // Finally, get actual skills for display (only after seeding is complete or not needed)
  const { data: skills, isLoading: isLoadingSkills, refetch: refetchSkills } = useQuery({
    queryKey: ['skills-for-display'],
    queryFn: async () => {
      console.log('📚 Fetching skills for display...');
      const skills = await skillsService.getSkills();
      console.log(`📊 Retrieved ${skills.length} skills for display`);
      return skills;
    },
    enabled: !isSeeding && !seedingError && (
      seedingResult?.success === true || 
      (skillsCheck?.count || 0) >= 60
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate loading state
  const isLoading = isLoadingCheck || isSeeding || isLoadingSkills;
  
  // Calculate if we have enough skills
  const actualSkillsCount = skills?.length || skillsCheck?.count || 0;
  const hasSkills = actualSkillsCount >= 60;
  
  // Determine current status
  let status = 'loading';
  if (checkError || seedingError) {
    status = 'error';
  } else if (isLoading) {
    status = 'loading';
  } else if (!hasSkills) {
    status = 'needs-seeding';
  } else {
    status = 'ready';
  }

  const debugInfo = {
    skillsCheck,
    seedingResult,
    actualSkillsCount,
    hasSkills,
    status,
    isLoading,
    errors: {
      checkError: checkError?.message,
      seedingError: seedingError?.message,
    }
  };

  console.log('🔧 useSkillsInitialization state:', debugInfo);

  return {
    skills: skills || [],
    isLoading,
    hasSkills,
    skillsCount: actualSkillsCount,
    seedingResult,
    status,
    errors: {
      checkError,
      seedingError,
    },
    refetchSkills,
    debugInfo
  };
};
