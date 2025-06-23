
import React from 'react';
import GoalsMainContent from '@/components/goals/GoalsMainContent';
import AchievementCelebration from '@/components/achievements/AchievementCelebration';
import { useGoalsData } from '@/hooks/useGoalsData';
import { useAchievements } from '@/hooks/useAchievements';

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

  const {
    currentAchievement,
    showCelebration,
    setShowCelebration,
    handleDismissAchievement
  } = useAchievements();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <GoalsMainContent
        goals={goals}
        filteredGoals={filteredGoals}
        filters={filters}
        onFiltersChange={setFilters}
        onCreateGoal={handleCreateGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
      />
      
      {currentAchievement && showCelebration && (
        <AchievementCelebration
          achievement={{
            id: currentAchievement.id,
            type: currentAchievement.achievement_type === 'goal_completion' ? 'goal_completion' : 'improvement',
            title: currentAchievement.achievement_data.title,
            description: currentAchievement.achievement_data.description,
            student_name: currentAchievement.student_name || 'Student',
            score: currentAchievement.achievement_data.score,
            date: currentAchievement.created_at
          }}
          isVisible={showCelebration}
          onDismiss={() => {
            handleDismissAchievement(currentAchievement.id);
            setShowCelebration(false);
          }}
        />
      )}
    </div>
  );
};

export default Goals;
