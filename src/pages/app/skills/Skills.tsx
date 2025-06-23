
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
