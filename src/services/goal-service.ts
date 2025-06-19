
import { supabase } from '@/integrations/supabase/client';
import { Goal } from '@/hooks/useGoalsData';

class GoalService {
  async getGoals(): Promise<Goal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Goal[];
  }

  async getGoalById(id: string): Promise<Goal | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .eq('teacher_id', user.id)
      .single();

    if (error) throw error;
    return data as Goal;
  }

  async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>): Promise<Goal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...goal,
        teacher_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  }

  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getGoalsByStudentId(studentId: string): Promise<Goal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('student_id', studentId)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Goal[];
  }
}

export const goalService = new GoalService();
