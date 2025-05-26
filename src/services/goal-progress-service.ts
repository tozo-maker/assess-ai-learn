
import { supabase } from '@/integrations/supabase/client';
import { GoalProgressHistory } from '@/types/goals';

export const goalProgressService = {
  async addProgressEntry(goalId: string, progress: number, notes?: string): Promise<GoalProgressHistory> {
    const { data, error } = await supabase
      .from('goal_progress_history' as any)
      .insert({
        goal_id: goalId,
        progress_percentage: progress,
        notes
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as GoalProgressHistory;
  },

  async getProgressHistory(goalId: string): Promise<GoalProgressHistory[]> {
    const { data, error } = await supabase
      .from('goal_progress_history' as any)
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as GoalProgressHistory[];
  },

  async getStudentProgressTrend(studentId: string, days: number = 30): Promise<Array<{date: string, averageProgress: number}>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('goal_progress_history' as any)
      .select(`
        created_at,
        progress_percentage,
        goals!inner(student_id)
      `)
      .eq('goals.student_id', studentId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date and calculate average progress with proper typing
    const progressByDate = (data as any[]).reduce((acc: Record<string, { total: number, count: number }>, entry: any) => {
      const date = entry.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, count: 0 };
      }
      acc[date].total += entry.progress_percentage;
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.entries(progressByDate).map(([date, data]) => ({
      date,
      averageProgress: data.total / data.count
    }));
  }
};
