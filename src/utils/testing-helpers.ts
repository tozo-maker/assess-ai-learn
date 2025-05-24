
import { supabase } from '@/integrations/supabase/client';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';
import { Student, GradeLevel } from '@/types/student';
import { Assessment, AssessmentFormData, AssessmentItemFormData, StudentResponseFormData } from '@/types/assessment';

export interface TestingReport {
  success: boolean;
  message: string;
  details?: any;
}

export const testingHelpers = {
  // Authentication Testing
  async validateAuthentication(): Promise<TestingReport> {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        return { success: false, message: 'No active session found' };
      }

      const user = session.data.session.user;
      if (!user) {
        return { success: false, message: 'No user in session' };
      }

      return {
        success: true,
        message: 'Authentication validated successfully',
        details: {
          userId: user.id,
          email: user.email,
          lastSignIn: user.last_sign_in_at
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Authentication validation failed',
        details: error
      };
    }
  },

  // Create comprehensive test data
  async createTestStudents(): Promise<TestingReport> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, message: 'User not authenticated' };
      }

      const testStudents = [
        {
          first_name: 'Emma',
          last_name: 'Rodriguez',
          grade_level: '5th' as GradeLevel,
          teacher_id: user.user.id,
          student_id: 'EMR001',
          learning_goals: 'Improve reading comprehension and mathematical problem-solving',
          special_considerations: 'English language learner, benefits from visual aids'
        },
        {
          first_name: 'Marcus',
          last_name: 'Johnson',
          grade_level: '5th' as GradeLevel,
          teacher_id: user.user.id,
          student_id: 'MAJ002',
          learning_goals: 'Strengthen writing skills and science inquiry',
          special_considerations: 'Advanced in mathematics, needs challenging problems'
        },
        {
          first_name: 'Aisha',
          last_name: 'Patel',
          grade_level: '5th' as GradeLevel,
          teacher_id: user.user.id,
          student_id: 'AIP003',
          learning_goals: 'Build confidence in public speaking and collaborative work',
          special_considerations: 'Shy personality, excels in independent work'
        },
        {
          first_name: 'David',
          last_name: 'Kim',
          grade_level: '5th' as GradeLevel,
          teacher_id: user.user.id,
          student_id: 'DAK004',
          learning_goals: 'Improve organizational skills and time management',
          special_considerations: 'ADHD, benefits from frequent breaks and movement'
        },
        {
          first_name: 'Sofia',
          last_name: 'Chen',
          grade_level: '5th' as GradeLevel,
          teacher_id: user.user.id,
          student_id: 'SOC005',
          learning_goals: 'Develop critical thinking and creative expression',
          special_considerations: 'Gifted learner, needs enrichment activities'
        }
      ];

      const createdStudents = [];
      for (const studentData of testStudents) {
        try {
          const student = await studentService.createStudent(studentData);
          createdStudents.push(student);
        } catch (error) {
          console.error(`Failed to create student ${studentData.first_name}:`, error);
        }
      }

      return {
        success: true,
        message: `Successfully created ${createdStudents.length} test students`,
        details: createdStudents
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create test students',
        details: error
      };
    }
  },

  async createTestAssessment(): Promise<TestingReport> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, message: 'User not authenticated' };
      }

      const assessmentData: AssessmentFormData = {
        title: 'Math Problem Solving Assessment',
        description: 'Comprehensive assessment of mathematical reasoning and problem-solving skills',
        subject: 'Mathematics',
        grade_level: '5th',
        assessment_type: 'test',
        standards_covered: ['5.NBT.1', '5.NBT.2', '5.OA.1', '5.OA.2'],
        max_score: 100,
        assessment_date: new Date().toISOString().split('T')[0],
        is_draft: false,
        teacher_id: user.user.id
      };

      const assessment = await assessmentService.createAssessment(assessmentData);

      // Create assessment items
      const assessmentItems: AssessmentItemFormData[] = [
        {
          question_text: 'Solve the multi-step problem: A store has 245 apples. They sell 127 apples in the morning and 89 apples in the afternoon. How many apples are left?',
          item_number: 1,
          knowledge_type: 'procedural',
          difficulty_level: 'medium',
          standard_reference: '5.NBT.1',
          max_score: 20
        },
        {
          question_text: 'Explain your strategy for solving word problems involving multiplication and division.',
          item_number: 2,
          knowledge_type: 'conceptual',
          difficulty_level: 'hard',
          standard_reference: '5.OA.1',
          max_score: 25
        },
        {
          question_text: 'Calculate: 456 × 23 = ?',
          item_number: 3,
          knowledge_type: 'procedural',
          difficulty_level: 'easy',
          standard_reference: '5.NBT.2',
          max_score: 15
        },
        {
          question_text: 'Write an expression for "5 more than 3 times a number" and solve when the number is 8.',
          item_number: 4,
          knowledge_type: 'conceptual',
          difficulty_level: 'hard',
          standard_reference: '5.OA.2',
          max_score: 20
        },
        {
          question_text: 'Round 4,567 to the nearest hundred and explain your reasoning.',
          item_number: 5,
          knowledge_type: 'factual',
          difficulty_level: 'easy',
          standard_reference: '5.NBT.1',
          max_score: 20
        }
      ];

      const createdItems = await assessmentService.createAssessmentItems(assessmentItems, assessment.id);

      return {
        success: true,
        message: 'Successfully created test assessment with items',
        details: { assessment, items: createdItems }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create test assessment',
        details: error
      };
    }
  },

  async createTestResponses(assessmentId: string, studentIds: string[]): Promise<TestingReport> {
    try {
      // Get assessment items
      const items = await assessmentService.getAssessmentItems(assessmentId);
      
      if (items.length === 0) {
        return { success: false, message: 'No assessment items found' };
      }

      const allResponses = [];

      // Create varied responses for each student
      for (let i = 0; i < studentIds.length; i++) {
        const studentId = studentIds[i];
        const studentResponses: StudentResponseFormData[] = [];

        items.forEach((item, itemIndex) => {
          // Create varied performance patterns
          let score: number;
          let errorType: 'conceptual' | 'procedural' | 'factual' | 'none';
          
          // Student performance patterns
          const performancePattern = i % 3; // 0: high, 1: medium, 2: struggling
          
          switch (performancePattern) {
            case 0: // High performer
              score = Math.floor(item.max_score * (0.85 + Math.random() * 0.15));
              errorType = Math.random() > 0.8 ? 'procedural' : 'none';
              break;
            case 1: // Average performer
              score = Math.floor(item.max_score * (0.65 + Math.random() * 0.25));
              errorType = Math.random() > 0.6 ? (Math.random() > 0.5 ? 'procedural' : 'conceptual') : 'none';
              break;
            case 2: // Struggling performer
              score = Math.floor(item.max_score * (0.35 + Math.random() * 0.35));
              errorType = Math.random() > 0.3 ? (Math.random() > 0.5 ? 'conceptual' : 'procedural') : 'factual';
              break;
            default:
              score = Math.floor(item.max_score * 0.7);
              errorType = 'none';
          }

          studentResponses.push({
            student_id: studentId,
            assessment_id: assessmentId,
            assessment_item_id: item.id,
            score: score,
            error_type: errorType,
            teacher_notes: errorType !== 'none' ? `Student showed ${errorType} understanding gap` : 'Good work!'
          });
        });

        const responses = await assessmentService.submitStudentResponses(studentResponses);
        allResponses.push(...responses);
      }

      return {
        success: true,
        message: `Successfully created ${allResponses.length} test responses`,
        details: allResponses
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create test responses',
        details: error
      };
    }
  },

  // Comprehensive test runner
  async runFoundationTests(): Promise<TestingReport[]> {
    const results: TestingReport[] = [];

    console.log('🧪 Starting Phase 1: Foundation Testing...');

    // Test 1: Authentication
    console.log('Testing authentication...');
    const authResult = await this.validateAuthentication();
    results.push(authResult);

    if (!authResult.success) {
      console.error('❌ Authentication failed, stopping tests');
      return results;
    }

    // Test 2: Student Creation
    console.log('Creating test students...');
    const studentsResult = await this.createTestStudents();
    results.push(studentsResult);

    // Test 3: Assessment Creation
    console.log('Creating test assessment...');
    const assessmentResult = await this.createTestAssessment();
    results.push(assessmentResult);

    // Test 4: Student Responses
    if (studentsResult.success && assessmentResult.success) {
      console.log('Creating test responses...');
      const studentIds = studentsResult.details?.map((s: Student) => s.id) || [];
      const assessmentId = assessmentResult.details?.assessment?.id;
      
      if (studentIds.length > 0 && assessmentId) {
        const responsesResult = await this.createTestResponses(assessmentId, studentIds);
        results.push(responsesResult);
      }
    }

    // Test 5: Data Retrieval
    console.log('Testing data retrieval...');
    try {
      const students = await studentService.getStudents();
      const assessments = await assessmentService.getAssessments();
      
      results.push({
        success: true,
        message: 'Data retrieval successful',
        details: {
          studentsCount: students.length,
          assessmentsCount: assessments.length
        }
      });
    } catch (error) {
      results.push({
        success: false,
        message: 'Data retrieval failed',
        details: error
      });
    }

    return results;
  }
};
