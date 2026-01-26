import { supabase } from '@/integrations/supabase/client';

export const sampleDataGenerator = {
  async generateComprehensiveData(options: {
    clearExistingData?: boolean;
    generateAnalysis?: boolean;
  } = {}) {
    const { clearExistingData = true, generateAnalysis = true } = options;
    
    try {
      console.log('🚀 Starting comprehensive sample data generation...');
      
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('User not authenticated');
      }
      
      const teacherId = authData.user.id;
      
      // Clear existing data if requested
      if (clearExistingData) {
        console.log('🧹 Clearing existing data...');
        await this.clearExistingData(teacherId);
      }
      
      // Generate students
      console.log('👥 Creating diverse student profiles...');
      const students = await this.createStudents(teacherId);
      
      // Generate assessments
      console.log('📝 Creating comprehensive assessments...');
      const assessments = await this.createAssessments(teacherId);
      
      // Generate assessment items
      console.log('📋 Creating assessment items...');
      await this.createAssessmentItems(assessments);
      
      // Generate student responses
      console.log('✍️ Creating realistic student responses...');
      await this.createStudentResponses(students, assessments);
      
      // Generate AI analysis if requested
      if (generateAnalysis) {
        console.log('🧠 Generating AI analysis and insights...');
        await this.generateAIAnalysis(students, assessments);
      }
      
      // Generate goals and communications
      console.log('🎯 Creating learning goals and communications...');
      await this.createGoalsAndCommunications(students, teacherId);
      
      console.log('✅ Comprehensive sample data generation completed successfully!');
      
    } catch (error) {
      console.error('❌ Sample data generation failed:', error);
      throw error;
    }
  },

  async clearExistingData(teacherId: string) {
    // Delete goals
    await supabase
      .from('goals')
      .delete()
      .eq('teacher_id', teacherId);

    // Delete parent communications
    await supabase
      .from('parent_communications')
      .delete()
      .eq('teacher_id', teacherId);

    // Fetch assessments to delete
    const { data: assessments } = await supabase
      .from('assessments')
      .select('id')
      .eq('teacher_id', teacherId);

    if (assessments && assessments.length > 0) {
      const assessmentIds = assessments.map(assessment => assessment.id);
      
      // Delete assessment analysis
      await supabase
        .from('assessment_analysis')
        .delete()
        .in('assessment_id', assessmentIds);
      
      // Delete student responses
      await supabase
        .from('student_responses')
        .delete()
        .in('assessment_id', assessmentIds);
        
      // Delete assessment items
      await supabase
        .from('assessment_items')
        .delete()
        .in('assessment_id', assessmentIds);
    }
    
    // Delete assessments
    await supabase
      .from('assessments')
      .delete()
      .eq('teacher_id', teacherId);
    
    // Delete students
    await supabase
      .from('students')
      .delete()
      .eq('teacher_id', teacherId);
  },

  async createStudents(teacherId: string) {
    const studentProfiles = [
      {
        first_name: 'Emma',
        last_name: 'Rodriguez', 
        grade_level: '5th',
        teacher_id: teacherId,
        student_id: 'ER-2024-001',
        learning_goals: 'Improve multiplication fluency and problem-solving strategies'
      },
      {
        first_name: 'Marcus',
        last_name: 'Johnson',
        grade_level: '5th', 
        teacher_id: teacherId,
        student_id: 'MJ-2024-002',
        learning_goals: 'Strengthen reading comprehension and vocabulary development'
      },
      {
        first_name: 'Aisha',
        last_name: 'Patel',
        grade_level: '4th',
        teacher_id: teacherId,
        student_id: 'AP-2024-003',
        learning_goals: 'Build confidence in math problem solving and communication'
      },
      {
        first_name: 'Diego',
        last_name: 'Martinez',
        grade_level: '6th',
        teacher_id: teacherId,
        student_id: 'DM-2024-004',
        learning_goals: 'Advanced writing skills and critical thinking development'
      },
      {
        first_name: 'Zoe',
        last_name: 'Chen',
        grade_level: '3rd',
        teacher_id: teacherId,
        student_id: 'ZC-2024-005',
        learning_goals: 'Phonics mastery and early reading fluency'
      }
    ];

    const { data: students, error } = await supabase
      .from('students')
      .insert(studentProfiles)
      .select();
      
    if (error) throw error;
    return students;
  },

  async createAssessments(teacherId: string) {
    const assessmentData = [
      {
        title: 'Fall Mathematics Assessment',
        description: 'Comprehensive evaluation of mathematical concepts and problem-solving skills',
        subject: 'Mathematics',
        grade_level: '5th',
        assessment_type: 'test',
        standards_covered: ['5.NBT.1', '5.NBT.2', '5.OA.1', '5.OA.2', '5.MD.1'],
        max_score: 100,
        assessment_date: '2024-01-15',
        teacher_id: teacherId
      },
      {
        title: 'Reading Comprehension Unit Test',
        description: 'Assessment of reading strategies and text analysis skills',
        subject: 'English Language Arts',
        grade_level: '4th',
        assessment_type: 'test',
        standards_covered: ['4.RL.1', '4.RL.2', '4.RL.3', '4.RI.1', '4.RI.2'],
        max_score: 80,
        assessment_date: '2024-01-20',
        teacher_id: teacherId
      },
      {
        title: 'Science Lab Investigation',
        description: 'Hands-on assessment of scientific inquiry and methodology',
        subject: 'Science',
        grade_level: '6th',
        assessment_type: 'performance',
        standards_covered: ['6.ETS1.1', '6.ETS1.2', '6.ETS1.3'],
        max_score: 75,
        assessment_date: '2024-01-25',
        teacher_id: teacherId
      }
    ];

    const { data: assessments, error } = await supabase
      .from('assessments')
      .insert(assessmentData)
      .select();
      
    if (error) throw error;
    return assessments;
  },

  async createAssessmentItems(assessments: any[]) {
    for (const assessment of assessments) {
      const items = [];
      const numItems = 4;
      const scorePerItem = Math.floor(assessment.max_score / numItems);
      
      for (let i = 1; i <= numItems; i++) {
        items.push({
          assessment_id: assessment.id,
          item_order: i,
          question_text: `${assessment.subject} question ${i} for ${assessment.title}`,
          knowledge_type: ['factual', 'conceptual', 'procedural'][i % 3],
          difficulty_level: ['easy', 'medium', 'hard'][i % 3],
          max_score: scorePerItem
        });
      }
      
      const { error } = await supabase
        .from('assessment_items')
        .insert(items);
        
      if (error) throw error;
    }
  },

  async createStudentResponses(students: any[], assessments: any[]) {
    for (const assessment of assessments) {
      // Get assessment items for this assessment
      const { data: items, error: itemsError } = await supabase
        .from('assessment_items')
        .select('*')
        .eq('assessment_id', assessment.id);
        
      if (itemsError) throw itemsError;
      
      for (const student of students) {
        for (const item of (items || [])) {
          const score = Math.floor(Math.random() * (item.max_score + 1));
          
          const response = {
            student_id: student.id,
            assessment_id: assessment.id,
            assessment_item_id: item.id,
            score: score,
            error_type: score < item.max_score * 0.7 ? 'conceptual' : null,
            teacher_notes: `Response for ${student.first_name}`
          };
          
          const { error } = await supabase
            .from('student_responses')
            .insert(response);
            
          if (error) throw error;
        }
      }
    }
  },

  async generateAIAnalysis(students: any[], assessments: any[]) {
    console.log('📊 AI analysis generation skipped (requires API integration)');
  },

  async createGoalsAndCommunications(students: any[], teacherId: string) {
    for (const student of students) {
      // Create a goal for each student
      const { error: goalError } = await supabase
        .from('goals')
        .insert({
          student_id: student.id,
          teacher_id: teacherId,
          title: `Learning goal for ${student.first_name}`,
          description: student.learning_goals,
          status: 'active',
          progress: Math.floor(Math.random() * 50),
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        
      if (goalError) console.error('Error creating goal:', goalError);
    }
    
    console.log('✅ Goals created successfully');
  }
};
