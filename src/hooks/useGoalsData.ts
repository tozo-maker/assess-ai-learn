
export interface Goal {
  id: string;
  student_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress_percentage?: number;
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}
