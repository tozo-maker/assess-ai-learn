
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import SkillsMainContent from '@/components/skills/SkillsMainContent';
import { useSkillsData } from '@/hooks/useSkillsData';

const Skills: React.FC = () => {
  const {
    skills,
    filteredSkills,
    isLoading,
    filters,
    setFilters
  } = useSkillsData();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SkillsMainContent
        skills={skills}
        filteredSkills={filteredSkills}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </AppLayout>
  );
};

export default Skills;
