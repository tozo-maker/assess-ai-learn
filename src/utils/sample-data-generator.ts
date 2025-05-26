import { supabase } from '@/integrations/supabase/client';

export interface SampleDataConfig {
  clearExistingData?: boolean;
  generateAnalysis?: boolean;
}

export const sampleDataGenerator = {
  // Generate comprehensive sample data
  async generateComprehensiveData(config: SampleDataConfig = { clearExistingData: true, generateAnalysis: true }): Promise<void> {
    console.log('🚀 Starting comprehensive sample data generation...');
    
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      throw new Error("User not authenticated");
    }

    const teacherId = authData.user.id;
    console.log('👤 Teacher ID:', teacherId);
    
    if (config.clearExistingData) {
      await this.clearExistingData(teacherId);
    }

    try {
      // Step 1: Generate diverse students
      console.log('📚 Step 1: Generating students...');
      const students = await this.generateDiverseStudents(teacherId);
      console.log(`✅ Created ${students.length} diverse students`);

      // Step 2: Create comprehensive assessments
      console.log('📝 Step 2: Generating assessments...');
      const assessments = await this.generateComprehensiveAssessments(teacherId);
      console.log(`✅ Created ${assessments.length} comprehensive assessments`);

      // Step 3: Generate assessment items for each assessment
      console.log('🔢 Step 3: Generating assessment items...');
      const allItems = [];
      for (const assessment of assessments) {
        try {
          const items = await this.generateAssessmentItems(assessment);
          allItems.push(...items);
          console.log(`  - Added ${items.length} items to "${assessment.title}"`);
        } catch (error) {
          console.error(`Error creating items for ${assessment.title}:`, error);
        }
      }
      console.log(`✅ Created ${allItems.length} assessment items total`);

      // Step 4: Generate realistic student responses
      console.log('📊 Step 4: Generating student responses...');
      await this.generateRealisticResponses(students, assessments, allItems);
      console.log('✅ Generated realistic student responses');

      // Step 5: Generate learning goals
      console.log('🎯 Step 5: Generating learning goals...');
      await this.generateLearningGoals(students, teacherId);
      console.log('✅ Created learning goals and milestones');

      // Step 6: Generate AI analysis (if enabled)
      if (config.generateAnalysis) {
        console.log('🧠 Step 6: Generating AI analysis...');
        await this.generateAIAnalysisData(students, assessments);
        console.log('✅ Generated AI analysis data');
      }

      // Step 7: Generate communication history
      console.log('📧 Step 7: Generating communication history...');
      await this.generateCommunicationHistory(students, teacherId);
      console.log('✅ Created communication history');

      // Step 8: Verify data creation
      console.log('🔍 Step 8: Verifying data creation...');
      await this.verifyDataCreation(teacherId);

      console.log('🎉 Comprehensive sample data generation completed successfully!');
    } catch (error) {
      console.error('❌ Error during sample data generation:', error);
      throw error;
    }
  },

  async verifyDataCreation(teacherId: string): Promise<void> {
    try {
      // Check students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('teacher_id', teacherId);
      
      if (studentsError) throw studentsError;
      console.log(`📊 Verification - Students created: ${students?.length || 0}`);

      // Check assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('id, title')
        .eq('teacher_id', teacherId);
      
      if (assessmentsError) throw assessmentsError;
      console.log(`📊 Verification - Assessments created: ${assessments?.length || 0}`);

      // Check assessment items
      if (assessments && assessments.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('assessment_items')
          .select('id')
          .in('assessment_id', assessments.map(a => a.id));
        
        if (itemsError) throw itemsError;
        console.log(`📊 Verification - Assessment items created: ${items?.length || 0}`);
      }

      // Check student responses
      if (assessments && assessments.length > 0) {
        const { data: responses, error: responsesError } = await supabase
          .from('student_responses')
          .select('id')
          .in('assessment_id', assessments.map(a => a.id));
        
        if (responsesError) throw responsesError;
        console.log(`📊 Verification - Student responses created: ${responses?.length || 0}`);
      }

      // Check AI analysis
      if (students && students.length > 0 && assessments && assessments.length > 0) {
        const { data: analysis, error: analysisError } = await supabase
          .from('assessment_analysis')
          .select('id')
          .in('student_id', students.map(s => s.id));
        
        if (analysisError) throw analysisError;
        console.log(`📊 Verification - AI analysis records created: ${analysis?.length || 0}`);
      }

      // Check goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('id')
        .eq('teacher_id', teacherId);
      
      if (goalsError) throw goalsError;
      console.log(`📊 Verification - Goals created: ${goals?.length || 0}`);

    } catch (error) {
      console.error('Error during verification:', error);
    }
  },

  async clearExistingData(teacherId: string): Promise<void> {
    console.log('🧹 Clearing existing data...');
    
    try {
      // Get student IDs for this teacher first
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('teacher_id', teacherId);
      
      const studentIds = students?.map(s => s.id) || [];
      console.log(`  - Found ${studentIds.length} existing students to clean up`);
      
      // Get assessment IDs for this teacher
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id')
        .eq('teacher_id', teacherId);
      
      const assessmentIds = assessments?.map(a => a.id) || [];
      console.log(`  - Found ${assessmentIds.length} existing assessments to clean up`);
      
      // Get goal IDs for this teacher
      const { data: goals } = await supabase
        .from('goals')
        .select('id')
        .eq('teacher_id', teacherId);
      
      const goalIds = goals?.map(g => g.id) || [];
      console.log(`  - Found ${goalIds.length} existing goals to clean up`);
      
      // Delete in reverse dependency order
      if (studentIds.length > 0) {
        await supabase.from('assessment_analysis').delete().in('student_id', studentIds);
        console.log('  - Cleared assessment analysis');
      }
      
      if (assessmentIds.length > 0) {
        await supabase.from('student_responses').delete().in('assessment_id', assessmentIds);
        console.log('  - Cleared student responses');
        await supabase.from('assessment_items').delete().in('assessment_id', assessmentIds);
        console.log('  - Cleared assessment items');
      }
      
      if (goalIds.length > 0) {
        await supabase.from('goal_milestones').delete().in('goal_id', goalIds);
        console.log('  - Cleared goal milestones');
      }
      
      await supabase.from('goals').delete().eq('teacher_id', teacherId);
      console.log('  - Cleared goals');
      await supabase.from('parent_communications').delete().eq('teacher_id', teacherId);
      console.log('  - Cleared communications');
      await supabase.from('assessments').delete().eq('teacher_id', teacherId);
      console.log('  - Cleared assessments');
      await supabase.from('students').delete().eq('teacher_id', teacherId);
      console.log('  - Cleared students');
      
      console.log('✅ Data cleanup completed');
    } catch (error) {
      console.error('Error during data cleanup:', error);
      throw error;
    }
  },

  async generateDiverseStudents(teacherId: string) {
    const students = [
      // High Performers
      {
        first_name: 'Emma',
        last_name: 'Chen',
        grade_level: '5th',
        student_id: 'EC2024001',
        learning_goals: 'Advanced problem-solving strategies, Leadership in group work',
        special_considerations: 'Gifted learner, needs enrichment activities',
        teacher_id: teacherId
      },
      {
        first_name: 'Marcus',
        last_name: 'Thompson',
        grade_level: '4th',
        student_id: 'MT2024002',
        learning_goals: 'Reading comprehension at grade level, Math problem solving',
        special_considerations: 'Visual learner, responds well to graphic organizers',
        teacher_id: teacherId
      },
      {
        first_name: 'Sophia',
        last_name: 'Rodriguez',
        grade_level: '6th',
        student_id: 'SR2024003',
        learning_goals: 'Advanced writing skills, Science inquiry methods',
        special_considerations: 'High achiever, self-motivated learner',
        teacher_id: teacherId
      },

      // Average Performers
      {
        first_name: 'Aiden',
        last_name: 'O\'Connor',
        grade_level: '3rd',
        student_id: 'AO2024004',
        learning_goals: 'Addition and subtraction fluency, Reading comprehension',
        special_considerations: 'Kinesthetic learner, benefits from hands-on activities',
        teacher_id: teacherId
      },
      {
        first_name: 'Zara',
        last_name: 'Patel',
        grade_level: '4th',
        student_id: 'ZP2024005',
        learning_goals: 'Multiplication tables mastery, Vocabulary development',
        special_considerations: 'English Language Learner, needs language support',
        teacher_id: teacherId
      },
      {
        first_name: 'Carlos',
        last_name: 'Martinez',
        grade_level: '5th',
        student_id: 'CM2024006',
        learning_goals: 'Fraction operations, Scientific method understanding',
        special_considerations: 'Steady progress, benefits from repetition and practice',
        teacher_id: teacherId
      },
      {
        first_name: 'Lily',
        last_name: 'Anderson',
        grade_level: '3rd',
        student_id: 'LA2024007',
        learning_goals: 'Phonics skills, Basic math facts',
        special_considerations: 'Auditory learner, needs quiet environment',
        teacher_id: teacherId
      },

      // Struggling Students
      {
        first_name: 'Jamal',
        last_name: 'Williams',
        grade_level: '4th',
        student_id: 'JW2024008',
        learning_goals: 'Reading fluency improvement, Basic multiplication',
        special_considerations: 'Reading difficulties, needs extended time and modified materials',
        teacher_id: teacherId
      },
      {
        first_name: 'Maya',
        last_name: 'Singh',
        grade_level: '5th',
        student_id: 'MS2024009',
        learning_goals: 'Math fact fluency, Writing organization skills',
        special_considerations: 'Attention challenges, benefits from frequent breaks',
        teacher_id: teacherId
      },
      {
        first_name: 'Tyler',
        last_name: 'Johnson',
        grade_level: '3rd',
        student_id: 'TJ2024010',
        learning_goals: 'Number sense development, Letter sound correspondence',
        special_considerations: 'Learning disability, requires individualized support',
        teacher_id: teacherId
      },

      // Additional Diverse Students
      {
        first_name: 'Amara',
        last_name: 'Okafor',
        grade_level: '6th',
        student_id: 'AO2024011',
        learning_goals: 'Advanced algebra concepts, Research skills',
        special_considerations: 'Recently moved from Nigeria, strong in math, developing English',
        teacher_id: teacherId
      },
      {
        first_name: 'Kai',
        last_name: 'Nakamura',
        grade_level: '4th',
        student_id: 'KN2024012',
        learning_goals: 'Creative writing, Social studies projects',
        special_considerations: 'Bilingual, excels in visual arts, needs confidence building',
        teacher_id: teacherId
      }
    ];

    const { data, error } = await supabase
      .from('students')
      .insert(students)
      .select();

    if (error) {
      console.error('Error creating students:', error);
      throw error;
    }
    return data;
  },

  async generateComprehensiveAssessments(teacherId: string) {
    const assessments = [
      // Math Assessments
      {
        title: '3rd Grade Addition & Subtraction Assessment',
        description: 'Comprehensive assessment of basic addition and subtraction skills with word problems',
        subject: 'Mathematics',
        grade_level: '3rd',
        assessment_type: 'test',
        max_score: 100,
        standards_covered: ['3.NBT.2', '3.OA.8', '3.OA.3'],
        assessment_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
        is_draft: false,
        teacher_id: teacherId
      },
      {
        title: '4th Grade Multiplication & Division Mastery',
        description: 'Assessment covering multiplication tables, division facts, and multi-step word problems',
        subject: 'Mathematics',
        grade_level: '4th',
        assessment_type: 'test',
        max_score: 80,
        standards_covered: ['4.NBT.5', '4.NBT.6', '4.OA.3'],
        assessment_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
        is_draft: false,
        teacher_id: teacherId
      },
      {
        title: '5th Grade Fractions & Decimals Unit Test',
        description: 'Comprehensive test on fraction operations, decimal conversion, and real-world applications',
        subject: 'Mathematics',
        grade_level: '5th',
        assessment_type: 'test',
        max_score: 120,
        standards_covered: ['5.NF.1', '5.NF.2', '5.NBT.3', '5.NBT.7'],
        assessment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
        is_draft: false,
        teacher_id: teacherId
      },

      // Reading Assessments
      {
        title: '3rd Grade Reading Comprehension Assessment',
        description: 'Multi-passage reading assessment with fiction and non-fiction texts',
        subject: 'English Language Arts',
        grade_level: '3rd',
        assessment_type: 'test',
        max_score: 60,
        standards_covered: ['3.RL.1', '3.RL.2', '3.RI.1', '3.RI.2'],
        assessment_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 days ago
        is_draft: false,
        teacher_id: teacherId
      },
      {
        title: '4th Grade Vocabulary & Inference Skills',
        description: 'Assessment of vocabulary in context and inferential reading skills',
        subject: 'English Language Arts',
        grade_level: '4th',
        assessment_type: 'quiz',
        max_score: 100,
        standards_covered: ['4.RL.4', '4.RL.1', '4.L.4', '4.L.5'],
        assessment_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days ago
        is_draft: false,
        teacher_id: teacherId
      },

      // Science Assessments
      {
        title: '4th Grade Life Cycles Assessment',
        description: 'Assessment on plant and animal life cycles, including metamorphosis and growth patterns',
        subject: 'Science',
        grade_level: '4th',
        assessment_type: 'test',
        max_score: 80,
        standards_covered: ['4.LS1.1', '4.LS1.2'],
        assessment_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
        is_draft: false,
        teacher_id: teacherId
      },
      {
        title: '5th Grade Solar System Exploration',
        description: 'Comprehensive assessment on planets, moons, and space exploration',
        subject: 'Science',
        grade_level: '5th',
        assessment_type: 'test',
        max_score: 100,
        standards_covered: ['5.ESS1.1', '5.ESS1.2'],
        assessment_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
        is_draft: false,
        teacher_id: teacherId
      },

      // Writing Assessment
      {
        title: 'Persuasive Writing Assessment (Mixed Grades)',
        description: 'Rubric-based assessment of persuasive writing skills across grade levels',
        subject: 'English Language Arts',
        grade_level: 'Mixed',
        assessment_type: 'project',
        max_score: 25,
        standards_covered: ['3.W.1', '4.W.1', '5.W.1', '6.W.1'],
        assessment_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        is_draft: false,
        teacher_id: teacherId
      }
    ];

    const { data, error } = await supabase
      .from('assessments')
      .insert(assessments)
      .select();

    if (error) {
      console.error('Error creating assessments:', error);
      throw error;
    }
    return data;
  },

  async generateAssessmentItems(assessment: any) {
    const itemsMap: { [key: string]: any[] } = {
      '3rd Grade Addition & Subtraction Assessment': [
        { item_number: 1, question_text: '247 + 156 = ?', knowledge_type: 'procedural', difficulty_level: 'easy', max_score: 5, standard_reference: '3.NBT.2' },
        { item_number: 2, question_text: '503 - 267 = ?', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 5, standard_reference: '3.NBT.2' },
        { item_number: 3, question_text: 'Sarah has 24 stickers. She gives away 9 stickers. How many does she have left?', knowledge_type: 'conceptual', difficulty_level: 'easy', max_score: 10, standard_reference: '3.OA.8' },
        { item_number: 4, question_text: 'There are 156 students in grade 3. 89 students are boys. How many are girls?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '3.OA.8' },
        { item_number: 5, question_text: '345 + 278 + 156 = ?', knowledge_type: 'procedural', difficulty_level: 'hard', max_score: 10, standard_reference: '3.NBT.2' },
        { item_number: 6, question_text: 'Round 567 to the nearest hundred.', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 5, standard_reference: '3.NBT.1' },
        { item_number: 7, question_text: 'What is the value of the 4 in 1,247?', knowledge_type: 'factual', difficulty_level: 'easy', max_score: 5, standard_reference: '3.NBT.1' },
        { item_number: 8, question_text: 'Complete the pattern: 125, 135, 145, ___, ___', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '3.OA.8' },
        { item_number: 9, question_text: 'Tom collected 247 baseball cards. His friend gave him 156 more. Then he traded 89 cards. How many cards does Tom have now?', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 15, standard_reference: '3.OA.8' },
        { item_number: 10, question_text: 'Which is greater: 456 or 465? Explain your answer.', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '3.NBT.1' }
      ],

      '4th Grade Multiplication & Division Mastery': [
        { item_number: 1, question_text: '8 × 7 = ?', knowledge_type: 'factual', difficulty_level: 'easy', max_score: 5, standard_reference: '4.NBT.5' },
        { item_number: 2, question_text: '144 ÷ 12 = ?', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 5, standard_reference: '4.NBT.6' },
        { item_number: 3, question_text: '23 × 15 = ?', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 10, standard_reference: '4.NBT.5' },
        { item_number: 4, question_text: 'There are 8 boxes with 24 pencils in each box. How many pencils are there in total?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '4.OA.3' },
        { item_number: 5, question_text: '456 ÷ 8 = ?', knowledge_type: 'procedural', difficulty_level: 'hard', max_score: 10, standard_reference: '4.NBT.6' },
        { item_number: 6, question_text: 'A garden has 12 rows with 18 flowers in each row. How many flowers are in the garden?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '4.OA.3' },
        { item_number: 7, question_text: 'What is 9 × 6 × 4?', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 10, standard_reference: '4.NBT.5' },
        { item_number: 8, question_text: 'If 756 students are divided equally into 9 classrooms, how many students are in each classroom?', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 15, standard_reference: '4.NBT.6' }
      ],

      '5th Grade Fractions & Decimals Unit Test': [
        { item_number: 1, question_text: '3/4 + 1/4 = ?', knowledge_type: 'procedural', difficulty_level: 'easy', max_score: 8, standard_reference: '5.NF.1' },
        { item_number: 2, question_text: '2/3 + 1/6 = ?', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 10, standard_reference: '5.NF.1' },
        { item_number: 3, question_text: '5/8 - 1/4 = ?', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 10, standard_reference: '5.NF.1' },
        { item_number: 4, question_text: '3/5 × 2/7 = ?', knowledge_type: 'procedural', difficulty_level: 'hard', max_score: 12, standard_reference: '5.NF.4' },
        { item_number: 5, question_text: 'Convert 0.75 to a fraction in simplest form.', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 10, standard_reference: '5.NBT.3' },
        { item_number: 6, question_text: 'Convert 3/8 to a decimal.', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 8, standard_reference: '5.NBT.7' },
        { item_number: 7, question_text: 'Sarah ate 2/5 of a pizza. Tom ate 1/3 of the same pizza. How much pizza did they eat together?', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 15, standard_reference: '5.NF.2' },
        { item_number: 8, question_text: 'Compare: 0.6 ___ 5/8 (use <, >, or =)', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '5.NBT.3' },
        { item_number: 9, question_text: 'A recipe calls for 2 1/4 cups of flour. If you want to make half the recipe, how much flour do you need?', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 15, standard_reference: '5.NF.7' },
        { item_number: 10, question_text: 'Order from least to greatest: 0.4, 3/8, 0.35, 2/5', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 12, standard_reference: '5.NBT.3' },
        { item_number: 11, question_text: 'What is 4.56 × 100?', knowledge_type: 'procedural', difficulty_level: 'easy', max_score: 5, standard_reference: '5.NBT.2' },
        { item_number: 12, question_text: 'Divide: 12.48 ÷ 4', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 10, standard_reference: '5.NBT.7' }
      ],

      '3rd Grade Reading Comprehension Assessment': [
        { item_number: 1, question_text: 'Read the story "The Brave Little Mouse" and answer: What was the mouse\'s main problem?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '3.RL.1' },
        { item_number: 2, question_text: 'What is the main idea of the story?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '3.RL.2' },
        { item_number: 3, question_text: 'How did the mouse solve his problem?', knowledge_type: 'factual', difficulty_level: 'easy', max_score: 8, standard_reference: '3.RL.1' },
        { item_number: 4, question_text: 'Read the article "How Plants Grow" and identify three things plants need to grow.', knowledge_type: 'factual', difficulty_level: 'easy', max_score: 9, standard_reference: '3.RI.1' },
        { item_number: 5, question_text: 'What is the main idea of the article about plants?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '3.RI.2' },
        { item_number: 6, question_text: 'Compare how the mouse and plants both overcome challenges.', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 13, standard_reference: '3.RL.9' }
      ],

      '4th Grade Vocabulary & Inference Skills': [
        { item_number: 1, question_text: 'What does "enormous" mean in this sentence: "The enormous elephant walked slowly."', knowledge_type: 'factual', difficulty_level: 'easy', max_score: 8, standard_reference: '4.L.4' },
        { item_number: 2, question_text: 'Use context clues to determine the meaning of "exhausted" in the passage.', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 10, standard_reference: '4.L.4' },
        { item_number: 3, question_text: 'What can you infer about the character\'s feelings from this sentence: "She slammed the door and stomped upstairs."', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 12, standard_reference: '4.RL.1' },
        { item_number: 4, question_text: 'Identify the metaphor in this sentence and explain what it means.', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 15, standard_reference: '4.L.5' },
        { item_number: 5, question_text: 'Based on the evidence in the text, why do you think the character made this choice?', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 15, standard_reference: '4.RL.1' },
        { item_number: 6, question_text: 'What does the prefix "un-" mean in the word "uncertain"?', knowledge_type: 'factual', difficulty_level: 'easy', max_score: 8, standard_reference: '4.L.4' },
        { item_number: 7, question_text: 'Use the word "magnificent" in a sentence that shows you understand its meaning.', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 10, standard_reference: '4.L.4' },
        { item_number: 8, question_text: 'What evidence from the text supports your inference about the setting?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 12, standard_reference: '4.RL.1' },
        { item_number: 9, question_text: 'Explain the difference between "affect" and "effect" and use each in a sentence.', knowledge_type: 'factual', difficulty_level: 'hard', max_score: 15, standard_reference: '4.L.4' },
        { item_number: 10, question_text: 'What can you conclude about the author\'s purpose based on the text features used?', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 15, standard_reference: '4.RI.8' }
      ],

      '4th Grade Life Cycles Assessment': [
        { item_number: 1, question_text: 'List the four stages of a butterfly\'s life cycle in order.', knowledge_type: 'factual', difficulty_level: 'easy', max_score: 8, standard_reference: '4.LS1.1' },
        { item_number: 2, question_text: 'What is metamorphosis?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '4.LS1.1' },
        { item_number: 3, question_text: 'How is a frog\'s life cycle similar to a butterfly\'s life cycle?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 12, standard_reference: '4.LS1.1' },
        { item_number: 4, question_text: 'Describe the life cycle of a bean plant from seed to mature plant.', knowledge_type: 'factual', difficulty_level: 'medium', max_score: 10, standard_reference: '4.LS1.2' },
        { item_number: 5, question_text: 'What environmental factors affect plant growth?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '4.LS1.2' },
        { item_number: 6, question_text: 'Compare complete and incomplete metamorphosis with examples.', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 15, standard_reference: '4.LS1.1' },
        { item_number: 7, question_text: 'Why is reproduction important for the survival of species?', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 12, standard_reference: '4.LS1.1' },
        { item_number: 8, question_text: 'Design an experiment to test what plants need to grow.', knowledge_type: 'procedural', difficulty_level: 'hard', max_score: 15, standard_reference: '4.LS1.2' }
      ],

      '5th Grade Solar System Exploration': [
        { item_number: 1, question_text: 'Name the eight planets in order from the Sun.', knowledge_type: 'factual', difficulty_level: 'easy', max_score: 8, standard_reference: '5.ESS1.2' },
        { item_number: 2, question_text: 'What is the difference between a star and a planet?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '5.ESS1.1' },
        { item_number: 3, question_text: 'Why do planets closer to the Sun have shorter years?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 12, standard_reference: '5.ESS1.2' },
        { item_number: 4, question_text: 'What causes day and night on Earth?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '5.ESS1.2' },
        { item_number: 5, question_text: 'How is the Sun different from other stars we see in the night sky?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 10, standard_reference: '5.ESS1.1' },
        { item_number: 6, question_text: 'What are the characteristics of the inner planets vs. outer planets?', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 15, standard_reference: '5.ESS1.2' },
        { item_number: 7, question_text: 'Explain why we have seasons on Earth.', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 15, standard_reference: '5.ESS1.2' },
        { item_number: 8, question_text: 'What is a light-year and why do astronomers use this measurement?', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 12, standard_reference: '5.ESS1.1' },
        { item_number: 9, question_text: 'How do scientists study objects in space?', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 10, standard_reference: '5.ESS1.1' },
        { item_number: 10, question_text: 'If you could design a space mission, what would you want to explore and why?', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 8, standard_reference: '5.ESS1.1' }
      ],

      'Persuasive Writing Assessment (Mixed Grades)': [
        { item_number: 1, question_text: 'Clear and compelling thesis statement', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 5, standard_reference: 'W.1' },
        { item_number: 2, question_text: 'Supporting evidence and examples', knowledge_type: 'conceptual', difficulty_level: 'medium', max_score: 5, standard_reference: 'W.1' },
        { item_number: 3, question_text: 'Organization and logical flow', knowledge_type: 'procedural', difficulty_level: 'medium', max_score: 5, standard_reference: 'W.1' },
        { item_number: 4, question_text: 'Use of persuasive language and techniques', knowledge_type: 'conceptual', difficulty_level: 'hard', max_score: 5, standard_reference: 'W.1' },
        { item_number: 5, question_text: 'Grammar, spelling, and conventions', knowledge_type: 'procedural', difficulty_level: 'easy', max_score: 5, standard_reference: 'L.1' }
      ]
    };

    const items = itemsMap[assessment.title] || [];
    const itemsWithAssessmentId = items.map(item => ({
      ...item,
      assessment_id: assessment.id
    }));

    if (itemsWithAssessmentId.length === 0) return [];

    const { data, error } = await supabase
      .from('assessment_items')
      .insert(itemsWithAssessmentId)
      .select();

    if (error) {
      console.error(`Error creating items for ${assessment.title}:`, error);
      throw error;
    }
    return data;
  },

  async generateRealisticResponses(students: any[], assessments: any[], allItems: any[]) {
    console.log(`📊 Generating responses for ${students.length} students across ${assessments.length} assessments...`);
    
    // Define student performance profiles
    const performanceProfiles = {
      high: { scoreRange: [85, 95], errorRate: 0.1 },
      average: { scoreRange: [70, 85], errorRate: 0.25 },
      struggling: { scoreRange: [50, 70], errorRate: 0.4 }
    };

    const studentProfiles = {
      'Emma': 'high', 'Sophia': 'high', 'Marcus': 'average',
      'Aiden': 'average', 'Zara': 'average', 'Carlos': 'average', 'Lily': 'average',
      'Jamal': 'struggling', 'Maya': 'struggling', 'Tyler': 'struggling',
      'Amara': 'high', 'Kai': 'average'
    };

    const errorTypes = ['conceptual', 'procedural', 'factual', 'none'];

    for (const student of students) {
      const profile = studentProfiles[student.first_name] || 'average';
      const { scoreRange, errorRate } = performanceProfiles[profile];

      // Assign student to grade-appropriate assessments
      const relevantAssessments = assessments.filter(assessment => 
        assessment.grade_level === student.grade_level || 
        assessment.grade_level === 'Mixed' ||
        (student.grade_level === '6th' && ['4th', '5th'].includes(assessment.grade_level))
      );

      console.log(`  - ${student.first_name}: ${relevantAssessments.length} relevant assessments`);

      for (const assessment of relevantAssessments) {
        const assessmentItems = allItems.filter(item => item.assessment_id === assessment.id);
        const responses = [];

        for (const item of assessmentItems) {
          // Calculate score based on student profile
          const baseScore = Math.random() * (scoreRange[1] - scoreRange[0]) + scoreRange[0];
          const scorePercentage = baseScore / 100;
          let score = Math.round(item.max_score * scorePercentage);
          
          // Ensure score doesn't exceed max_score
          score = Math.min(score, item.max_score);

          // Determine error type
          let errorType = 'none';
          if (Math.random() < errorRate) {
            if (item.difficulty_level === 'hard') {
              errorType = Math.random() < 0.5 ? 'conceptual' : 'procedural';
            } else if (item.difficulty_level === 'medium') {
              errorType = errorTypes[Math.floor(Math.random() * 3)]; // exclude 'none'
            } else {
              errorType = Math.random() < 0.7 ? 'factual' : 'procedural';
            }
          }

          // Generate realistic teacher notes
          const teacherNotes = this.generateTeacherNotes(student.first_name, item, score, errorType);

          responses.push({
            student_id: student.id,
            assessment_id: assessment.id,
            assessment_item_id: item.id,
            score: score,
            error_type: errorType,
            teacher_notes: teacherNotes
          });
        }

        // Insert responses in batches
        if (responses.length > 0) {
          const { error } = await supabase
            .from('student_responses')
            .insert(responses);

          if (error) {
            console.error(`Error inserting responses for ${student.first_name}:`, error);
          } else {
            console.log(`    ✓ Added ${responses.length} responses for "${assessment.title}"`);
          }
        }
      }
    }
  },

  generateTeacherNotes(studentName: string, item: any, score: number, errorType: string): string {
    const percentage = (score / item.max_score) * 100;
    
    if (percentage >= 90) {
      return `${studentName} demonstrated excellent understanding. Work is accurate and shows clear reasoning.`;
    } else if (percentage >= 80) {
      return `${studentName} shows good understanding with minor errors. Encourage continued practice.`;
    } else if (percentage >= 70) {
      return `${studentName} understands basic concepts but needs support with ${errorType === 'conceptual' ? 'deeper understanding' : errorType === 'procedural' ? 'step-by-step processes' : 'careful attention to details'}.`;
    } else if (percentage >= 60) {
      return `${studentName} is developing understanding. Requires additional instruction and practice with ${item.knowledge_type} skills.`;
    } else {
      return `${studentName} needs significant support. Consider re-teaching concepts with different approaches and providing additional scaffolding.`;
    }
  },

  async generateLearningGoals(students: any[], teacherId: string) {
    const goalTemplates = {
      high: [
        'Develop advanced problem-solving strategies',
        'Take on leadership roles in group projects',
        'Explore enrichment activities beyond grade level',
        'Mentor struggling classmates'
      ],
      average: [
        'Improve fluency in basic math facts',
        'Develop better reading comprehension strategies',
        'Build confidence in problem-solving',
        'Practice explaining reasoning clearly'
      ],
      struggling: [
        'Master foundational skills with support',
        'Develop effective study strategies',
        'Build academic confidence',
        'Use assistive tools and accommodations effectively'
      ]
    };

    const studentProfiles = {
      'Emma': 'high', 'Sophia': 'high', 'Marcus': 'average',
      'Aiden': 'average', 'Zara': 'average', 'Carlos': 'average', 'Lily': 'average',
      'Jamal': 'struggling', 'Maya': 'struggling', 'Tyler': 'struggling',
      'Amara': 'high', 'Kai': 'average'
    };

    for (const student of students) {
      const profile = studentProfiles[student.first_name] || 'average';
      const templates = goalTemplates[profile];
      
      // Create 2-3 goals per student
      const goalCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 goals
      
      for (let i = 0; i < goalCount; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const targetDate = new Date(Date.now() + (30 + Math.random() * 60) * 24 * 60 * 60 * 1000); // 30-90 days from now
        
        const goal = {
          student_id: student.id,
          teacher_id: teacherId,
          title: template,
          description: `Personalized learning goal for ${student.first_name} based on assessment performance and learning profile.`,
          target_date: targetDate.toISOString().split('T')[0],
          status: Math.random() < 0.8 ? 'active' : 'completed',
          progress_percentage: Math.floor(Math.random() * 80) + 10 // 10-90% progress
        };

        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .insert(goal)
          .select()
          .single();

        if (goalError) {
          console.error('Error creating goal:', goalError);
          continue;
        }

        // Create 1-3 milestones per goal
        const milestoneCount = Math.floor(Math.random() * 3) + 1;
        const milestones = [];

        for (let j = 0; j < milestoneCount; j++) {
          const milestoneDate = new Date(Date.now() + (j + 1) * 14 * 24 * 60 * 60 * 1000); // Every 2 weeks
          
          milestones.push({
            goal_id: goalData.id,
            title: `Milestone ${j + 1}: ${template} checkpoint`,
            description: `Intermediate step toward achieving the goal`,
            target_date: milestoneDate.toISOString().split('T')[0],
            completed_at: Math.random() < 0.4 ? new Date().toISOString() : null
          });
        }

        if (milestones.length > 0) {
          await supabase.from('goal_milestones').insert(milestones);
        }
      }
    }
  },

  async generateAIAnalysisData(students: any[], assessments: any[]) {
    console.log(`🧠 Generating AI analysis for ${students.length} students across ${assessments.length} assessments...`);
    
    const analysisTemplates = {
      high: {
        strengths: [
          'Demonstrates exceptional problem-solving abilities',
          'Shows strong analytical thinking skills',
          'Excels at making connections between concepts',
          'Displays advanced reasoning capabilities',
          'Works independently and efficiently'
        ],
        growth_areas: [
          'Could benefit from more challenging materials',
          'Opportunity to develop leadership skills',
          'Can explore advanced applications',
          'Consider acceleration in strong subjects'
        ],
        recommendations: [
          'Provide enrichment activities and advanced problems',
          'Encourage peer tutoring opportunities',
          'Offer independent research projects',
          'Consider advanced placement or acceleration'
        ]
      },
      average: {
        strengths: [
          'Shows steady progress and improvement',
          'Demonstrates good effort and persistence',
          'Understands basic concepts well',
          'Participates actively in class discussions',
          'Collaborates effectively with peers'
        ],
        growth_areas: [
          'Needs practice with multi-step problems',
          'Could improve problem-solving strategies',
          'Benefits from additional practice time',
          'Should focus on skill fluency development'
        ],
        recommendations: [
          'Provide additional practice opportunities',
          'Use visual aids and manipulatives',
          'Break complex problems into smaller steps',
          'Offer regular feedback and encouragement'
        ]
      },
      struggling: {
        strengths: [
          'Shows determination and effort',
          'Responds well to individual attention',
          'Demonstrates improvement with support',
          'Has strong verbal communication skills',
          'Benefits from hands-on learning approaches'
        ],
        growth_areas: [
          'Needs foundational skill development',
          'Requires additional processing time',
          'Benefits from alternative teaching methods',
          'Needs confidence building in academic areas'
        ],
        recommendations: [
          'Provide intensive intervention and support',
          'Use multi-sensory teaching approaches',
          'Offer extended time and modified assessments',
          'Implement daily progress monitoring'
        ]
      }
    };

    const studentProfiles = {
      'Emma': 'high', 'Sophia': 'high', 'Marcus': 'average',
      'Aiden': 'average', 'Zara': 'average', 'Carlos': 'average', 'Lily': 'average',
      'Jamal': 'struggling', 'Maya': 'struggling', 'Tyler': 'struggling',
      'Amara': 'high', 'Kai': 'average'
    };

    for (const student of students) {
      const profile = studentProfiles[student.first_name] || 'average';
      const template = analysisTemplates[profile];

      // Find assessments this student has taken
      const relevantAssessments = assessments.filter(assessment => 
        assessment.grade_level === student.grade_level || 
        assessment.grade_level === 'Mixed' ||
        (student.grade_level === '6th' && ['4th', '5th'].includes(assessment.grade_level))
      );

      console.log(`  - Generating analysis for ${student.first_name}: ${relevantAssessments.length} assessments`);

      for (const assessment of relevantAssessments) {
        // Create analysis for each assessment
        const analysis = {
          assessment_id: assessment.id,
          student_id: student.id,
          strengths: this.selectRandomItems(template.strengths, 2, 3),
          growth_areas: this.selectRandomItems(template.growth_areas, 1, 3),
          recommendations: this.selectRandomItems(template.recommendations, 2, 4),
          patterns_observed: [
            `Shows ${profile === 'high' ? 'consistent excellence' : profile === 'average' ? 'steady progress' : 'variable performance'} across different question types`,
            `${profile === 'struggling' ? 'Benefits from additional support' : 'Demonstrates good understanding'} with ${assessment.subject.toLowerCase()} concepts`,
            `Performance indicates ${profile === 'high' ? 'readiness for advanced work' : profile === 'average' ? 'solid foundational knowledge' : 'need for skill reinforcement'}`
          ],
          overall_summary: `${student.first_name} demonstrates ${profile === 'high' ? 'exceptional' : profile === 'average' ? 'satisfactory' : 'developing'} performance on this ${assessment.subject} assessment. ${profile === 'high' ? 'Continue to challenge and enrich.' : profile === 'average' ? 'Focus on skill application and fluency.' : 'Provide additional support and intervention.'}`,
          analysis_json: {
            performance_level: profile,
            subject_area: assessment.subject,
            grade_level: assessment.grade_level,
            analysis_date: new Date().toISOString(),
            detailed_breakdown: {
              conceptual_understanding: profile === 'high' ? 'Advanced' : profile === 'average' ? 'Proficient' : 'Developing',
              procedural_skills: profile === 'high' ? 'Mastered' : profile === 'average' ? 'Proficient' : 'Needs Support',
              problem_solving: profile === 'high' ? 'Exceptional' : profile === 'average' ? 'Good' : 'Emerging'
            }
          }
        };

        const { error } = await supabase
          .from('assessment_analysis')
          .insert(analysis);

        if (error) {
          console.error(`Error creating analysis for ${student.first_name} - ${assessment.title}:`, error);
        } else {
          console.log(`    ✓ Created analysis for "${assessment.title}"`);
        }
      }
    }
  },

  selectRandomItems(array: string[], min: number, max: number): string[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  async generateCommunicationHistory(students: any[], teacherId: string) {
    const communicationTypes = ['progress_report', 'parent_conference', 'behavior_update', 'academic_concern'];
    const subjects = [
      'Monthly Progress Update',
      'Assessment Results Discussion',
      'Student Achievement Celebration',
      'Learning Support Recommendations',
      'Parent-Teacher Conference Follow-up'
    ];

    // Generate 1-3 communications per student
    for (const student of students) {
      const commCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < commCount; i++) {
        const commType = communicationTypes[Math.floor(Math.random() * communicationTypes.length)];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const sentDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Last 60 days
        
        const communication = {
          student_id: student.id,
          teacher_id: teacherId,
          communication_type: commType,
          subject: `${subject} - ${student.first_name} ${student.last_name}`,
          content: this.generateCommunicationContent(student.first_name, commType),
          parent_email: this.generateParentEmail(student.first_name, student.last_name),
          sent_at: sentDate.toISOString(),
          pdf_url: null // Would be generated in real implementation
        };

        const { error } = await supabase
          .from('parent_communications')
          .insert(communication);

        if (error) {
          console.error('Error creating communication:', error);
        }
      }
    }
  },

  generateCommunicationContent(studentName: string, type: string): string {
    const templates = {
      progress_report: `Dear Parents,\n\nI wanted to share ${studentName}'s recent progress in class. ${studentName} has been working hard and showing improvement in several key areas. We've seen particular growth in problem-solving skills and class participation. Please continue to encourage ${studentName}'s efforts at home.\n\nBest regards,\nMs. Johnson`,
      parent_conference: `Thank you for attending our conference to discuss ${studentName}'s academic progress. As we discussed, ${studentName} is meeting most grade-level expectations and showing steady improvement. We agreed on some strategies to support continued growth at home.\n\nLooking forward to our continued partnership.\n\nWarm regards,\nMs. Johnson`,
      behavior_update: `I wanted to give you a positive update about ${studentName}'s behavior in class. ${studentName} has been demonstrating excellent citizenship and helping classmates when needed. This positive attitude is contributing to ${studentName}'s academic success as well.\n\nKeep up the great work!\n\nMs. Johnson`,
      academic_concern: `I wanted to reach out regarding some academic areas where ${studentName} could benefit from additional support. While ${studentName} is working hard, we've identified some specific skills that need reinforcement. I'd love to discuss strategies we can implement both at school and at home.\n\nPlease let me know when you're available for a phone call.\n\nBest,\nMs. Johnson`
    };

    return templates[type] || templates.progress_report;
  },

  generateParentEmail(firstName: string, lastName: string): string {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  }
};
