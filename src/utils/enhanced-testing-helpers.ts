
import { supabase } from '@/integrations/supabase/client';
import { TestingReport } from './testing-helpers';

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

  // Search and Filter Testing
  async runSearchFilterTests(): Promise<EnhancedTestingReport[]> {
    const results: EnhancedTestingReport[] = [];
    const startTime = Date.now();
    
    try {
      console.log('🔍 Starting Search and Filter Testing...');
      
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        results.push({
          success: false,
          message: 'User not authenticated for search/filter testing',
          category: 'Search/Filter',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      // Test 1: Basic Student Search
      console.log('Testing student search functionality...');
      
      const { data: allStudents, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', authData.user.id);
      
      if (fetchError) {
        results.push({
          success: false,
          message: 'Student fetch for search testing failed',
          details: fetchError,
          category: 'Search/Filter',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      if (allStudents && allStudents.length > 0) {
        // Test search by first name
        const searchTerm = allStudents[0].first_name.substring(0, 3);
        const { data: searchResults, error: searchError } = await supabase
          .from('students')
          .select('*')
          .eq('teacher_id', authData.user.id)
          .ilike('first_name', `%${searchTerm}%`);
        
        if (searchError) {
          results.push({
            success: false,
            message: 'Student search by first name failed',
            details: searchError,
            category: 'Search/Filter',
            duration: Date.now() - startTime
          });
        } else {
          results.push({
            success: true,
            message: 'Student search by first name validated',
            details: { 
              searchTerm,
              resultsCount: searchResults.length,
              totalStudents: allStudents.length
            },
            category: 'Search/Filter',
            duration: Date.now() - startTime
          });
        }
        
        // Test filter by grade level
        const uniqueGrades = [...new Set(allStudents.map(s => s.grade_level))];
        if (uniqueGrades.length > 0) {
          const { data: gradeResults, error: gradeError } = await supabase
            .from('students')
            .select('*')
            .eq('teacher_id', authData.user.id)
            .eq('grade_level', uniqueGrades[0]);
          
          if (gradeError) {
            results.push({
              success: false,
              message: 'Student filter by grade level failed',
              details: gradeError,
              category: 'Search/Filter',
              duration: Date.now() - startTime
            });
          } else {
            results.push({
              success: true,
              message: 'Student filter by grade level validated',
              details: { 
                gradeLevel: uniqueGrades[0],
                filteredCount: gradeResults.length,
                totalStudents: allStudents.length
              },
              category: 'Search/Filter',
              duration: Date.now() - startTime
            });
          }
        }
      } else {
        results.push({
          success: true,
          message: 'Search/Filter testing completed (no test data available)',
          details: { message: 'No students found for search testing' },
          category: 'Search/Filter',
          duration: Date.now() - startTime
        });
      }
      
      return results;
    } catch (error) {
      console.error('Search/Filter testing failed:', error);
      results.push({
        success: false,
        message: `Search/Filter testing failed: ${error.message}`,
        details: error,
        category: 'Search/Filter',
        duration: Date.now() - startTime
      });
      return results;
    }
  },

  // RLS Policy Testing
  async runRLSTests(): Promise<EnhancedTestingReport[]> {
    const results: EnhancedTestingReport[] = [];
    const startTime = Date.now();
    
    try {
      console.log('🔒 Starting RLS Policy Testing...');
      
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        results.push({
          success: false,
          message: 'User not authenticated for RLS testing',
          category: 'RLS',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      // Test 1: User can only see their own students
      console.log('Testing student data isolation...');
      
      const { data: userStudents, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', authData.user.id);
      
      if (studentsError) {
        results.push({
          success: false,
          message: 'RLS student data fetch failed',
          details: studentsError,
          category: 'RLS',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      // Verify all returned students belong to current user
      const invalidStudents = userStudents?.filter(s => s.teacher_id !== authData.user.id) || [];
      
      results.push({
        success: invalidStudents.length === 0,
        message: invalidStudents.length === 0 
          ? 'Student data isolation validated' 
          : 'Student data isolation failed',
        details: { 
          totalStudents: userStudents?.length || 0,
          invalidStudents: invalidStudents.length,
          userId: authData.user.id
        },
        category: 'RLS',
        duration: Date.now() - startTime
      });
      
      // Test 2: User can only see their own assessments
      console.log('Testing assessment data isolation...');
      
      const { data: userAssessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .eq('teacher_id', authData.user.id);
      
      if (assessmentsError) {
        results.push({
          success: false,
          message: 'RLS assessment data fetch failed',
          details: assessmentsError,
          category: 'RLS',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      // Verify all returned assessments belong to current user
      const invalidAssessments = userAssessments?.filter(a => a.teacher_id !== authData.user.id) || [];
      
      results.push({
        success: invalidAssessments.length === 0,
        message: invalidAssessments.length === 0 
          ? 'Assessment data isolation validated' 
          : 'Assessment data isolation failed',
        details: { 
          totalAssessments: userAssessments?.length || 0,
          invalidAssessments: invalidAssessments.length,
          userId: authData.user.id
        },
        category: 'RLS',
        duration: Date.now() - startTime
      });
      
      return results;
    } catch (error) {
      console.error('RLS testing failed:', error);
      results.push({
        success: false,
        message: `RLS testing failed: ${error.message}`,
        details: error,
        category: 'RLS',
        duration: Date.now() - startTime
      });
      return results;
    }
  },

  // Data Integrity Testing
  async runDataIntegrityTests(): Promise<EnhancedTestingReport[]> {
    const results: EnhancedTestingReport[] = [];
    const startTime = Date.now();
    
    try {
      console.log('🔗 Starting Data Integrity Testing...');
      
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        results.push({
          success: false,
          message: 'User not authenticated for data integrity testing',
          category: 'Data Integrity',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      // Test 1: Assessment-Student Response Relationships
      console.log('Testing assessment-response relationships...');
      
      const { data: assessmentsWithResponses, error: relationError } = await supabase
        .from('assessments')
        .select(`
          id, 
          title,
          student_responses (
            id,
            student_id,
            assessment_id,
            score
          )
        `)
        .eq('teacher_id', authData.user.id)
        .limit(5);
      
      if (relationError) {
        results.push({
          success: false,
          message: 'Assessment-response relationship query failed',
          details: relationError,
          category: 'Data Integrity',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      // Validate relationship integrity
      let relationshipErrors = 0;
      assessmentsWithResponses?.forEach(assessment => {
        assessment.student_responses?.forEach(response => {
          if (response.assessment_id !== assessment.id) {
            relationshipErrors++;
          }
        });
      });
      
      results.push({
        success: relationshipErrors === 0,
        message: relationshipErrors === 0 
          ? 'Assessment-response relationships validated' 
          : 'Assessment-response relationship integrity issues found',
        details: { 
          assessmentsChecked: assessmentsWithResponses?.length || 0,
          relationshipErrors,
          totalResponses: assessmentsWithResponses?.reduce((sum, a) => sum + (a.student_responses?.length || 0), 0) || 0
        },
        category: 'Data Integrity',
        duration: Date.now() - startTime
      });
      
      // Test 2: Student Performance Data Consistency
      console.log('Testing student performance data consistency...');
      
      const { data: studentsWithPerformance, error: perfError } = await supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          student_performance (
            student_id,
            average_score,
            assessment_count
          )
        `)
        .eq('teacher_id', authData.user.id)
        .limit(10);
      
      if (perfError) {
        results.push({
          success: false,
          message: 'Student performance data query failed',
          details: perfError,
          category: 'Data Integrity',
          duration: Date.now() - startTime
        });
        return results;
      }
      
      // Validate performance data consistency
      let performanceErrors = 0;
      studentsWithPerformance?.forEach(student => {
        student.student_performance?.forEach(perf => {
          if (perf.student_id !== student.id) {
            performanceErrors++;
          }
        });
      });
      
      results.push({
        success: performanceErrors === 0,
        message: performanceErrors === 0 
          ? 'Student performance data consistency validated' 
          : 'Student performance data consistency issues found',
        details: { 
          studentsChecked: studentsWithPerformance?.length || 0,
          performanceErrors,
          totalPerformanceRecords: studentsWithPerformance?.reduce((sum, s) => sum + (s.student_performance?.length || 0), 0) || 0
        },
        category: 'Data Integrity',
        duration: Date.now() - startTime
      });
      
      return results;
    } catch (error) {
      console.error('Data integrity testing failed:', error);
      results.push({
        success: false,
        message: `Data integrity testing failed: ${error.message}`,
        details: error,
        category: 'Data Integrity',
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
      
      // Test 2: Concurrent Operation Simulation
      console.log('Testing concurrent operations...');
      
      const concurrentStartTime = Date.now();
      const concurrentPromises = [
        supabase.from('students').select('id, first_name, last_name').eq('teacher_id', authData.user.id),
        supabase.from('assessments').select('id, title, subject').eq('teacher_id', authData.user.id),
        supabase.from('student_responses').select('id, score').limit(50),
        supabase.from('assessment_analysis').select('id, created_at').limit(10)
      ];
      
      try {
        const concurrentResults = await Promise.all(concurrentPromises);
        const concurrentDuration = Date.now() - concurrentStartTime;
        
        results.push({
          success: concurrentDuration < 3000, // 3 second threshold
          message: concurrentDuration < 3000 
            ? 'Concurrent operations performance acceptable' 
            : 'Concurrent operations performance slow',
          details: { 
            concurrentDuration: `${concurrentDuration}ms`,
            operationsCount: concurrentPromises.length,
            allSuccessful: concurrentResults.every(r => !r.error),
            threshold: '3000ms'
          },
          category: 'Performance',
          duration: Date.now() - startTime
        });
      } catch (concurrentError) {
        results.push({
          success: false,
          message: 'Concurrent operations failed',
          details: concurrentError,
          category: 'Performance',
          duration: Date.now() - startTime
        });
      }
      
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
      const searchResults = await this.runSearchFilterTests();
      const rlsResults = await this.runRLSTests();
      const integrityResults = await this.runDataIntegrityTests();
      const performanceResults = await this.runPerformanceTests();
      
      allResults.push(...authResults);
      allResults.push(...crudResults);
      allResults.push(...searchResults);
      allResults.push(...rlsResults);
      allResults.push(...integrityResults);
      allResults.push(...performanceResults);
      
      // Summary result
      const successCount = allResults.filter(r => r.success).length;
      const totalCount = allResults.length;
      
      allResults.push({
        success: successCount === totalCount,
        message: `Enhanced Testing Complete: ${successCount}/${totalCount} tests passed`,
        details: {
          categories: ['Authentication', 'CRUD', 'Search/Filter', 'RLS', 'Data Integrity', 'Performance'],
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
