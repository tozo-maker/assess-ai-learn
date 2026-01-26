
import { useState } from 'react';

interface Achievement {
  id: string;
  goal_id: string;
  student_id: string;
  achievement_type: 'goal_completion' | 'milestone' | 'improvement' | 'skill_mastery';
  achievement_data: {
    title: string;
    description: string;
    score?: number;
    previous_score?: number;
    skill_name?: string;
  };
  created_at: string;
  dismissed_at?: string;
  student_name?: string;
}

// Mock achievements hook - goal_achievements table doesn't exist yet
export const useAchievements = () => {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Return empty achievements array - table doesn't exist yet
  const achievements: Achievement[] = [];
  const isLoading = false;

  const handleDismissAchievement = (_achievementId: string) => {
    setShowCelebration(false);
    setCurrentAchievement(null);
  };

  const createAchievement = (_achievementData: {
    goal_id: string;
    student_id: string;
    achievement_type: Achievement['achievement_type'];
    achievement_data: Achievement['achievement_data'];
  }) => {
    // No-op until table exists
    console.log('Achievement creation not available - table does not exist yet');
  };

  return {
    achievements,
    isLoading,
    currentAchievement,
    showCelebration,
    setShowCelebration,
    handleDismissAchievement,
    createAchievement,
    isCreatingAchievement: false
  };
};
