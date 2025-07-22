
import { supabase } from '@/integrations/supabase/client';

interface SkillSeed {
  name: string;
  description: string;
  subject: string;
  grade_level: string;
  difficulty_level: number;
  curriculum_standard?: string;
}

const mathSkills: SkillSeed[] = [
  // Grade K
  { name: "Number Recognition 0-10", description: "Identify and name numbers 0-10", subject: "Mathematics", grade_level: "K", difficulty_level: 1, curriculum_standard: "CCSS.MATH.CONTENT.K.CC.A.3" },
  { name: "Basic Counting", description: "Count objects up to 20", subject: "Mathematics", grade_level: "K", difficulty_level: 1, curriculum_standard: "CCSS.MATH.CONTENT.K.CC.A.1" },
  { name: "Shape Recognition", description: "Identify basic 2D shapes", subject: "Mathematics", grade_level: "K", difficulty_level: 1 },
  
  // Grade 1
  { name: "Addition within 20", description: "Add two single-digit numbers", subject: "Mathematics", grade_level: "1", difficulty_level: 2, curriculum_standard: "CCSS.MATH.CONTENT.1.OA.A.1" },
  { name: "Subtraction within 20", description: "Subtract within 20", subject: "Mathematics", grade_level: "1", difficulty_level: 2, curriculum_standard: "CCSS.MATH.CONTENT.1.OA.A.1" },
  { name: "Place Value to 100", description: "Understand tens and ones", subject: "Mathematics", grade_level: "1", difficulty_level: 2 },
  
  // Grade 2
  { name: "Addition within 100", description: "Add two-digit numbers", subject: "Mathematics", grade_level: "2", difficulty_level: 3, curriculum_standard: "CCSS.MATH.CONTENT.2.NBT.B.5" },
  { name: "Subtraction within 100", description: "Subtract two-digit numbers", subject: "Mathematics", grade_level: "2", difficulty_level: 3, curriculum_standard: "CCSS.MATH.CONTENT.2.NBT.B.5" },
  { name: "Skip Counting", description: "Count by 2s, 5s, and 10s", subject: "Mathematics", grade_level: "2", difficulty_level: 2 },
  
  // Grade 3
  { name: "Multiplication Facts", description: "Memorize multiplication tables 1-12", subject: "Mathematics", grade_level: "3", difficulty_level: 3, curriculum_standard: "CCSS.MATH.CONTENT.3.OA.C.7" },
  { name: "Division Facts", description: "Understand division as inverse of multiplication", subject: "Mathematics", grade_level: "3", difficulty_level: 3, curriculum_standard: "CCSS.MATH.CONTENT.3.OA.A.2" },
  { name: "Fractions", description: "Understand unit fractions", subject: "Mathematics", grade_level: "3", difficulty_level: 4, curriculum_standard: "CCSS.MATH.CONTENT.3.NF.A.1" },
  
  // Grade 4
  { name: "Multi-digit Multiplication", description: "Multiply multi-digit numbers", subject: "Mathematics", grade_level: "4", difficulty_level: 4, curriculum_standard: "CCSS.MATH.CONTENT.4.NBT.B.5" },
  { name: "Long Division", description: "Divide multi-digit numbers", subject: "Mathematics", grade_level: "4", difficulty_level: 5 },
  { name: "Equivalent Fractions", description: "Find equivalent fractions", subject: "Mathematics", grade_level: "4", difficulty_level: 4, curriculum_standard: "CCSS.MATH.CONTENT.4.NF.A.1" },
  
  // Grade 5
  { name: "Decimal Operations", description: "Add, subtract, multiply, and divide decimals", subject: "Mathematics", grade_level: "5", difficulty_level: 5, curriculum_standard: "CCSS.MATH.CONTENT.5.NBT.B.7" },
  { name: "Fraction Operations", description: "Add and subtract fractions with unlike denominators", subject: "Mathematics", grade_level: "5", difficulty_level: 5, curriculum_standard: "CCSS.MATH.CONTENT.5.NF.A.1" },
  { name: "Volume and Area", description: "Calculate area and volume of rectangles", subject: "Mathematics", grade_level: "5", difficulty_level: 4 }
];

const elaSkills: SkillSeed[] = [
  // Grade K
  { name: "Letter Recognition", description: "Identify uppercase and lowercase letters", subject: "English Language Arts", grade_level: "K", difficulty_level: 1 },
  { name: "Phonemic Awareness", description: "Identify sounds in words", subject: "English Language Arts", grade_level: "K", difficulty_level: 2 },
  { name: "Sight Words", description: "Recognize common sight words", subject: "English Language Arts", grade_level: "K", difficulty_level: 2 },
  
  // Grade 1
  { name: "Reading Fluency", description: "Read grade-level text with accuracy", subject: "English Language Arts", grade_level: "1", difficulty_level: 3 },
  { name: "Reading Comprehension", description: "Answer questions about text", subject: "English Language Arts", grade_level: "1", difficulty_level: 3 },
  { name: "Writing Sentences", description: "Write complete sentences", subject: "English Language Arts", grade_level: "1", difficulty_level: 3 },
  
  // Grade 2
  { name: "Paragraph Writing", description: "Write organized paragraphs", subject: "English Language Arts", grade_level: "2", difficulty_level: 4 },
  { name: "Story Elements", description: "Identify characters, setting, plot", subject: "English Language Arts", grade_level: "2", difficulty_level: 3 },
  { name: "Vocabulary Development", description: "Learn new vocabulary words", subject: "English Language Arts", grade_level: "2", difficulty_level: 3 },
  
  // Grade 3
  { name: "Essay Writing", description: "Write multi-paragraph essays", subject: "English Language Arts", grade_level: "3", difficulty_level: 5 },
  { name: "Literary Analysis", description: "Analyze character motivations", subject: "English Language Arts", grade_level: "3", difficulty_level: 4 },
  { name: "Grammar and Mechanics", description: "Use proper grammar and punctuation", subject: "English Language Arts", grade_level: "3", difficulty_level: 4 }
];

const scienceSkills: SkillSeed[] = [
  // Grade K-2
  { name: "Scientific Observation", description: "Make detailed observations", subject: "Science", grade_level: "K", difficulty_level: 2 },
  { name: "Plant Life Cycles", description: "Understand how plants grow", subject: "Science", grade_level: "1", difficulty_level: 2 },
  { name: "Weather Patterns", description: "Observe and record weather", subject: "Science", grade_level: "2", difficulty_level: 3 },
  
  // Grade 3-5
  { name: "States of Matter", description: "Understand solids, liquids, gases", subject: "Science", grade_level: "3", difficulty_level: 4 },
  { name: "Food Chains", description: "Understand ecosystem relationships", subject: "Science", grade_level: "4", difficulty_level: 4 },
  { name: "Simple Machines", description: "Identify and use simple machines", subject: "Science", grade_level: "5", difficulty_level: 5 }
];

export const skillsSeedingService = {
  async seedSkills(): Promise<void> {
    try {
      console.log('Starting skills seeding...');
      
      // Check if skills already exist
      const { data: existingSkills, error: checkError } = await supabase
        .from('skills')
        .select('id')
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (existingSkills && existingSkills.length > 0) {
        console.log('Skills already exist, skipping seeding');
        return;
      }

      // Combine all skills
      const allSkills = [...mathSkills, ...elaSkills, ...scienceSkills];
      
      // Insert skills in batches
      const batchSize = 10;
      for (let i = 0; i < allSkills.length; i += batchSize) {
        const batch = allSkills.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from('skills')
          .insert(batch);
        
        if (insertError) {
          console.error('Error inserting skills batch:', insertError);
          throw insertError;
        }
        
        console.log(`Inserted skills batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allSkills.length/batchSize)}`);
      }
      
      console.log(`Successfully seeded ${allSkills.length} skills`);
    } catch (error) {
      console.error('Error seeding skills:', error);
      throw error;
    }
  },

  async createSkillCategories(): Promise<void> {
    try {
      console.log('Creating skill categories...');
      
      const categories = [
        {
          name: "Number and Operations",
          description: "Basic number sense and arithmetic operations",
          subject: "Mathematics",
          grade_levels: ["K", "1", "2", "3", "4", "5"]
        },
        {
          name: "Geometry and Measurement",
          description: "Shapes, spatial reasoning, and measurement",
          subject: "Mathematics", 
          grade_levels: ["K", "1", "2", "3", "4", "5"]
        },
        {
          name: "Reading Foundations",
          description: "Phonics, fluency, and decoding skills",
          subject: "English Language Arts",
          grade_levels: ["K", "1", "2", "3"]
        },
        {
          name: "Writing and Communication",
          description: "Written expression and communication skills",
          subject: "English Language Arts",
          grade_levels: ["1", "2", "3", "4", "5"]
        },
        {
          name: "Life Science",
          description: "Living organisms and ecosystems",
          subject: "Science",
          grade_levels: ["K", "1", "2", "3", "4", "5"]
        },
        {
          name: "Physical Science",
          description: "Matter, energy, and physical properties",
          subject: "Science",
          grade_levels: ["3", "4", "5"]
        }
      ];

      const { error } = await supabase
        .from('skill_categories')
        .insert(categories);
      
      if (error) throw error;
      
      console.log('Successfully created skill categories');
    } catch (error) {
      console.error('Error creating skill categories:', error);
      // Don't throw - categories are optional
    }
  }
};
