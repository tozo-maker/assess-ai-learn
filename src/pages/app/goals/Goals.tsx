
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import GoalsMainContent from '@/components/goals/GoalsMainContent';
import { useGoalsData } from '@/hooks/useGoalsData';

const Goals: React.FC = () => {
  const {
    goals,
    filteredGoals,
    isLoading,
    filters,
    setFilters,
    handleCreateGoal,
    handleUpdateGoal,
    handleDeleteGoal
  } = useGoalsData();

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
      <GoalsMainContent
        goals={goals}
        filteredGoals={filteredGoals}
        filters={filters}
        onFiltersChange={setFilters}
        onCreateGoal={handleCreateGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
      />
    </AppLayout>
  );
};

export default Goals;
