
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { BookOpen } from 'lucide-react';
import SkillsMainContent from '@/components/skills/SkillsMainContent';
import { useSkillsData } from '@/hooks/useSkillsData';
import PageLoadingState from '@/components/common/PageLoadingState';
import PageErrorState from '@/components/common/PageErrorState';

const Skills: React.FC = () => {
  const {
    skills,
    filteredSkills,
    isLoading,
    error,
    refetch,
    filters,
    setFilters
  } = useSkillsData();

  const actions = (
    <BookOpen className="h-5 w-5 text-primary" />
  );

  if (isLoading) {
    return (
      <StandardPageLayout 
        title="Skills Management"
        actions={actions}
      >
        <PageLoadingState message="Loading skills data..." />
      </StandardPageLayout>
    );
  }

  if (error) {
    return (
      <StandardPageLayout 
        title="Skills Management"
        actions={actions}
      >
        <PageErrorState 
          error={error}
          onRetry={refetch}
          title="Skills Loading Error"
          description="Failed to load skills data. Please try again."
        />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout 
      title="Skills Management"
      description="Manage skills, categories, and track student mastery"
      actions={actions}
    >
      <SkillsMainContent
        skills={skills || []}
        filteredSkills={filteredSkills || []}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </StandardPageLayout>
  );
};

export default Skills;
