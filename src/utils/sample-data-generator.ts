
import { supabase } from '@/integrations/supabase/client';
import { performanceService } from '@/services/performance-service';

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
      
      // Calculate and create performance records
      console.log('📊 Calculating student performance metrics...');
      await this.calculatePerformanceRecords();
      
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
    // Delete in correct order to respect foreign key constraints
    await supabase.from('goal_milestones').delete().eq('goal_id', 'in', 
      `(SELECT id FROM goals WHERE teacher_id = '${teacherId}')`);
    await supabase.from('goals').delete().eq('teacher_id', teacherId);
    await supabase.from('parent_communications').delete().eq('teacher_id', teacherId);
    await supabase.from('assessment_analysis').delete().eq('assessment_id', 'in',
      `(SELECT id FROM assessments WHERE teacher_id = '${teacherId}')`);
    await supabase.from('student_responses').delete().eq('assessment_id', 'in',
      `(SELECT id FROM assessments WHERE teacher_id = '${teacherId}')`);
    await supabase.from('assessment_items').delete().eq('assessment_id', 'in',
      `(SELECT id FROM assessments WHERE teacher_id = '${teacherId}')`);
    await supabase.from('assessments').delete().eq('teacher_id', teacherId);
    await supabase.from('student_performance').delete().eq('student_id', 'in',
      `(SELECT id FROM students WHERE teacher_id = '${teacherId}')`);
    await supabase.from('students').delete().eq('teacher_id', teacherId);
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
      },
      {
        first_name: 'Jamal',
        last_name: 'Williams',
        grade_level: '5th',
        teacher_id: teacherId,
        student_id: 'JW-2024-006',
        learning_goals: 'Science inquiry skills and mathematical reasoning'
      },
      {
        first_name: 'Sofia',
        last_name: 'Garcia',
        grade_level: '4th',
        teacher_id: teacherId,
        student_id: 'SG-2024-007',
        learning_goals: 'English language development and social studies concepts'
      },
      {
        first_name: 'Ethan',
        last_name: 'Brown',
        grade_level: '6th',
        teacher_id: teacherId,
        student_id: 'EB-2024-008',
        learning_goals: 'Advanced mathematics and leadership skills'
      },
      {
        first_name: 'Maya',
        last_name: 'Singh',
        grade_level: '3rd',
        teacher_id: teacherId,
        student_id: 'MS-2024-009',
        learning_goals: 'Creative writing and artistic expression'
      },
      {
        first_name: 'Alex',
        last_name: 'Thompson',
        grade_level: '5th',
        teacher_id: teacherId,
        student_id: 'AT-2024-010',
        learning_goals: 'STEM integration and collaborative learning'
      },
      {
        first_name: 'Layla',
        last_name: 'Ahmed',
        grade_level: '4th',
        teacher_id: teacherId,
        student_id: 'LA-2024-011',
        learning_goals: 'Mathematical problem-solving and perseverance'
      },
      {
        first_name: 'Connor',
        last_name: 'O\'Brien',
        grade_level: '6th',
        teacher_id: teacherId,
        student_id: 'CO-2024-012',
        learning_goals: 'Research skills and analytical thinking'
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
        is_draft: false,
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
        is_draft: false,
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
        is_draft: false,
        teacher_id: teacherId
      },
      {
        title: 'Writing Portfolio Review',
        description: 'Evaluation of writing development and communication skills',
        subject: 'English Language Arts',
        grade_level: '5th',
        assessment_type: 'portfolio',
        standards_covered: ['5.W.1', '5.W.2', '5.W.3', '5.L.1', '5.L.2'],
        max_score: 60,
        assessment_date: '2024-02-01',
        is_draft: false,
        teacher_id: teacherId
      },
      {
        title: 'Early Math Skills Check',
        description: 'Foundational mathematics concepts and number sense',
        subject: 'Mathematics',
        grade_level: '3rd',
        assessment_type: 'test',
        standards_covered: ['3.NBT.1', '3.NBT.2', '3.OA.1', '3.OA.3'],
        max_score: 50,
        assessment_date: '2024-02-05',
        is_draft: false,
        teacher_id: teacherId
      },
      {
        title: 'Social Studies Project',
        description: 'Research and presentation on community helpers',
        subject: 'Social Studies',
        grade_level: '4th',
        assessment_type: 'project',
        standards_covered: ['4.SS.1', '4.SS.2', '4.SS.3'],
        max_score: 90,
        assessment_date: '2024-02-10',
        is_draft: false,
        teacher_id: teacherId
      },
      {
        title: 'Advanced Problem Solving',
        description: 'Complex mathematical reasoning and multi-step problems',
        subject: 'Mathematics',
        grade_level: '6th',
        assessment_type: 'test',
        standards_covered: ['6.EE.1', '6.EE.2', '6.RP.1', '6.RP.3'],
        max_score: 120,
        assessment_date: '2024-02-15',
        is_draft: false,
        teacher_id: teacherId
      },
      {
        title: 'Creative Writing Assessment',
        description: 'Original storytelling and narrative development',
        subject: 'English Language Arts',
        grade_level: '3rd',
        assessment_type: 'performance',
        standards_covered: ['3.W.3', '3.L.1', '3.L.2'],
        max_score: 40,
        assessment_date: '2024-02-20',
        is_draft: false,
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
      let items = [];
      
      if (assessment.subject === 'Mathematics') {
        items = [
          {
            assessment_id: assessment.id,
            item_number: 1,
            question_text: 'Solve: 347 + 286 = ?',
            knowledge_type: 'procedural',
            difficulty_level: 'medium',
            max_score: Math.floor(assessment.max_score * 0.15),
            standard_reference: assessment.standards_covered[0]
          },
          {
            assessment_id: assessment.id,
            item_number: 2,
            question_text: 'If Maria has 4 bags with 23 stickers each, how many stickers does she have in total?',
            knowledge_type: 'conceptual',
            difficulty_level: 'medium',
            max_score: Math.floor(assessment.max_score * 0.20),
            standard_reference: assessment.standards_covered[1] || assessment.standards_covered[0]
          },
          {
            assessment_id: assessment.id,
            item_number: 3,
            question_text: 'What is the value of the digit 6 in the number 8,647?',
            knowledge_type: 'factual',
            difficulty_level: 'easy',
            max_score: Math.floor(assessment.max_score * 0.10),
            standard_reference: assessment.standards_covered[0]
          },
          {
            assessment_id: assessment.id,
            item_number: 4,
            question_text: 'Write an expression that represents "8 more than 5 times a number"',
            knowledge_type: 'conceptual',
            difficulty_level: 'hard',
            max_score: Math.floor(assessment.max_score * 0.25),
            standard_reference: assessment.standards_covered[2] || assessment.standards_covered[0]
          },
          {
            assessment_id: assessment.id,
            item_number: 5,
            question_text: 'A rectangle has a length of 12 cm and width of 8 cm. What is its perimeter?',
            knowledge_type: 'procedural',
            difficulty_level: 'medium',
            max_score: Math.floor(assessment.max_score * 0.30),
            standard_reference: assessment.standards_covered[3] || assessment.standards_covered[0]
          }
        ];
      } else {
        // Generic items for other subjects
        const numItems = 4;
        const scorePerItem = Math.floor(assessment.max_score / numItems);
        
        for (let i = 1; i <= numItems; i++) {
          items.push({
            assessment_id: assessment.id,
            item_number: i,
            question_text: `${assessment.subject} question ${i} for ${assessment.title}`,
            knowledge_type: ['factual', 'conceptual', 'procedural'][i % 3],
            difficulty_level: ['easy', 'medium', 'hard'][i % 3],
            max_score: scorePerItem,
            standard_reference: assessment.standards_covered[i % assessment.standards_covered.length]
          });
        }
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
        // Create realistic performance based on student profile
        const performanceLevel = this.getStudentPerformanceLevel(student);
        
        for (const item of items) {
          const score = this.generateRealisticScore(item.max_score, performanceLevel, item.difficulty_level);
          
          const response = {
            student_id: student.id,
            assessment_id: assessment.id,
            assessment_item_id: item.id,
            score: score,
            error_type: score < item.max_score * 0.7 ? this.getRandomErrorType() : 'none',
            teacher_notes: this.generateTeacherNotes(student, item, score)
          };
          
          const { error } = await supabase
            .from('student_responses')
            .insert(response);
            
          if (error) throw error;
        }
      }
    }
  },

  async calculatePerformanceRecords() {
    console.log('📊 Starting performance calculation for all students...');
    
    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id');
      
    if (studentsError) throw studentsError;
    
    for (const student of students) {
      try {
        await performanceService.updateStudentPerformance(student.id);
        console.log(`✅ Performance calculated for student ${student.id}`);
      } catch (error) {
        console.error(`❌ Failed to calculate performance for student ${student.id}:`, error);
      }
    }
    
    console.log('✅ Performance calculation completed for all students');
  },

  getStudentPerformanceLevel(student: any) {
    // Assign realistic performance levels based on student names/profiles
    const highPerformers = ['Emma', 'Ethan', 'Maya', 'Alex'];
    const strugglingStudents = ['Diego', 'Sofia', 'Connor'];
    
    if (highPerformers.includes(student.first_name)) return 'high';
    if (strugglingStudents.includes(student.first_name)) return 'low';
    return 'average';
  },

  generateRealisticScore(maxScore: number, performanceLevel: string, difficulty: string) {
    let basePercentage = 0.75; // Default average performance
    
    if (performanceLevel === 'high') basePercentage = 0.90;
    if (performanceLevel === 'low') basePercentage = 0.60;
    
    // Adjust for difficulty
    if (difficulty === 'hard') basePercentage -= 0.10;
    if (difficulty === 'easy') basePercentage += 0.10;
    
    // Add some randomness
    const variation = (Math.random() - 0.5) * 0.20;
    const finalPercentage = Math.max(0, Math.min(1, basePercentage + variation));
    
    return Math.round(maxScore * finalPercentage);
  },

  getRandomErrorType() {
    const errorTypes = ['conceptual', 'procedural', 'careless', 'none'];
    return errorTypes[Math.floor(Math.random() * errorTypes.length)];
  },

  generateTeacherNotes(student: any, item: any, score: number) {
    const performance = score / item.max_score;
    
    if (performance >= 0.9) {
      return `Excellent work! ${student.first_name} demonstrated strong understanding.`;
    } else if (performance >= 0.7) {
      return `Good effort. ${student.first_name} shows solid grasp of the concept.`;
    } else if (performance >= 0.5) {
      return `${student.first_name} needs additional practice with this concept.`;
    } else {
      return `Requires reteaching. ${student.first_name} struggled with this problem.`;
    }
  },

  async generateAIAnalysis(students: any[], assessments: any[]) {
    // Generate sample AI analysis for a subset of students/assessments
    const analysisData = [];
    
    for (let i = 0; i < Math.min(students.length, 5); i++) {
      for (let j = 0; j < Math.min(assessments.length, 2); j++) {
        analysisData.push({
          assessment_id: assessments[j].id,
          student_id: students[i].id,
          strengths: ['Problem solving', 'Mathematical reasoning', 'Attention to detail'],
          growth_areas: ['Multi-step problems', 'Word problem interpretation'],
          patterns_observed: ['Strong in computation', 'Needs support with application'],
          overall_summary: `${students[i].first_name} shows good mathematical foundation with room for growth in complex problem solving.`,
          recommendations: ['Provide more word problem practice', 'Use visual aids for complex problems', 'Encourage peer collaboration']
        });
      }
    }
    
    if (analysisData.length > 0) {
      const { error } = await supabase
        .from('assessment_analysis')
        .insert(analysisData);
        
      if (error) throw error;
    }
  },

  async createGoalsAndCommunications(students: any[], teacherId: string) {
    // Create sample goals for some students
    const goalsData = students.slice(0, 6).map(student => ({
      student_id: student.id,
      teacher_id: teacherId,
      title: `Improve ${['Math Problem Solving', 'Reading Comprehension', 'Writing Skills'][Math.floor(Math.random() * 3)]}`,
      description: `Personalized learning goal for ${student.first_name} based on assessment results.`,
      target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      status: 'active',
      progress_percentage: Math.floor(Math.random() * 60) + 20 // 20-80% progress
    }));
    
    const { error: goalsError } = await supabase
      .from('goals')
      .insert(goalsData);
      
    if (goalsError) throw goalsError;
    
    // Create sample parent communications
    const communicationsData = students.slice(0, 4).map(student => ({
      student_id: student.id,
      teacher_id: teacherId,
      subject: `${student.first_name}'s Progress Update`,
      content: `Dear Parents, I wanted to share ${student.first_name}'s recent progress in our classroom...`,
      communication_type: 'progress_report',
      parent_email: `parent.${student.last_name.toLowerCase()}@email.com`,
      sent_at: new Date().toISOString()
    }));
    
    const { error: communicationsError } = await supabase
      .from('parent_communications')
      .insert(communicationsData);
      
    if (communicationsError) throw communicationsError;
  }
};
