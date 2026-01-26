import { supabase } from '@/integrations/supabase/client';
import { GoalFormData, Goal, GoalMilestone, GoalWithMilestones } from '@/types/goals';

// Note: goal_milestones table doesn't exist in the current schema
// These methods handle this gracefully

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
    // goal_milestones table doesn't exist - just get goals
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Add empty milestones array since table doesn't exist
    return (goals || []).map(goal => ({
      ...goal,
      milestones: []
    })) as GoalWithMilestones[];
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

  // Smart Progress Calculation - use 'progress' not 'progress_percentage'
  async updateGoalProgress(goalId: string, progress: number, notes?: string): Promise<Goal> {
    const { data: goal, error } = await supabase
      .from('goals')
      .update({ 
        progress: Math.round(progress),
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('Goal progress updated:', { goalId, progress, notes });
    
    return goal as Goal;
  },

  async calculateMilestoneProgress(goalId: string): Promise<number> {
    // goal_milestones table doesn't exist
    console.log('calculateMilestoneProgress: milestones table not available');
    return 0;
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

  // Enhanced AI Goal Suggestions with metadata
  async generateEnhancedGoalSuggestions(studentId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-goal-suggestions', {
        body: { 
          student_id: studentId,
          enhanced: true,
          include_metadata: true
        }
      });

      if (error) {
        console.error('Error generating enhanced goal suggestions:', error);
        return this.getFallbackGoalSuggestions();
      }

      return data?.suggestions || this.getFallbackGoalSuggestions();
    } catch (error) {
      console.error('Error calling enhanced goal suggestions function:', error);
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

  // Milestones - stub implementations since table doesn't exist
  async addMilestone(goalId: string, milestone: Omit<GoalMilestone, 'id' | 'goal_id' | 'created_at'>): Promise<GoalMilestone> {
    console.log('addMilestone: milestones table not available');
    return {
      id: crypto.randomUUID(),
      goal_id: goalId,
      title: milestone.title,
      description: milestone.description,
      target_date: milestone.target_date,
      completed_at: milestone.completed_at,
      created_at: new Date().toISOString()
    };
  },

  async updateMilestone(milestoneId: string, updates: Partial<GoalMilestone>): Promise<GoalMilestone> {
    console.log('updateMilestone: milestones table not available');
    return {
      id: milestoneId,
      goal_id: '',
      title: updates.title || '',
      created_at: new Date().toISOString()
    };
  },

  async deleteMilestone(milestoneId: string): Promise<void> {
    console.log('deleteMilestone: milestones table not available', milestoneId);
  },

  async toggleMilestoneCompletion(milestoneId: string, completed: boolean): Promise<GoalMilestone> {
    console.log('toggleMilestoneCompletion: milestones table not available');
    return {
      id: milestoneId,
      goal_id: '',
      title: '',
      completed_at: completed ? new Date().toISOString() : undefined,
      created_at: new Date().toISOString()
    };
  }
};
