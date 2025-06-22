
import { supabase } from '@/integrations/supabase/client';
import { assessmentService } from '@/services/assessment-service';
import { studentResponseService } from '@/services/student-response-service';
import { assessmentAnalysisService } from '@/services/assessment-analysis-service';

export interface FlowTestResult {
  step: string;
  success: boolean;
  error?: string;
  data?: any;
}

export const testAssessmentFlow = async (
  teacherId: string,
  studentId: string
): Promise<FlowTestResult[]> => {
  const results: FlowTestResult[] = [];
  
  try {
    // Step 1: Create Assessment
    console.log('Testing Step 1: Assessment Creation');
    const assessment = await assessmentService.createAssessment({
      title: 'Test Assessment Flow',
      description: 'Testing the complete assessment flow',
      subject: 'Math',
      grade_level: '3rd',
      assessment_type: 'quiz',
      max_score: 100,
      teacher_id: teacherId,
    });
    
    results.push({
      step: 'Assessment Creation',
      success: true,
      data: { assessmentId: assessment.id }
    });
    
    // Step 2: Create Assessment Items
    console.log('Testing Step 2: Assessment Items Creation');
    await assessmentService.createAssessmentItems([
      {
        assessment_id: assessment.id,
        item_number: 1,
        question_text: 'What is 2 + 2?',
        knowledge_type: 'procedural',
        difficulty_level: 'easy',
        max_score: 50,
      },
      {
        assessment_id: assessment.id,
        item_number: 2,
        question_text: 'Explain your reasoning',
        knowledge_type: 'conceptual',
        difficulty_level: 'medium',
        max_score: 50,
      }
    ], assessment.id);
    
    results.push({
      step: 'Assessment Items Creation',
      success: true
    });
    
    // Step 3: Create Student Responses
    console.log('Testing Step 3: Student Response Creation');
    const responses = await studentResponseService.createStudentResponses([
      {
        student_id: studentId,
        assessment_id: assessment.id,
        assessment_item_id: '', // Would be filled with actual item IDs
        score: 45,
        error_type: undefined,
        teacher_notes: 'Good work on calculation'
      },
      {
        student_id: studentId,
        assessment_id: assessment.id,
        assessment_item_id: '', // Would be filled with actual item IDs
        score: 35,
        error_type: 'conceptual',
        teacher_notes: 'Needs work on explanation'
      }
    ]);
    
    results.push({
      step: 'Student Response Creation',
      success: true,
      data: { responseCount: responses.length }
    });
    
    // Step 4: Generate AI Analysis
    console.log('Testing Step 4: AI Analysis Generation');
    try {
      await studentResponseService.submitAssessmentForAnalysis(assessment.id, studentId);
      
      results.push({
        step: 'AI Analysis Generation',
        success: true
      });
    } catch (error) {
      results.push({
        step: 'AI Analysis Generation',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Step 5: Fetch Analysis Results
    console.log('Testing Step 5: Analysis Results Retrieval');
    try {
      const analysis = await assessmentAnalysisService.getAnalysis(assessment.id, studentId);
      
      results.push({
        step: 'Analysis Results Retrieval',
        success: !!analysis,
        data: analysis ? { hasStrengths: analysis.strengths.length > 0 } : undefined
      });
    } catch (error) {
      results.push({
        step: 'Analysis Results Retrieval',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Cleanup - Delete test assessment
    await supabase.from('assessments').delete().eq('id', assessment.id);
    
  } catch (error) {
    results.push({
      step: 'Flow Test Error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return results;
};

export const logFlowTestResults = (results: FlowTestResult[]) => {
  console.log('=== Assessment Flow Test Results ===');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.step}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (result.data) {
      console.log(`   Data:`, result.data);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n✅ ${successCount}/${results.length} steps completed successfully`);
};
