
import { supabase } from '@/integrations/supabase/client';
import { Goal, GoalMilestone, GoalFormData, GoalWithMilestones } from '@/types/goals';

export const goalsService = {
  async getStudentGoals(studentId: string): Promise<GoalWithMilestones[]> {
    const { data: goals, error } = await supabase
      .from('goals')
      .select(`
        *,
        milestones:goal_milestones(*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return goals as GoalWithMilestones[];
  },

  async createGoal(studentId: string, goalData: GoalFormData): Promise<Goal> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .insert({
        student_id: studentId,
        teacher_id: user.user.id,
        ...goalData
      })
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  },

  async updateGoal(goalId: string, updates: Partial<GoalFormData>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  },

  async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
  },

  async addMilestone(goalId: string, milestone: Omit<GoalMilestone, 'id' | 'goal_id' | 'created_at'>): Promise<GoalMilestone> {
    const { data, error } = await supabase
      .from('goal_milestones')
      .insert({
        goal_id: goalId,
        ...milestone
      })
      .select()
      .single();

    if (error) throw error;
    return data as GoalMilestone;
  },

  async completeMilestone(milestoneId: string): Promise<GoalMilestone> {
    const { data, error } = await supabase
      .from('goal_milestones')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data as GoalMilestone;
  },

  async generateAIGoalSuggestions(studentId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-goal-suggestions', {
        body: { student_id: studentId }
      });

      if (error) throw error;
      return data.suggestions || [];
    } catch (error) {
      console.error('Error generating goal suggestions:', error);
      throw error;
    }
  }
};
