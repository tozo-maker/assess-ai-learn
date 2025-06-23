
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const useAchievements = () => {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recent achievements
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_achievements')
        .select(`
          *,
          students!inner(first_name, last_name)
        `)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform database results to match our interface
      return (data || []).map(item => ({
        id: item.id,
        goal_id: item.goal_id,
        student_id: item.student_id,
        achievement_type: item.achievement_type as Achievement['achievement_type'],
        achievement_data: item.achievement_data as Achievement['achievement_data'],
        created_at: item.created_at,
        dismissed_at: item.dismissed_at,
        student_name: `${item.students.first_name} ${item.students.last_name}`
      })) as Achievement[];
    },
    refetchInterval: 30000 // Check for new achievements every 30 seconds
  });

  // Dismiss achievement mutation
  const dismissAchievementMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const { error } = await supabase
        .from('goal_achievements')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', achievementId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      setShowCelebration(false);
      setCurrentAchievement(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to dismiss achievement',
        variant: 'destructive'
      });
    }
  });

  // Create achievement mutation
  const createAchievementMutation = useMutation({
    mutationFn: async (achievementData: {
      goal_id: string;
      student_id: string;
      achievement_type: Achievement['achievement_type'];
      achievement_data: Achievement['achievement_data'];
    }) => {
      const { data, error } = await supabase
        .from('goal_achievements')
        .insert(achievementData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newAchievement) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      // Transform and show celebration for new achievement
      const transformedAchievement: Achievement = {
        id: newAchievement.id,
        goal_id: newAchievement.goal_id,
        student_id: newAchievement.student_id,
        achievement_type: newAchievement.achievement_type as Achievement['achievement_type'],
        achievement_data: newAchievement.achievement_data as Achievement['achievement_data'],
        created_at: newAchievement.created_at,
        dismissed_at: newAchievement.dismissed_at
      };
      setCurrentAchievement(transformedAchievement);
      setShowCelebration(true);
    }
  });

  // Show celebration for new achievements
  useEffect(() => {
    if (achievements.length > 0 && !currentAchievement) {
      const latestAchievement = achievements[0];
      const achievementAge = Date.now() - new Date(latestAchievement.created_at).getTime();
      
      // Show celebration for achievements less than 5 minutes old
      if (achievementAge < 5 * 60 * 1000) {
        setCurrentAchievement(latestAchievement);
        setShowCelebration(true);
      }
    }
  }, [achievements, currentAchievement]);

  const handleDismissAchievement = (achievementId: string) => {
    dismissAchievementMutation.mutate(achievementId);
  };

  const createAchievement = (achievementData: Parameters<typeof createAchievementMutation.mutate>[0]) => {
    createAchievementMutation.mutate(achievementData);
  };

  return {
    achievements,
    isLoading,
    currentAchievement,
    showCelebration,
    setShowCelebration,
    handleDismissAchievement,
    createAchievement,
    isCreatingAchievement: createAchievementMutation.isPending
  };
};
