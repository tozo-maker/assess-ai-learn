
import { supabase } from '@/integrations/supabase/client';

export interface Skill {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  grade_level: string;
  subject: string;
  curriculum_standard?: string;
  difficulty_level: number;
  created_at: string;
  updated_at: string;
}

class SkillService {
  async getSkills(): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getSkillById(id: string): Promise<Skill | null> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}

export const skillService = new SkillService();
