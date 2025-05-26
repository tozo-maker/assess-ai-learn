
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { goalAchievementsService } from '@/services/goal-achievements-service';
import { GoalAchievement } from '@/types/goals';

export const useGoalAchievements = (studentId: string) => {
  const [celebratingAchievement, setCelebratingAchievement] = useState<GoalAchievement | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const { data: achievements = [], refetch } = useQuery({
    queryKey: ['goal-achievements', studentId],
    queryFn: () => goalAchievementsService.getRecentAchievements(studentId),
    enabled: !!studentId
  });

  const visibleAchievements = achievements.filter(
    achievement => !dismissedIds.has(achievement.id) && !achievement.dismissed_at
  );

  const handleDismissAchievement = async (achievementId: string) => {
    try {
      await goalAchievementsService.dismissAchievement(achievementId);
      setDismissedIds(prev => new Set([...prev, achievementId]));
    } catch (error) {
      console.error('Error dismissing achievement:', error);
    }
  };

  const handleCelebrate = (achievement: GoalAchievement) => {
    setCelebratingAchievement(achievement);
  };

  const handleCloseCelebration = () => {
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
    refetchAchievements: refetch
  };
};
