
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
  { name: "Number Writing 1-10", description: "Write numbers 1-10 correctly", subject: "Mathematics", grade_level: "K", difficulty_level: 2 },
  { name: "Simple Patterns", description: "Recognize and extend simple patterns", subject: "Mathematics", grade_level: "K", difficulty_level: 2 },
  
  // Grade 1
  { name: "Addition within 20", description: "Add two single-digit numbers", subject: "Mathematics", grade_level: "1", difficulty_level: 2, curriculum_standard: "CCSS.MATH.CONTENT.1.OA.A.1" },
  { name: "Subtraction within 20", description: "Subtract within 20", subject: "Mathematics", grade_level: "1", difficulty_level: 2, curriculum_standard: "CCSS.MATH.CONTENT.1.OA.A.1" },
  { name: "Place Value to 100", description: "Understand tens and ones", subject: "Mathematics", grade_level: "1", difficulty_level: 2 },
  { name: "Number Comparison", description: "Compare numbers using <, >, =", subject: "Mathematics", grade_level: "1", difficulty_level: 2 },
  { name: "Measurement Basics", description: "Compare length, weight, and capacity", subject: "Mathematics", grade_level: "1", difficulty_level: 3 },
  { name: "Time Concepts", description: "Understand basic time concepts", subject: "Mathematics", grade_level: "1", difficulty_level: 2 },
  { name: "Money Introduction", description: "Recognize coins and their names", subject: "Mathematics", grade_level: "1", difficulty_level: 3 },
  
  // Grade 2
  { name: "Addition within 100", description: "Add two-digit numbers", subject: "Mathematics", grade_level: "2", difficulty_level: 3, curriculum_standard: "CCSS.MATH.CONTENT.2.NBT.B.5" },
  { name: "Subtraction within 100", description: "Subtract two-digit numbers", subject: "Mathematics", grade_level: "2", difficulty_level: 3, curriculum_standard: "CCSS.MATH.CONTENT.2.NBT.B.5" },
  { name: "Skip Counting", description: "Count by 2s, 5s, and 10s", subject: "Mathematics", grade_level: "2", difficulty_level: 2 },
  { name: "Money Recognition", description: "Identify coins and their values", subject: "Mathematics", grade_level: "2", difficulty_level: 3 },
  { name: "Time to Hour and Half-Hour", description: "Tell time to the hour and half-hour", subject: "Mathematics", grade_level: "2", difficulty_level: 3 },
  { name: "Data and Graphs", description: "Read and create simple graphs", subject: "Mathematics", grade_level: "2", difficulty_level: 3 },
  { name: "Estimation", description: "Estimate quantities and measurements", subject: "Mathematics", grade_level: "2", difficulty_level: 3 },
  
  // Grade 3
  { name: "Multiplication Facts", description: "Memorize multiplication tables 1-12", subject: "Mathematics", grade_level: "3", difficulty_level: 3, curriculum_standard: "CCSS.MATH.CONTENT.3.OA.C.7" },
  { name: "Division Facts", description: "Understand division as inverse of multiplication", subject: "Mathematics", grade_level: "3", difficulty_level: 3, curriculum_standard: "CCSS.MATH.CONTENT.3.OA.A.2" },
  { name: "Fractions", description: "Understand unit fractions", subject: "Mathematics", grade_level: "3", difficulty_level: 4, curriculum_standard: "CCSS.MATH.CONTENT.3.NF.A.1" },
  { name: "Area and Perimeter", description: "Calculate area and perimeter of rectangles", subject: "Mathematics", grade_level: "3", difficulty_level: 4 },
  { name: "Word Problems", description: "Solve multi-step word problems", subject: "Mathematics", grade_level: "3", difficulty_level: 4 },
  { name: "Rounding Numbers", description: "Round numbers to nearest 10 and 100", subject: "Mathematics", grade_level: "3", difficulty_level: 3 },
  
  // Grade 4
  { name: "Multi-digit Multiplication", description: "Multiply multi-digit numbers", subject: "Mathematics", grade_level: "4", difficulty_level: 4, curriculum_standard: "CCSS.MATH.CONTENT.4.NBT.B.5" },
  { name: "Long Division", description: "Divide multi-digit numbers", subject: "Mathematics", grade_level: "4", difficulty_level: 5 },
  { name: "Equivalent Fractions", description: "Find equivalent fractions", subject: "Mathematics", grade_level: "4", difficulty_level: 4, curriculum_standard: "CCSS.MATH.CONTENT.4.NF.A.1" },
  { name: "Decimal Place Value", description: "Understand decimal place value", subject: "Mathematics", grade_level: "4", difficulty_level: 4 },
  { name: "Angle Measurement", description: "Measure and draw angles", subject: "Mathematics", grade_level: "4", difficulty_level: 4 },
  { name: "Fraction Operations", description: "Add and subtract fractions with like denominators", subject: "Mathematics", grade_level: "4", difficulty_level: 4 },
  
  // Grade 5
  { name: "Decimal Operations", description: "Add, subtract, multiply, and divide decimals", subject: "Mathematics", grade_level: "5", difficulty_level: 5, curriculum_standard: "CCSS.MATH.CONTENT.5.NBT.B.7" },
  { name: "Fraction Operations Advanced", description: "Add and subtract fractions with unlike denominators", subject: "Mathematics", grade_level: "5", difficulty_level: 5, curriculum_standard: "CCSS.MATH.CONTENT.5.NF.A.1" },
  { name: "Volume and Area", description: "Calculate area and volume of rectangles", subject: "Mathematics", grade_level: "5", difficulty_level: 4 },
  { name: "Coordinate Plane", description: "Plot points on coordinate plane", subject: "Mathematics", grade_level: "5", difficulty_level: 4 },
  { name: "Order of Operations", description: "Use PEMDAS to solve expressions", subject: "Mathematics", grade_level: "5", difficulty_level: 5 },
  { name: "Algebraic Expressions", description: "Write and evaluate simple algebraic expressions", subject: "Mathematics", grade_level: "5", difficulty_level: 5 }
];

const elaSkills: SkillSeed[] = [
  // Grade K
  { name: "Letter Recognition", description: "Identify uppercase and lowercase letters", subject: "English Language Arts", grade_level: "K", difficulty_level: 1 },
  { name: "Phonemic Awareness", description: "Identify sounds in words", subject: "English Language Arts", grade_level: "K", difficulty_level: 2 },
  { name: "Sight Words", description: "Recognize common sight words", subject: "English Language Arts", grade_level: "K", difficulty_level: 2 },
  { name: "Print Concepts", description: "Understand how books work", subject: "English Language Arts", grade_level: "K", difficulty_level: 1 },
  { name: "Rhyming", description: "Identify and produce rhyming words", subject: "English Language Arts", grade_level: "K", difficulty_level: 2 },
  { name: "Story Listening", description: "Listen to and retell simple stories", subject: "English Language Arts", grade_level: "K", difficulty_level: 2 },
  
  // Grade 1
  { name: "Reading Fluency", description: "Read grade-level text with accuracy", subject: "English Language Arts", grade_level: "1", difficulty_level: 3 },
  { name: "Reading Comprehension", description: "Answer questions about text", subject: "English Language Arts", grade_level: "1", difficulty_level: 3 },
  { name: "Writing Sentences", description: "Write complete sentences", subject: "English Language Arts", grade_level: "1", difficulty_level: 3 },
  { name: "Phonics Decoding", description: "Use phonics to decode words", subject: "English Language Arts", grade_level: "1", difficulty_level: 3 },
  { name: "Capitalization and Punctuation", description: "Use basic capitalization and punctuation", subject: "English Language Arts", grade_level: "1", difficulty_level: 3 },
  { name: "Spelling Patterns", description: "Recognize common spelling patterns", subject: "English Language Arts", grade_level: "1", difficulty_level: 3 },
  
  // Grade 2
  { name: "Paragraph Writing", description: "Write organized paragraphs", subject: "English Language Arts", grade_level: "2", difficulty_level: 4 },
  { name: "Story Elements", description: "Identify characters, setting, plot", subject: "English Language Arts", grade_level: "2", difficulty_level: 3 },
  { name: "Vocabulary Development", description: "Learn new vocabulary words", subject: "English Language Arts", grade_level: "2", difficulty_level: 3 },
  { name: "Text Features", description: "Use headings, captions, and glossaries", subject: "English Language Arts", grade_level: "2", difficulty_level: 3 },
  { name: "Main Idea", description: "Identify main idea and supporting details", subject: "English Language Arts", grade_level: "2", difficulty_level: 4 },
  { name: "Reading Fluency Advanced", description: "Read with expression and proper pacing", subject: "English Language Arts", grade_level: "2", difficulty_level: 4 },
  
  // Grade 3
  { name: "Essay Writing", description: "Write multi-paragraph essays", subject: "English Language Arts", grade_level: "3", difficulty_level: 5 },
  { name: "Literary Analysis", description: "Analyze character motivations", subject: "English Language Arts", grade_level: "3", difficulty_level: 4 },
  { name: "Grammar and Mechanics", description: "Use proper grammar and punctuation", subject: "English Language Arts", grade_level: "3", difficulty_level: 4 },
  { name: "Research Skills", description: "Conduct simple research projects", subject: "English Language Arts", grade_level: "3", difficulty_level: 4 },
  { name: "Compare and Contrast", description: "Compare texts and characters", subject: "English Language Arts", grade_level: "3", difficulty_level: 4 },
  { name: "Poetry Analysis", description: "Understand and analyze simple poems", subject: "English Language Arts", grade_level: "3", difficulty_level: 4 },
  
  // Grade 4-5
  { name: "Persuasive Writing", description: "Write persuasive essays with evidence", subject: "English Language Arts", grade_level: "4", difficulty_level: 5 },
  { name: "Text Structure", description: "Identify different text structures", subject: "English Language Arts", grade_level: "4", difficulty_level: 4 },
  { name: "Point of View", description: "Identify narrator's point of view", subject: "English Language Arts", grade_level: "4", difficulty_level: 4 },
  { name: "Theme Analysis", description: "Identify themes in literature", subject: "English Language Arts", grade_level: "5", difficulty_level: 5 },
  { name: "Research and Citation", description: "Research and cite sources properly", subject: "English Language Arts", grade_level: "5", difficulty_level: 5 },
  { name: "Complex Sentence Structure", description: "Write complex and compound sentences", subject: "English Language Arts", grade_level: "5", difficulty_level: 5 }
];

const scienceSkills: SkillSeed[] = [
  // Grade K-2
  { name: "Scientific Observation", description: "Make detailed observations", subject: "Science", grade_level: "K", difficulty_level: 2 },
  { name: "Plant Life Cycles", description: "Understand how plants grow", subject: "Science", grade_level: "1", difficulty_level: 2 },
  { name: "Weather Patterns", description: "Observe and record weather", subject: "Science", grade_level: "2", difficulty_level: 3 },
  { name: "Animal Habitats", description: "Identify where animals live", subject: "Science", grade_level: "K", difficulty_level: 2 },
  { name: "Five Senses", description: "Use senses to explore the world", subject: "Science", grade_level: "K", difficulty_level: 1 },
  { name: "Seasons and Changes", description: "Observe seasonal changes", subject: "Science", grade_level: "1", difficulty_level: 2 },
  { name: "Properties of Materials", description: "Describe properties of objects", subject: "Science", grade_level: "2", difficulty_level: 3 },
  { name: "Animal Life Cycles", description: "Understand basic animal life cycles", subject: "Science", grade_level: "2", difficulty_level: 3 },
  
  // Grade 3-5
  { name: "States of Matter", description: "Understand solids, liquids, gases", subject: "Science", grade_level: "3", difficulty_level: 4 },
  { name: "Food Chains", description: "Understand ecosystem relationships", subject: "Science", grade_level: "4", difficulty_level: 4 },
  { name: "Simple Machines", description: "Identify and use simple machines", subject: "Science", grade_level: "5", difficulty_level: 5 },
  { name: "Rock Cycle", description: "Understand how rocks form and change", subject: "Science", grade_level: "4", difficulty_level: 4 },
  { name: "Electricity and Magnetism", description: "Explore electrical and magnetic forces", subject: "Science", grade_level: "5", difficulty_level: 5 },
  { name: "Human Body Systems", description: "Learn about body systems", subject: "Science", grade_level: "5", difficulty_level: 4 },
  { name: "Scientific Method", description: "Conduct controlled experiments", subject: "Science", grade_level: "3", difficulty_level: 4 },
  { name: "Energy and Motion", description: "Understand basic physics concepts", subject: "Science", grade_level: "4", difficulty_level: 4 },
  { name: "Earth and Space", description: "Learn about Earth's place in space", subject: "Science", grade_level: "5", difficulty_level: 4 }
];

export const skillsSeedingService = {
  async checkSkillsExist(): Promise<{ count: number; exists: boolean }> {
    try {
      console.log('🔍 Checking skills count in database...');
      const { data, error, count } = await supabase
        .from('skills')
        .select('id', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.error('❌ Error checking skills:', error);
        throw error;
      }
      
      const skillCount = count || 0;
      console.log(`📊 Current skills count: ${skillCount}`);
      
      return {
        count: skillCount,
        exists: skillCount > 0
      };
    } catch (error) {
      console.error('💥 Error in checkSkillsExist:', error);
      return { count: 0, exists: false };
    }
  },

  async seedSkills(): Promise<{ success: boolean; skillsCount: number; error?: string }> {
    try {
      console.log('🌱 Starting skills seeding process...');
      
      // Check current skills count
      const skillsCheck = await this.checkSkillsExist();
      console.log(`📊 Pre-seed check - Current skills: ${skillsCheck.count}`);
      
      if (skillsCheck.count >= 60) {
        console.log('✅ Skills already seeded (60+ skills found), skipping seeding');
        return { success: true, skillsCount: skillsCheck.count };
      }

      // Combine all skills
      const allSkills = [...mathSkills, ...elaSkills, ...scienceSkills];
      console.log(`📝 Preparing to seed ${allSkills.length} total skills:`);
      console.log(`   - Math: ${mathSkills.length} skills`);
      console.log(`   - ELA: ${elaSkills.length} skills`);
      console.log(`   - Science: ${scienceSkills.length} skills`);
      
      // Clear existing skills for clean reseed
      if (skillsCheck.exists) {
        console.log('🧹 Clearing existing skills for clean reseed...');
        const { error: deleteError } = await supabase
          .from('skills')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (deleteError) {
          console.error('❌ Error clearing existing skills:', deleteError);
          // Continue anyway - this isn't fatal
        } else {
          console.log('✅ Successfully cleared existing skills');
        }
      }
      
      // Insert skills in smaller batches for reliability
      const batchSize = 5;
      let totalInserted = 0;
      const totalBatches = Math.ceil(allSkills.length / batchSize);
      
      console.log(`📦 Inserting skills in ${totalBatches} batches of ${batchSize}...`);
      
      for (let i = 0; i < allSkills.length; i += batchSize) {
        const batchNumber = Math.floor(i / batchSize) + 1;
        const batch = allSkills.slice(i, i + batchSize);
        
        console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} skills)...`);
        
        try {
          const { data, error: insertError } = await supabase
            .from('skills')
            .insert(batch)
            .select('id, name');
          
          if (insertError) {
            console.error(`❌ Error inserting batch ${batchNumber}:`, insertError);
            throw insertError;
          }
          
          const insertedCount = data?.length || 0;
          totalInserted += insertedCount;
          
          console.log(`✅ Batch ${batchNumber} complete: ${insertedCount} skills inserted`);
          console.log(`📊 Total progress: ${totalInserted}/${allSkills.length} skills`);
          
          // Brief pause between batches to avoid overwhelming the database
          if (i + batchSize < allSkills.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (batchError) {
          console.error(`💥 Fatal error in batch ${batchNumber}:`, batchError);
          throw batchError;
        }
      }
      
      // Final verification
      const finalCheck = await this.checkSkillsExist();
      console.log(`🎉 Seeding complete! Final count: ${finalCheck.count} skills`);
      
      if (finalCheck.count !== totalInserted) {
        console.warn(`⚠️ Count mismatch: expected ${totalInserted}, found ${finalCheck.count}`);
      }
      
      return { 
        success: true, 
        skillsCount: finalCheck.count 
      };
    } catch (error) {
      console.error('💥 Critical error in seedSkills:', error);
      return { 
        success: false, 
        skillsCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  async createSkillCategories(): Promise<void> {
    try {
      console.log('📁 Creating skill categories...');
      
      // Check if categories already exist
      const { data: existingCategories, error: checkError } = await supabase
        .from('skill_categories')
        .select('id')
        .limit(1);
      
      if (checkError) {
        console.error('❌ Error checking categories:', checkError);
        throw checkError;
      }
      
      if (existingCategories && existingCategories.length > 0) {
        console.log('✅ Skill categories already exist, skipping creation');
        return;
      }

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
      
      if (error) {
        console.error('❌ Error creating categories:', error);
        throw error;
      }
      
      console.log('✅ Successfully created skill categories');
    } catch (error) {
      console.error('💥 Error in createSkillCategories:', error);
      // Don't throw - categories are optional for skills to work
    }
  },

  async forceSeedSkills(): Promise<{ success: boolean; skillsCount: number; error?: string }> {
    try {
      console.log('🔥 FORCE SEEDING: Clearing all skills and reseeding...');
      
      // Force clear all existing skills
      const { error: deleteError } = await supabase
        .from('skills')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.error('❌ Error clearing skills in force seed:', deleteError);
        // Continue anyway
      } else {
        console.log('✅ Successfully cleared all existing skills');
      }
      
      // Wait a moment for the delete to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now seed fresh
      const result = await this.seedSkills();
      
      if (result.success) {
        console.log(`🎉 Force seed completed successfully: ${result.skillsCount} skills`);
      } else {
        console.error(`💥 Force seed failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error('💥 Critical error in forceSeedSkills:', error);
      return { 
        success: false, 
        skillsCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error in force seed'
      };
    }
  }
};
