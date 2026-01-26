// goal_milestones table doesn't exist in the schema
// This service provides stub implementations

import { GoalMilestone } from '@/types/goals';

export const milestonesService = {
  async addMilestone(goalId: string, milestone: Omit<GoalMilestone, 'id' | 'goal_id' | 'created_at'>): Promise<GoalMilestone> {
    // goal_milestones table doesn't exist - return mock
    console.log('addMilestone: table not implemented', { goalId, milestone });
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
    // goal_milestones table doesn't exist - return mock
    console.log('updateMilestone: table not implemented', { milestoneId, updates });
    return {
      id: milestoneId,
      goal_id: '',
      title: updates.title || '',
      description: updates.description,
      target_date: updates.target_date,
      completed_at: updates.completed_at,
      created_at: new Date().toISOString()
    };
  },

  async deleteMilestone(milestoneId: string): Promise<void> {
    // goal_milestones table doesn't exist
    console.log('deleteMilestone: table not implemented', milestoneId);
  },

  async toggleMilestoneCompletion(milestoneId: string, completed: boolean): Promise<GoalMilestone> {
    // goal_milestones table doesn't exist - return mock
    console.log('toggleMilestoneCompletion: table not implemented', { milestoneId, completed });
    return {
      id: milestoneId,
      goal_id: '',
      title: '',
      completed_at: completed ? new Date().toISOString() : undefined,
      created_at: new Date().toISOString()
    };
  }
};
