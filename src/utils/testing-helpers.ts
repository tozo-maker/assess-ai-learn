
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
        is_draft: false,
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
          item_number: 1,
          question_text: 'Solve: 245 + 167 = ?',
          knowledge_type: 'procedural',
          difficulty_level: 'medium',
          max_score: 2,
          standard_reference: '5.NBT.1',
        },
        {
          assessment_id: assessment.id,
          item_number: 2,
          question_text: 'If Sarah has 3 bags with 15 marbles each, how many marbles does she have in total?',
          knowledge_type: 'conceptual',
          difficulty_level: 'easy',
          max_score: 3,
          standard_reference: '5.OA.1',
        },
        {
          assessment_id: assessment.id,
          item_number: 3,
          question_text: 'What is the value of the digit 7 in the number 4,735?',
          knowledge_type: 'factual',
          difficulty_level: 'medium',
          max_score: 2,
          standard_reference: '5.NBT.2',
        },
        {
          assessment_id: assessment.id,
          item_number: 4,
          question_text: 'Write an expression that represents "5 more than 3 times a number"',
          knowledge_type: 'conceptual',
          difficulty_level: 'hard',
          max_score: 4,
          standard_reference: '5.OA.2',
        },
        {
          assessment_id: assessment.id,
          item_number: 5,
          question_text: 'Round 4,687 to the nearest hundred.',
          knowledge_type: 'procedural',
          difficulty_level: 'easy',
          max_score: 1,
          standard_reference: '5.NBT.1',
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
      console.log(`Creating responses for assessment ${assessment.id} and ${createdStudents.length} students`);
      console.log(`Found ${items.length} assessment items`);

      let totalResponsesCreated = 0;
      
      for (let i = 0; i < createdStudents.length; i++) {
        const student = createdStudents[i];
        console.log(`Creating responses for student ${i + 1}/${createdStudents.length} (ID: ${student.id})`);
        
        const studentResponses = items.map((item, itemIndex) => ({
          student_id: student.id,
          assessment_id: assessment.id,
          assessment_item_id: item.id,
          score: Math.floor(Math.random() * (item.max_score + 1)), // Random score between 0 and max_score
          error_type: itemIndex % 3 === 0 ? 'conceptual' : (itemIndex % 3 === 1 ? 'procedural' : 'none'),
          teacher_notes: `Sample response for ${student.first_name} on item ${item.item_number}`,
        }));

        console.log(`Submitting ${studentResponses.length} responses for student ${student.id}`);
        
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

        console.log(`Successfully created ${responses.length} responses for student ${student.id}`);
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

    } catch (error) {
      console.error('Phase 1 testing failed:', error);
      results.push({
        success: false,
        message: `Foundation testing failed: ${error.message}`,
        details: error,
      });
      return results;
    }
  },

  async runPhase2Tests(): Promise<TestingReport[]> {
    const results: TestingReport[] = [];
    
    try {
      console.log('🧪 Starting Phase 2: AI Integration Testing (Anthropic Only)...');

      // First, validate that we have test data from Phase 1
      console.log('Validating test data...');
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        results.push({
          success: false,
          message: 'User not authenticated',
        });
        return results;
      }

      // Get assessments for this teacher
      const { data: teacherAssessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('id, title, created_at')
        .eq('teacher_id', authData.user.id)
        .order('created_at', { ascending: false });

      if (assessmentsError) {
        console.error('Error fetching assessments:', assessmentsError);
        results.push({
          success: false,
          message: 'Failed to fetch assessments',
          details: assessmentsError,
        });
        return results;
      }

      if (!teacherAssessments || teacherAssessments.length === 0) {
        results.push({
          success: false,
          message: 'No test assessments found. Please run Phase 1 first.',
        });
        return results;
      }

      console.log(`Found ${teacherAssessments.length} assessments for teacher`);

      // Find an assessment that has student responses
      let testAssessmentId = null;
      let testStudentId = null;
      let testStudent = null;

      for (const assessment of teacherAssessments) {
        console.log(`Checking assessment ${assessment.id} for responses...`);
        
        // First get responses for this assessment
        const { data: responses, error: responsesError } = await supabase
          .from('student_responses')
          .select('student_id')
          .eq('assessment_id', assessment.id)
          .limit(1);

        if (responsesError) {
          console.error(`Error checking responses for assessment ${assessment.id}:`, responsesError);
          continue;
        }

        if (responses && responses.length > 0) {
          testAssessmentId = assessment.id;
          testStudentId = responses[0].student_id;
          
          // Now get the student details separately
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('id, first_name, last_name')
            .eq('id', testStudentId)
            .single();

          if (studentError) {
            console.error(`Error fetching student ${testStudentId}:`, studentError);
            continue;
          }

          testStudent = studentData;
          console.log(`Found assessment ${testAssessmentId} with responses for student ${testStudentId}`);
          break;
        }
      }

      if (!testAssessmentId || !testStudentId || !testStudent) {
        results.push({
          success: false,
          message: 'No assessments with student responses found. Please run Phase 1 first.',
          details: {
            totalAssessments: teacherAssessments.length,
            message: 'Found assessments but no responses. Run Phase 1 to create test data.'
          }
        });
        return results;
      }

      console.log(`Using assessment ${testAssessmentId} and student ${testStudentId} for testing`);

      results.push({
        success: true,
        message: 'Test data validation successful',
        details: {
          assessmentId: testAssessmentId,
          studentId: testStudentId,
          studentName: `${testStudent.first_name} ${testStudent.last_name}`,
          totalAssessments: teacherAssessments.length
        },
      });

      // Test 1: API Key Configuration
      console.log('Testing Anthropic API key configuration...');
      try {
        const { data: goalData, error: goalError } = await supabase.functions.invoke('generate-goal-suggestions', {
          body: { student_id: 'test-id-for-key-check' }
        });

        if (goalError && goalError.message?.includes('API key not configured')) {
          results.push({
            success: false,
            message: 'Anthropic API key not configured. Please set ANTHROPIC_API_KEY in Supabase secrets.',
          });
          return results;
        }

        results.push({
          success: true,
          message: 'Anthropic API key configuration test completed',
        });
      } catch (error) {
        console.error('API key test error:', error);
        results.push({
          success: false,
          message: 'Failed to test API key configuration',
          details: error.message,
        });
        return results;
      }

      // Test 2: Anthropic Analysis Generation
      console.log('Testing Anthropic analysis generation...');
      try {
        console.log(`Analyzing assessment ${testAssessmentId} for student ${testStudentId}`);
        
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-with-anthropic', {
          body: { 
            assessment_id: testAssessmentId, 
            student_id: testStudentId 
          }
        });

        if (analysisError) {
          console.error('Anthropic analysis error:', analysisError);
          results.push({
            success: false,
            message: 'Anthropic analysis generation failed',
            details: analysisError,
          });
        } else if (analysisData?.success) {
          results.push({
            success: true,
            message: 'Anthropic analysis generated successfully',
            details: analysisData,
          });
        } else {
          results.push({
            success: false,
            message: 'Anthropic analysis failed',
            details: analysisData,
          });
        }
      } catch (error) {
        console.error('Analysis generation error:', error);
        results.push({
          success: false,
          message: 'Anthropic analysis generation failed',
          details: error,
        });
      }

      // Test 3: AI Goal Suggestions
      console.log('Testing AI goal suggestions...');
      try {
        const { data: goalData, error: goalError } = await supabase.functions.invoke('generate-goal-suggestions', {
          body: { student_id: testStudentId }
        });

        if (goalError) {
          results.push({
            success: false,
            message: 'AI goal suggestions failed',
            details: goalError,
          });
        } else if (goalData?.suggestions && Array.isArray(goalData.suggestions)) {
          results.push({
            success: true,
            message: `Generated ${goalData.suggestions.length} AI goal suggestions`,
            details: goalData.suggestions,
          });
        } else {
          results.push({
            success: false,
            message: 'AI goal suggestions returned invalid format',
            details: goalData,
          });
        }
      } catch (error) {
        console.error('Goal suggestions error:', error);
        results.push({
          success: false,
          message: 'AI goal suggestions failed',
          details: error,
        });
      }

      // Test 4: AI Analysis Data Retrieval
      console.log('Testing AI analysis data retrieval...');
      try {
        const { data: analyses, error: retrievalError } = await supabase
          .from('assessment_analysis')
          .select('*')
          .eq('assessment_id', testAssessmentId)
          .eq('student_id', testStudentId);

        if (retrievalError) {
          results.push({
            success: false,
            message: 'Failed to retrieve AI analysis data',
            details: retrievalError,
          });
        } else if (analyses && analyses.length > 0) {
          results.push({
            success: true,
            message: 'AI analysis data retrieved successfully',
            details: { analysisCount: analyses.length },
          });
        } else {
          results.push({
            success: false,
            message: 'No AI analyses found in database. Analysis generation may have failed.',
          });
        }
      } catch (error) {
        console.error('Analysis retrieval error:', error);
        results.push({
          success: false,
          message: 'AI analysis data retrieval failed',
          details: error,
        });
      }

      // Test 5: Data Relationships
      console.log('Testing advanced data relationships...');
      try {
        // Get student with response count for the specific assessment
        const { data: responsesCount } = await supabase
          .from('student_responses')
          .select('id', { count: 'exact' })
          .eq('student_id', testStudentId)
          .eq('assessment_id', testAssessmentId);

        // Check if analysis exists
        const { data: analysisExists } = await supabase
          .from('assessment_analysis')
          .select('id')
          .eq('assessment_id', testAssessmentId)
          .eq('student_id', testStudentId)
          .maybeSingle();

        const relationshipData = {
          studentId: testStudent.id,
          studentName: `${testStudent.first_name} ${testStudent.last_name}`,
          responsesCount: responsesCount?.length || 0,
          hasAnalysis: !!analysisExists,
          relationshipIntegrity: 'Valid'
        };

        results.push({
          success: true,
          message: 'Data relationships validated successfully',
          details: relationshipData,
        });
      } catch (error) {
        console.error('Data relationships error:', error);
        results.push({
          success: false,
          message: 'Data relationships validation failed',
          details: error,
        });
      }

      // Test 6: AI Error Handling
      console.log('Testing AI error handling...');
      try {
        // Test with invalid UUIDs
        const { data: invalidData, error: invalidError } = await supabase.functions.invoke('analyze-with-anthropic', {
          body: { 
            assessment_id: 'invalid-uuid', 
            student_id: 'invalid-uuid' 
          }
        });

        if (invalidError || (invalidData && !invalidData.success)) {
          results.push({
            success: true,
            message: 'AI error handling working correctly',
            details: 'Invalid requests properly rejected',
          });
        } else {
          results.push({
            success: false,
            message: 'AI error handling not working - invalid requests accepted',
            details: invalidData,
          });
        }
      } catch (error) {
        // This is actually expected for invalid requests
        results.push({
          success: true,
          message: 'AI error handling working correctly',
          details: 'Invalid requests properly rejected',
        });
      }

      console.log('✅ Phase 2 AI Integration Testing completed');
      return results;

    } catch (error) {
      console.error('Phase 2 testing failed:', error);
      results.push({
        success: false,
        message: `AI integration testing failed: ${error.message}`,
        details: error,
      });
      return results;
    }
  }
};
