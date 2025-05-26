
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { goalAchievementsService } from '@/services/goal-achievements-service';
import { GoalAchievement } from '@/types/goals';

interface UseGoalAchievementsReturn {
  achievements: GoalAchievement[];
  celebratingAchievement: GoalAchievement | null;
  handleDismissAchievement: (achievementId: string) => Promise<void>;
  handleCelebrate: (achievement: GoalAchievement) => void;
  handleCloseCelebration: () => void;
  refetchAchievements: () => void;
  isLoading: boolean;
  error: Error | null;
}

export const useGoalAchievements = (studentId: string): UseGoalAchievementsReturn => {
  const [celebratingAchievement, setCelebratingAchievement] = useState<GoalAchievement | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const { data: achievements = [], refetch, isLoading, error } = useQuery({
    queryKey: ['goal-achievements', studentId],
    queryFn: () => goalAchievementsService.getRecentAchievements(studentId),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes for achievements
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
  });

  const visibleAchievements = achievements.filter(
    achievement => !dismissedIds.has(achievement.id) && !achievement.dismissed_at
  );

  const handleDismissAchievement = async (achievementId: string): Promise<void> => {
    try {
      await goalAchievementsService.dismissAchievement(achievementId);
      setDismissedIds(prev => new Set([...prev, achievementId]));
    } catch (error) {
      console.error('Failed to dismiss achievement:', error);
    }
  };

  const handleCelebrate = (achievement: GoalAchievement): void => {
    setCelebratingAchievement(achievement);
  };

  const handleCloseCelebration = (): void => {
    setCelebratingAchievement(null);
  };

  // Auto-celebrate new achievements
  useEffect(() => {
    const newAchievements = achievements.filter(
      achievement => !dismissedIds.has(achievement.id) && !achievement.dismissed_at
    );
    
    if (newAchievements.length > 0) {
      const latestAchievement = newAchievements[0];
      const achievementTime = new Date(latestAchievement.created_at).getTime();
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      // Only auto-celebrate achievements from the last 5 minutes
      if (achievementTime > fiveMinutesAgo && !celebratingAchievement) {
        setCelebratingAchievement(latestAchievement);
      }
    }
  }, [achievements, dismissedIds, celebratingAchievement]);

  return {
    achievements: visibleAchievements,
    celebratingAchievement,
    handleDismissAchievement,
    handleCelebrate,
    handleCloseCelebration,
    refetchAchievements: refetch,
    isLoading,
    error,
  };
};
