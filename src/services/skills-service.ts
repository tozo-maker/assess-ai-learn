
import { supabase } from '@/integrations/supabase/client';

export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  grade_levels: string[];
  subject: string;
  created_at: string;
  updated_at: string;
}

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
  category?: SkillCategory;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_id: string;
  current_mastery_level: 'Beginning' | 'Developing' | 'Proficient' | 'Advanced';
  mastery_score: number;
  assessment_count: number;
  last_assessed_at?: string;
  created_at: string;
  updated_at: string;
  skill?: Skill;
}

export interface SkillMasteryHistory {
  id: string;
  student_id: string;
  skill_id: string;
  assessment_id?: string;
  mastery_level: 'Beginning' | 'Developing' | 'Proficient' | 'Advanced';
  score: number;
  date_recorded: string;
  created_at: string;
}

export interface AssessmentSkillMapping {
  id: string;
  assessment_id: string;
  assessment_item_id?: string;
  skill_id: string;
  weight: number;
  created_at: string;
}

type MasteryLevel = 'Beginning' | 'Developing' | 'Proficient' | 'Advanced';

function validateMasteryLevel(level: string): MasteryLevel {
  const validLevels: MasteryLevel[] = ['Beginning', 'Developing', 'Proficient', 'Advanced'];
  if (validLevels.includes(level as MasteryLevel)) {
    return level as MasteryLevel;
  }
  return 'Beginning'; // Default fallback
}

export const skillsService = {
  // Skill Categories
  async getSkillCategories(): Promise<SkillCategory[]> {
    const { data, error } = await supabase
      .from('skill_categories')
      .select('*')
      .order('subject', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSkillCategory(category: Omit<SkillCategory, 'id' | 'created_at' | 'updated_at'>): Promise<SkillCategory> {
    const { data, error } = await supabase
      .from('skill_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Skills
  async getSkills(filters?: { subject?: string; grade_level?: string; category_id?: string }): Promise<Skill[]> {
    let query = supabase
      .from('skills')
      .select(`
        *,
        category:skill_categories(*)
      `)
      .order('subject', { ascending: true })
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true });

    if (filters?.subject) {
      query = query.eq('subject', filters.subject);
    }
    if (filters?.grade_level) {
      query = query.eq('grade_level', filters.grade_level);
    }
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<Skill> {
    const { data, error } = await supabase
      .from('skills')
      .insert(skill)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    const { data, error } = await supabase
      .from('skills')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSkill(id: string): Promise<void> {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Student Skills
  async getStudentSkills(studentId: string): Promise<StudentSkill[]> {
    const { data, error } = await supabase
      .from('student_skills')
      .select(`
        *,
        skill:skills(
          *,
          category:skill_categories(*)
        )
      `)
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    // Type-safe transformation with mastery level validation
    return (data || []).map(item => ({
      ...item,
      current_mastery_level: validateMasteryLevel(item.current_mastery_level),
    })) as StudentSkill[];
  },

  async getClassSkillsSummary(teacherId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('student_skills')
      .select(`
        *,
        student:students!inner(id, first_name, last_name, teacher_id),
        skill:skills(name, subject, grade_level)
      `)
      .eq('student.teacher_id', teacherId);

    if (error) throw error;
    return data || [];
  },

  async recordSkillAssessment(
    studentId: string,
    skillId: string,
    score: number,
    assessmentId?: string
  ): Promise<SkillMasteryHistory> {
    // Calculate mastery level based on score
    let masteryLevel: MasteryLevel;
    if (score >= 90) masteryLevel = 'Advanced';
    else if (score >= 80) masteryLevel = 'Proficient';
    else if (score >= 65) masteryLevel = 'Developing';
    else masteryLevel = 'Beginning';

    const { data, error } = await supabase
      .from('skill_mastery_history')
      .insert({
        student_id: studentId,
        skill_id: skillId,
        assessment_id: assessmentId,
        mastery_level: masteryLevel,
        score: score
      })
      .select()
      .single();

    if (error) throw error;
    
    // Type-safe transformation
    return {
      ...data,
      mastery_level: validateMasteryLevel(data.mastery_level),
    } as SkillMasteryHistory;
  },

  async getSkillMasteryHistory(studentId: string, skillId?: string): Promise<SkillMasteryHistory[]> {
    let query = supabase
      .from('skill_mastery_history')
      .select('*')
      .eq('student_id', studentId)
      .order('date_recorded', { ascending: true });

    if (skillId) {
      query = query.eq('skill_id', skillId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Type-safe transformation with mastery level validation
    return (data || []).map(item => ({
      ...item,
      mastery_level: validateMasteryLevel(item.mastery_level),
    })) as SkillMasteryHistory[];
  },

  // Assessment Skill Mapping
  async mapAssessmentToSkills(assessmentId: string, skillMappings: Array<{ skill_id: string; weight?: number; assessment_item_id?: string }>): Promise<void> {
    const mappings = skillMappings.map(mapping => ({
      assessment_id: assessmentId,
      skill_id: mapping.skill_id,
      weight: mapping.weight || 1.0,
      assessment_item_id: mapping.assessment_item_id
    }));

    const { error } = await supabase
      .from('assessment_skill_mapping')
      .insert(mappings);

    if (error) throw error;
  },

  async getAssessmentSkillMappings(assessmentId: string): Promise<AssessmentSkillMapping[]> {
    const { data, error } = await supabase
      .from('assessment_skill_mapping')
      .select('*')
      .eq('assessment_id', assessmentId);

    if (error) throw error;
    return data || [];
  },

  // Analytics
  async getSkillAnalytics(teacherId: string, filters?: { subject?: string; grade_level?: string }) {
    // This would be a complex query combining multiple tables
    // For now, return mock data structure
    return {
      skillMasteryDistribution: [],
      skillGaps: [],
      progressTrends: []
    };
  }
};
