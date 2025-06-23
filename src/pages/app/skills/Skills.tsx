
import React from 'react';
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <SkillsMainContent
        skills={skills}
        filteredSkills={filteredSkills}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default Skills;
