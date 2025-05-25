
export interface Goal {
  id: string;
  student_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'paused';
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed_at?: string;
  created_at: string;
}

export interface GoalWithMilestones extends Goal {
  milestones: GoalMilestone[];
}

export interface GoalFormData {
  title: string;
  description?: string;
  target_date?: string;
  status?: 'active' | 'completed' | 'paused';
  progress_percentage?: number;
}
