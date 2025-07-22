
import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { useSkillsInitialization } from '@/hooks/useSkillsInitialization';
import { useSkillsData } from '@/hooks/useSkillsData';
import SkillsFilters from '@/components/skills/SkillsFilters';
import SkillsTable from '@/components/skills/SkillsTable';

const Skills: React.FC = () => {
  const { isLoading: isInitializing, hasSkills } = useSkillsInitialization();
  const { skills, filteredSkills, isLoading: isLoadingSkills, filters, setFilters } = useSkillsData();

  const isLoading = isInitializing || isLoadingSkills;

  if (isLoading) {
    return (
      <StandardPageLayout
        title="Skills Management"
        subtitle="Manage curriculum skills and learning objectives"
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isInitializing ? 'Initializing skills database...' : 'Loading skills...'}
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
        subtitle="Manage curriculum skills and learning objectives"
      >
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No skills available. Please contact support.</p>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title="Skills Management"
      subtitle={`${filteredSkills.length} of ${skills.length} skills`}
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
