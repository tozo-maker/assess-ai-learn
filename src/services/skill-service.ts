
import { supabase } from '@/integrations/supabase/client';
import { Skill } from '@/hooks/useSkillsData';

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
