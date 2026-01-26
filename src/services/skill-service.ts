// Skill interface aligned with actual skills table in database
export interface Skill {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  grade_levels?: string[] | null;
  subject?: string | null;
  created_at: string;
}

class SkillService {
  async getSkills(): Promise<Skill[]> {
    // Import supabase dynamically to avoid circular deps
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []) as Skill[];
  }

  async getSkillById(id: string): Promise<Skill | null> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Skill;
  }
}

export const skillService = new SkillService();
