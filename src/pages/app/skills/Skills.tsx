
import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { useSkillsInitialization } from '@/hooks/useSkillsInitialization';
import { useSkillsData } from '@/hooks/useSkillsData';
import SkillsFilters from '@/components/skills/SkillsFilters';
import SkillsTable from '@/components/skills/SkillsTable';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { skillsSeedingService } from '@/services/skills-seeding-service';
import { useToast } from '@/hooks/use-toast';

const Skills: React.FC = () => {
  const { isLoading: isInitializing, hasSkills, skillsCount, seedingResult, refetchSkills } = useSkillsInitialization();
  const { skills, filteredSkills, isLoading: isLoadingSkills, filters, setFilters } = useSkillsData();
  const { toast } = useToast();

  const isLoading = isInitializing || isLoadingSkills;

  const handleForceSeed = async () => {
    try {
      toast({
        title: "Seeding Skills",
        description: "Force seeding skills database...",
      });
      
      const result = await skillsSeedingService.forceSeedSkills();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully seeded ${result.skillsCount} skills!`,
        });
        refetchSkills();
      } else {
        toast({
          title: "Error",
          description: "Failed to seed skills. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while seeding skills.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <StandardPageLayout
        title="Skills Management"
        description="Manage curriculum skills and learning objectives"
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isInitializing ? `Initializing skills database... (${skillsCount} skills)` : 'Loading skills...'}
            </p>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  if (!hasSkills && !isLoading) {
    return (
      <StandardPageLayout
        title="Skills Management"
        description="Manage curriculum skills and learning objectives"
      >
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Skills database needs initialization. Current count: {skillsCount}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {seedingResult?.success === false 
              ? "Automatic seeding failed. You can manually trigger the seeding process."
              : "Click below to seed the skills database with curriculum standards."
            }
          </p>
          <Button onClick={handleForceSeed}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Seed Skills Database
          </Button>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title="Skills Management"
      description={`${filteredSkills.length} of ${skills.length} skills`}
    >
      <div className="space-y-6">
        <SkillsFilters 
          filters={filters}
          onFiltersChange={setFilters}
          totalSkills={skills.length}
          filteredCount={filteredSkills.length}
        />
        
        <SkillsTable 
          skills={filteredSkills}
          isLoading={isLoading}
        />
      </div>
    </StandardPageLayout>
  );
};

export default Skills;
