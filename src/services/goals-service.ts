
import { supabase } from '@/integrations/supabase/client';
import { GoalFormData, Goal, GoalMilestone, GoalWithMilestones } from '@/types/goals';

export const goalsService = {
  // Goals CRUD
  async createGoal(studentId: string, data: GoalFormData): Promise<Goal> {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error("User not authenticated");

    const goalData = {
      ...data,
      student_id: studentId,
      teacher_id: authData.user.id,
    };

    const { data: goal, error } = await supabase
      .from('goals')
      .insert(goalData)
      .select()
      .single();

    if (error) throw error;
    return goal as Goal;
  },

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

  async updateGoal(goalId: string, data: Partial<GoalFormData>): Promise<Goal> {
    const { data: goal, error } = await supabase
      .from('goals')
      .update(data)
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return goal as Goal;
  },

  async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
  },

  // AI Goal Suggestions
  async generateAIGoalSuggestions(studentId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-goal-suggestions', {
        body: { student_id: studentId }
      });

      if (error) {
        console.error('Error generating goal suggestions:', error);
        return this.getFallbackGoalSuggestions();
      }

      return data?.suggestions || this.getFallbackGoalSuggestions();
    } catch (error) {
      console.error('Error calling goal suggestions function:', error);
      return this.getFallbackGoalSuggestions();
    }
  },

  getFallbackGoalSuggestions(): string[] {
    return [
      "Improve reading comprehension through daily guided reading practice",
      "Develop mathematical problem-solving skills with multi-step word problems",
      "Enhance writing fluency through structured journal writing exercises",
      "Build critical thinking skills through analytical discussions",
      "Strengthen study skills and organization techniques"
    ];
  },

  // Milestones
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
  }
};
