
import { supabase } from '@/integrations/supabase/client';
import { performanceCalculator } from './performance-calculator';

// Import the base TestingReport interface
interface TestingReport {
  success: boolean;
  message: string;
  details?: any;
}

export interface EnhancedTestingReport extends TestingReport {
  category?: string;
  duration?: number;
}

export const enhancedTestingHelpers = {
  // Authentication Flow Testing
  async runAuthenticationTests(): Promise<EnhancedTestingReport[]> {
    const results: EnhancedTestingReport[] = [];
    const startTime = Date.now();
    
    try {
      console.log('🔐 Starting Authentication Flow Testing...');
      
      // Test 1: Session Persistence
      console.log('Testing session persistence...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        results.push({
          success: false,
          message: 'Session retrieval failed',
          details: sessionError,
          category: 'Authentication',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      results.push({
        success: true,
        message: 'Session persistence validated',
        details: { sessionExists: !!sessionData.session },
        category: 'Authentication',
        duration: Date.now() - startTime
      });
      
      // Test 2: User Profile Access
      console.log('Testing user profile access...');
      const { data: user } = await supabase.auth.getUser();
      
      if (user.user) {
        results.push({
          success: true,
          message: 'User profile access validated',
          details: { userId: user.user.id, email: user.user.email },
          category: 'Authentication',
          duration: Date.now() - startTime
        });
      } else {
        results.push({
          success: false,
          message: 'User profile access failed',
          category: 'Authentication',
          duration: Date.now() - startTime
        });
      }
      
      return results;
    } catch (error) {
      console.error('Authentication testing failed:', error);
      results.push({
        success: false,
        message: `Authentication testing failed: ${error.message}`,
        details: error,
        category: 'Authentication',
        duration: Date.now() - startTime
      });
      return results;
    }
  },

  // CRUD Operations Testing
  async runCRUDTests(): Promise<EnhancedTestingReport[]> {
    const results: EnhancedTestingReport[] = [];
    const startTime = Date.now();
    
    try {
      console.log('📝 Starting CRUD Operations Testing...');
      
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        results.push({
          success: false,
          message: 'User not authenticated for CRUD testing',
          category: 'CRUD',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      // Test 1: Student Creation and Update
      console.log('Testing student CRUD operations...');
      
      // Create a test student
      const testStudent = {
        first_name: 'CRUD',
        last_name: 'TestStudent',
        grade_level: '3rd',
        teacher_id: authData.user.id,
        student_id: 'CRUD-001'
      };
      
      const { data: createdStudent, error: createError } = await supabase
        .from('students')
        .insert(testStudent)
        .select()
        .single();
      
      if (createError) {
        results.push({
          success: false,
          message: 'Student creation failed',
          details: createError,
          category: 'CRUD',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      results.push({
        success: true,
        message: 'Student creation validated',
        details: { studentId: createdStudent.id },
        category: 'CRUD',
        duration: Date.now() - startTime
      });
      
      // Test 2: Student Update
      const updateData = {
        first_name: 'UpdatedCRUD',
        learning_goals: 'Test learning goals for CRUD validation'
      };
      
      const { data: updatedStudent, error: updateError } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', createdStudent.id)
        .select()
        .single();
      
      if (updateError) {
        results.push({
          success: false,
          message: 'Student update failed',
          details: updateError,
          category: 'CRUD',
          duration: Date.now() - startTime
        });
      } else {
        results.push({
          success: true,
          message: 'Student update validated',
          details: { 
            originalName: testStudent.first_name,
            updatedName: updatedStudent.first_name
          },
          category: 'CRUD',
          duration: Date.now() - startTime
        });
      }
      
      // Test 3: Student Deletion
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', createdStudent.id);
      
      if (deleteError) {
        results.push({
          success: false,
          message: 'Student deletion failed',
          details: deleteError,
          category: 'CRUD',
          duration: Date.now() - startTime
        });
      } else {
        results.push({
          success: true,
          message: 'Student deletion validated',
          details: { deletedStudentId: createdStudent.id },
          category: 'CRUD',
          duration: Date.now() - startTime
        });
      }
      
      return results;
    } catch (error) {
      console.error('CRUD testing failed:', error);
      results.push({
        success: false,
        message: `CRUD testing failed: ${error.message}`,
        details: error,
        category: 'CRUD',
        duration: Date.now() - startTime
      });
      return results;
    }
  },

  // Performance Testing
  async runPerformanceTests(): Promise<EnhancedTestingReport[]> {
    const results: EnhancedTestingReport[] = [];
    const startTime = Date.now();
    
    try {
      console.log('⚡ Starting Performance Testing...');
      
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        results.push({
          success: false,
          message: 'User not authenticated for performance testing',
          category: 'Performance',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      // Test 1: Large Dataset Query Performance
      console.log('Testing large dataset query performance...');
      
      const queryStartTime = Date.now();
      const { data: allData, error: queryError } = await supabase
        .from('students')
        .select(`
          *,
          student_responses (
            id,
            score,
            assessment_id
          ),
          student_performance (
            average_score,
            assessment_count
          )
        `)
        .eq('teacher_id', authData.user.id);
      
      const queryDuration = Date.now() - queryStartTime;
      
      if (queryError) {
        results.push({
          success: false,
          message: 'Large dataset query failed',
          details: queryError,
          category: 'Performance',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      results.push({
        success: queryDuration < 5000, // 5 second threshold
        message: queryDuration < 5000 
          ? 'Large dataset query performance acceptable' 
          : 'Large dataset query performance slow',
        details: { 
          queryDuration: `${queryDuration}ms`,
          recordsReturned: allData?.length || 0,
          threshold: '5000ms'
        },
        category: 'Performance',
        duration: Date.now() - startTime
      });
      
      return results;
    } catch (error) {
      console.error('Performance testing failed:', error);
      results.push({
        success: false,
        message: `Performance testing failed: ${error.message}`,
        details: error,
        category: 'Performance',
        duration: Date.now() - startTime
      });
      return results;
    }
  },

  // Run all enhanced tests
  async runAllEnhancedTests(): Promise<EnhancedTestingReport[]> {
    console.log('🚀 Starting Comprehensive Enhanced Testing Suite...');
    
    const allResults: EnhancedTestingReport[] = [];
    
    try {
      // Run all test categories
      const authResults = await this.runAuthenticationTests();
      const crudResults = await this.runCRUDTests();
      const performanceResults = await this.runPerformanceTests();
      
      allResults.push(...authResults);
      allResults.push(...crudResults);
      allResults.push(...performanceResults);
      
      // Summary result
      const successCount = allResults.filter(r => r.success).length;
      const totalCount = allResults.length;
      
      allResults.push({
        success: successCount === totalCount,
        message: `Enhanced Testing Complete: ${successCount}/${totalCount} tests passed`,
        details: {
          categories: ['Authentication', 'CRUD', 'Performance'],
          totalTests: totalCount,
          passedTests: successCount,
          failedTests: totalCount - successCount
        },
        category: 'Summary',
        duration: 0
      });
      
      console.log('✅ Enhanced Testing Suite completed');
      return allResults;
      
    } catch (error) {
      console.error('Enhanced testing suite failed:', error);
      allResults.push({
        success: false,
        message: `Enhanced testing suite failed: ${error.message}`,
        details: error,
        category: 'Summary',
        duration: 0
      });
      return allResults;
    }
  }
};
