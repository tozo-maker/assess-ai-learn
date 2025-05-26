
import { supabase } from '@/integrations/supabase/client';
import { GoalAchievement } from '@/types/goals';

export const goalAchievementsService = {
  async createAchievement(
    goalId: string,
    studentId: string,
    achievementType: 'milestone_completed' | 'goal_completed' | 'progress_milestone',
    achievementData: any
  ): Promise<GoalAchievement> {
    const { data, error } = await supabase
      .from('goal_achievements' as any)
      .insert({
        goal_id: goalId,
        student_id: studentId,
        achievement_type: achievementType,
        achievement_data: achievementData
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as GoalAchievement;
  },

  async getStudentAchievements(studentId: string, limit: number = 10): Promise<GoalAchievement[]> {
    const { data, error } = await supabase
      .from('goal_achievements' as any)
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as unknown as GoalAchievement[];
  },

  async getRecentAchievements(studentId: string, days: number = 7): Promise<GoalAchievement[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('goal_achievements' as any)
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as GoalAchievement[];
  },

  async dismissAchievement(achievementId: string): Promise<void> {
    const { error } = await supabase
      .from('goal_achievements' as any)
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', achievementId);

    if (error) throw error;
  }
};
