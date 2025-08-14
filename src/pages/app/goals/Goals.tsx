
import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { Target } from 'lucide-react';
import GoalsMainContent from '@/components/goals/GoalsMainContent';
import { useGoalsData } from '@/hooks/useGoalsData';
import PageLoadingState from '@/components/common/PageLoadingState';
import PageErrorState from '@/components/common/PageErrorState';
import { useSEO } from '@/hooks/useSEO';

const Goals: React.FC = () => {
  const {
    goals,
    students,
    isLoading,
    error,
    refetch
  } = useGoalsData();

  useSEO({
    title: 'Learning Goals - LearnSpark AI',
    description: 'Set and track learning goals for your students. Monitor progress and achievement with AI-powered insights.',
    canonicalPath: '/app/goals'
  });

  const actions = (
    <Target className="h-5 w-5 text-primary" />
  );

  if (isLoading) {
    return (
      <StandardPageLayout 
        title="Learning Goals"
        actions={actions}
      >
        <PageLoadingState message="Loading goals and students..." />
      </StandardPageLayout>
    );
  }

  if (error) {
    return (
      <StandardPageLayout 
        title="Learning Goals"
        actions={actions}
      >
        <PageErrorState 
          error={error}
          onRetry={refetch}
          title="Goals Loading Error"
          description="Failed to load goals data. Please try again."
        />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout 
      title="Learning Goals"
      description="Set, track, and achieve learning objectives"
      actions={actions}
    >
      <GoalsMainContent 
        goals={goals}
        students={students}
      />
    </StandardPageLayout>
  );
};

export default Goals;
