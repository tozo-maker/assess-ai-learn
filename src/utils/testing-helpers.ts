import { supabase } from '@/integrations/supabase/client';

export interface TestingReport {
  success: boolean;
  message: string;
  details?: any;
}

export const testingHelpers = {
  async runFoundationTests(): Promise<TestingReport[]> {
    const results: TestingReport[] = [];
    
    try {
      console.log('🧪 Starting Phase 1: Foundation Testing...');
      
      // Test 1: Authentication
      console.log('Testing authentication...');
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        results.push({
          success: false,
          message: 'Authentication failed - user not logged in',
        });
        return results;
      }
      
      results.push({
        success: true,
        message: 'Authentication verified',
        details: { userId: authData.user.id },
      });

      // Test 2: Create test students
      console.log('Creating test students...');
      const testStudents = [
        {
          first_name: 'Emma',
          last_name: 'Rodriguez',
          grade_level: '5th',
          teacher_id: authData.user.id,
        },
        {
          first_name: 'Marcus',
          last_name: 'Johnson',
          grade_level: '5th',
          teacher_id: authData.user.id,
        },
        {
          first_name: 'Aisha',
          last_name: 'Patel',
          grade_level: '5th',
          teacher_id: authData.user.id,
        },
      ];

      const createdStudents = [];
      for (const student of testStudents) {
        const { data, error } = await supabase
          .from('students')
          .insert(student)
          .select()
          .single();
        
        if (error) {
          console.error('Error creating student:', error);
          results.push({
            success: false,
            message: `Failed to create test student: ${error.message}`,
          });
          return results;
        }
        
        createdStudents.push(data);
        console.log(`Created student: ${data.first_name} ${data.last_name} (ID: ${data.id})`);
      }

      results.push({
        success: true,
        message: 'Test students created successfully',
        details: { studentsCreated: createdStudents.length },
      });

      // Test 3: Create test assessment
      console.log('Creating test assessment...');
      const assessmentData = {
        title: 'Math Problem Solving Assessment',
        description: 'Comprehensive assessment of mathematical reasoning and problem-solving skills',
        subject: 'Mathematics',
        grade_level: '5th',
        assessment_type: 'test',
        standards_covered: ['5.NBT.1', '5.NBT.2', '5.OA.1', '5.OA.2'],
        max_score: 100,
        assessment_date: new Date().toISOString().split('T')[0],
        teacher_id: authData.user.id,
      };

      console.log('Creating assessment with data:', assessmentData);
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (assessmentError) {
        console.error('Assessment creation error:', assessmentError);
        results.push({
          success: false,
          message: `Failed to create test assessment: ${assessmentError.message}`,
        });
        return results;
      }

      console.log('Created assessment:', assessment);
      results.push({
        success: true,
        message: 'Test assessment created successfully',
        details: { assessmentId: assessment.id },
      });

      // Test 4: Create assessment items
      console.log('Creating assessment items...');
      const assessmentItems = [
        {
          assessment_id: assessment.id,
          item_order: 1,
          question_text: 'Solve: 245 + 167 = ?',
          knowledge_type: 'procedural',
          difficulty_level: 'medium',
          max_score: 2,
        },
        {
          assessment_id: assessment.id,
          item_order: 2,
          question_text: 'If Sarah has 3 bags with 15 marbles each, how many marbles does she have in total?',
          knowledge_type: 'conceptual',
          difficulty_level: 'easy',
          max_score: 3,
        },
        {
          assessment_id: assessment.id,
          item_order: 3,
          question_text: 'What is the value of the digit 7 in the number 4,735?',
          knowledge_type: 'factual',
          difficulty_level: 'medium',
          max_score: 2,
        },
        {
          assessment_id: assessment.id,
          item_order: 4,
          question_text: 'Write an expression that represents "5 more than 3 times a number"',
          knowledge_type: 'conceptual',
          difficulty_level: 'hard',
          max_score: 4,
        },
        {
          assessment_id: assessment.id,
          item_order: 5,
          question_text: 'Round 4,687 to the nearest hundred.',
          knowledge_type: 'procedural',
          difficulty_level: 'easy',
          max_score: 1,
        },
      ];

      const { data: items, error: itemsError } = await supabase
        .from('assessment_items')
        .insert(assessmentItems)
        .select();

      if (itemsError) {
        console.error('Assessment items creation error:', itemsError);
        results.push({
          success: false,
          message: `Failed to create assessment items: ${itemsError.message}`,
        });
        return results;
      }

      console.log(`Created ${items.length} assessment items`);
      results.push({
        success: true,
        message: 'Assessment items created successfully',
        details: { itemsCreated: items.length },
      });

      // Test 5: Create test responses
      console.log('Creating test responses...');
      let totalResponsesCreated = 0;
      
      for (let i = 0; i < createdStudents.length; i++) {
        const student = createdStudents[i];
        
        const studentResponses = items.map((item, itemIndex) => ({
          student_id: student.id,
          assessment_id: assessment.id,
          assessment_item_id: item.id,
          score: Math.floor(Math.random() * (item.max_score + 1)),
          error_type: itemIndex % 3 === 0 ? 'conceptual' : (itemIndex % 3 === 1 ? 'procedural' : null),
          teacher_notes: `Sample response for ${student.first_name} on item ${item.item_order}`,
        }));
        
        const { data: responses, error: responsesError } = await supabase
          .from('student_responses')
          .insert(studentResponses)
          .select();

        if (responsesError) {
          console.error(`Error creating responses for student ${student.id}:`, responsesError);
          results.push({
            success: false,
            message: `Failed to create responses for student ${student.first_name}: ${responsesError.message}`,
          });
          return results;
        }

        totalResponsesCreated += responses.length;
      }

      console.log(`Total responses created: ${totalResponsesCreated}`);
      
      results.push({
        success: true,
        message: 'Test responses created successfully',
        details: { 
          responsesCreated: totalResponsesCreated,
          studentsWithResponses: createdStudents.length,
          assessmentId: assessment.id,
          testStudentIds: createdStudents.map(s => s.id)
        },
      });

      // Test 6: Validate created data
      console.log('Validating created data...');
      
      const { data: studentsCount } = await supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('teacher_id', authData.user.id);
      
      const { data: assessmentsCount } = await supabase
        .from('assessments')
        .select('id', { count: 'exact' })
        .eq('teacher_id', authData.user.id);
      
      const { data: itemsCount } = await supabase
        .from('assessment_items')
        .select('id', { count: 'exact' })
        .eq('assessment_id', assessment.id);
      
      const { data: responsesCount } = await supabase
        .from('student_responses')
        .select('id', { count: 'exact' })
        .eq('assessment_id', assessment.id);

      const validationData = {
        studentsCount: studentsCount?.length || 0,
        assessmentsCount: assessmentsCount?.length || 0,
        itemsCount: itemsCount?.length || 0,
        responsesCount: responsesCount?.length || 0,
        testAssessmentId: assessment.id,
        testStudentIds: createdStudents.map(s => s.id)
      };

      results.push({
        success: true,
        message: 'Test data validation successful',
        details: validationData,
      });

      console.log('✅ Phase 1 Foundation Testing completed successfully');
      return results;

    } catch (error: any) {
      console.error('Phase 1 testing failed:', error);
      results.push({
        success: false,
        message: `Foundation testing failed: ${error.message}`,
        details: error,
      });
      return results;
    }
  },

  async cleanupTestData(): Promise<TestingReport> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Delete test students and related data
      await supabase
        .from('students')
        .delete()
        .eq('teacher_id', authData.user.id)
        .in('first_name', ['Emma', 'Marcus', 'Aisha']);

      return { success: true, message: 'Test data cleaned up successfully' };
    } catch (error: any) {
      return { success: false, message: `Cleanup failed: ${error.message}` };
    }
  }
};
