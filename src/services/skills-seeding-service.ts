// skill_categories table doesn't exist in the schema
// This service provides stub implementations that log attempts

export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  subject: string;
  grade_levels: string[];
  created_at?: string;
}

export interface SkillData {
  name: string;
  description: string;
  subject: string;
  grade_levels: string[];
  category?: string;
}

export const skillsSeedingService = {
  // Check if skills have been seeded
  async checkIfSeeded(): Promise<boolean> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('skills')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error checking skills:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  },

  // Seed basic skills to the skills table
  async seedBasicSkills(): Promise<void> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const isSeeded = await this.checkIfSeeded();
    if (isSeeded) {
      console.log('Skills already seeded, skipping');
      return;
    }

    const skills: SkillData[] = [
      // Mathematics
      { name: 'Addition', description: 'Adding numbers', subject: 'Mathematics', grade_levels: ['K', '1', '2'] },
      { name: 'Subtraction', description: 'Subtracting numbers', subject: 'Mathematics', grade_levels: ['K', '1', '2'] },
      { name: 'Multiplication', description: 'Multiplying numbers', subject: 'Mathematics', grade_levels: ['2', '3', '4'] },
      { name: 'Division', description: 'Dividing numbers', subject: 'Mathematics', grade_levels: ['3', '4', '5'] },
      { name: 'Fractions', description: 'Understanding fractions', subject: 'Mathematics', grade_levels: ['3', '4', '5'] },
      
      // Reading
      { name: 'Phonics', description: 'Sound-letter relationships', subject: 'English Language Arts', grade_levels: ['K', '1', '2'] },
      { name: 'Reading Comprehension', description: 'Understanding texts', subject: 'English Language Arts', grade_levels: ['1', '2', '3', '4', '5'] },
      { name: 'Vocabulary', description: 'Word knowledge', subject: 'English Language Arts', grade_levels: ['K', '1', '2', '3', '4', '5'] },
      
      // Writing
      { name: 'Sentence Structure', description: 'Writing complete sentences', subject: 'English Language Arts', grade_levels: ['1', '2', '3'] },
      { name: 'Paragraph Writing', description: 'Organizing paragraphs', subject: 'English Language Arts', grade_levels: ['2', '3', '4', '5'] },
      
      // Science
      { name: 'Scientific Method', description: 'Steps of inquiry', subject: 'Science', grade_levels: ['3', '4', '5'] },
      { name: 'Life Cycles', description: 'Plant and animal life cycles', subject: 'Science', grade_levels: ['2', '3', '4'] }
    ];

    const { error } = await supabase
      .from('skills')
      .insert(skills.map(skill => ({
        name: skill.name,
        description: skill.description,
        subject: skill.subject,
        grade_levels: skill.grade_levels,
        category: skill.category
      })));

    if (error) {
      console.error('Error seeding skills:', error);
      throw error;
    }

    console.log('Successfully seeded', skills.length, 'skills');
  },

  // Create skill categories - table doesn't exist, returns mock
  async createCategories(): Promise<void> {
    console.log('createCategories: skill_categories table not implemented');
    console.log('Categories would be created if table existed');
  },

  // Get all skills
  async getAllSkills(): Promise<SkillData[]> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('subject')
      .order('name');

    if (error) throw error;

    return (data || []).map(skill => ({
      name: skill.name,
      description: skill.description || '',
      subject: skill.subject || '',
      grade_levels: skill.grade_levels || [],
      category: skill.category
    }));
  }
};
