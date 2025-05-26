
import { supabase } from '@/integrations/supabase/client';
import { GoalMilestone } from '@/types/goals';

export const milestonesService = {
  async addMilestone(goalId: string, milestone: Omit<GoalMilestone, 'id' | 'goal_id' | 'created_at'>): Promise<GoalMilestone> {
    const { data, error } = await supabase
      .from('goal_milestones')
      .insert({
        ...milestone,
        goal_id: goalId
      })
      .select()
      .single();

    if (error) throw error;
    return data as GoalMilestone;
  },

  async updateMilestone(milestoneId: string, updates: Partial<GoalMilestone>): Promise<GoalMilestone> {
    const { data, error } = await supabase
      .from('goal_milestones')
      .update(updates)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data as GoalMilestone;
  },

  async deleteMilestone(milestoneId: string): Promise<void> {
    const { error } = await supabase
      .from('goal_milestones')
      .delete()
      .eq('id', milestoneId);

    if (error) throw error;
  },

  async toggleMilestoneCompletion(milestoneId: string, completed: boolean): Promise<GoalMilestone> {
    const { data, error } = await supabase
      .from('goal_milestones')
      .update({
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data as GoalMilestone;
  }
};
