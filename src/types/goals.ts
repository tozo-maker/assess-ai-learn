
export interface Goal {
  id: string;
  student_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress_percentage?: number;
  category?: string;
  priority?: 'High' | 'Medium' | 'Low';
  tags?: string;
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
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  progress_percentage?: number;
  category?: string;
  priority?: 'High' | 'Medium' | 'Low';
  tags?: string;
}

// Goal Analytics Types
export interface GoalAnalytics {
  totalGoals: number;
  completedGoals: number;
  averageProgress: number;
  goalsByCategory: { [key: string]: number };
  goalsByPriority: { [key: string]: number };
  upcomingDeadlines: Goal[];
}

// Goal Progress History
export interface GoalProgressHistory {
  id: string;
  goal_id: string;
  progress_percentage: number;
  notes?: string;
  created_at: string;
}

// Goal Achievement
export interface GoalAchievement {
  id: string;
  goal_id: string;
  student_id: string;
  achievement_type: 'milestone_completed' | 'goal_completed' | 'progress_milestone';
  achievement_data: any;
  created_at: string;
}
