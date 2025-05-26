
import { supabase } from '@/integrations/supabase/client';
import { GoalFormData, Goal, GoalMilestone, GoalWithMilestones } from '@/types/goals';
import { goalProgressService } from './goal-progress-service';
import { goalAchievementsService } from './goal-achievements-service';

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
    
    // Add initial progress entry
    if (goal.progress_percentage && goal.progress_percentage > 0) {
      await goalProgressService.addProgressEntry(
        goal.id, 
        goal.progress_percentage, 
        'Initial goal creation'
      );
    }
    
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

  // Smart Progress Calculation
  async updateGoalProgress(goalId: string, progress: number, notes?: string): Promise<Goal> {
    // Get current goal data
    const { data: currentGoal } = await supabase
      .from('goals')
      .select('*, student_id')
      .eq('id', goalId)
      .single();

    const { data: goal, error } = await supabase
      .from('goals')
      .update({ 
        progress_percentage: Math.round(progress),
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    
    // Add progress history entry
    await goalProgressService.addProgressEntry(goalId, Math.round(progress), notes);
    
    // Check for achievements
    if (currentGoal) {
      const oldProgress = currentGoal.progress_percentage || 0;
      const newProgress = Math.round(progress);
      
      // Goal completion achievement
      if (oldProgress < 100 && newProgress >= 100) {
        await goalAchievementsService.createAchievement(
          goalId,
          currentGoal.student_id,
          'goal_completed',
          { title: goal.title, progress: newProgress }
        );
      }
      
      // Progress milestone achievements (25%, 50%, 75%)
      const milestones = [25, 50, 75];
      for (const milestone of milestones) {
        if (oldProgress < milestone && newProgress >= milestone) {
          await goalAchievementsService.createAchievement(
            goalId,
            currentGoal.student_id,
            'progress_milestone',
            { title: goal.title, milestone, progress: newProgress }
          );
        }
      }
    }
    
    return goal as Goal;
  },

  async calculateMilestoneProgress(goalId: string): Promise<number> {
    const { data: milestones, error } = await supabase
      .from('goal_milestones')
      .select('id, completed_at')
      .eq('goal_id', goalId);

    if (error) throw error;
    
    if (!milestones || milestones.length === 0) return 0;
    
    const completedCount = milestones.filter(m => m.completed_at).length;
    return (completedCount / milestones.length) * 100;
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
    
    // Update goal progress based on milestones
    const newProgress = await this.calculateMilestoneProgress(goalId);
    await this.updateGoalProgress(goalId, newProgress, 'Milestone added');
    
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
    // Get goal_id before deleting
    const { data: milestone } = await supabase
      .from('goal_milestones')
      .select('goal_id')
      .eq('id', milestoneId)
      .single();

    const { error } = await supabase
      .from('goal_milestones')
      .delete()
      .eq('id', milestoneId);

    if (error) throw error;
    
    // Update goal progress after deletion
    if (milestone) {
      const newProgress = await this.calculateMilestoneProgress(milestone.goal_id);
      await this.updateGoalProgress(milestone.goal_id, newProgress, 'Milestone removed');
    }
  },

  async toggleMilestoneCompletion(milestoneId: string, completed: boolean): Promise<GoalMilestone> {
    const { data, error } = await supabase
      .from('goal_milestones')
      .update({
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', milestoneId)
      .select('*, goal_id')
      .single();

    if (error) throw error;
    
    // Get goal and student info for achievements
    const { data: goal } = await supabase
      .from('goals')
      .select('title, student_id')
      .eq('id', data.goal_id)
      .single();
    
    // Create milestone achievement
    if (completed && goal) {
      await goalAchievementsService.createAchievement(
        data.goal_id,
        goal.student_id,
        'milestone_completed',
        { title: data.title, goalTitle: goal.title }
      );
    }
    
    // Update goal progress based on milestone completion
    const newProgress = await this.calculateMilestoneProgress(data.goal_id);
    await this.updateGoalProgress(data.goal_id, newProgress, 
      completed ? `Milestone completed: ${data.title}` : `Milestone uncompleted: ${data.title}`
    );
    
    return data as GoalMilestone;
  }
};
