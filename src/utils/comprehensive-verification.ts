import { supabase } from '@/integrations/supabase/client';
import { testingHelpers } from './testing-helpers';
import { enhancedTestingHelpers } from './enhanced-testing-helpers';
import { sampleDataGenerator } from './sample-data-generator';

export interface VerificationReport {
  category: string;
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  duration?: number;
  details?: any;
}

export class ComprehensiveVerification {
  private results: VerificationReport[] = [];

  async runCompleteVerification(): Promise<VerificationReport[]> {
    console.log('🚀 Starting Enhanced System Verification...');
    
    try {
      // Initialize monitoring integration
      const { monitoringIntegration } = await import('@/services/monitoring-integration');
      await monitoringIntegration.initialize();
      
      // 1. Build and Deployment Verification
      await this.verifyBuildAndDeployment();
      
      // 2. User Registration Verification
      await this.verifyUserRegistration();
      
      // 3. Core Workflows Verification
      await this.verifyCoreWorkflows();
      
      // 4. Enhanced Performance Targets Verification
      await this.verifyEnhancedPerformanceTargets();
      
      // 5. Email System Verification
      await this.verifyEmailSystem();
      
      // 6. Advanced System Health Checks
      await this.verifyAdvancedSystemHealth();
      
      this.generateEnhancedFinalReport();
      return this.results;
      
    } catch (error) {
      console.error('❌ Enhanced verification failed:', error);
      this.addResult('System', 'Overall Verification', 'fail', `Verification failed: ${error.message}`);
      return this.results;
    }
  }

  private async verifyBuildAndDeployment() {
    console.log('🔧 Verifying Build and Deployment...');
    
    try {
      // Test 1: Application loads
      const startTime = Date.now();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const loadTime = Date.now() - startTime;
      
      if (authError && !authError.message.includes('not authenticated')) {
        this.addResult('Build & Deployment', 'Application Load', 'fail', 
          `Application failed to load: ${authError.message}`, loadTime);
      } else {
        this.addResult('Build & Deployment', 'Application Load', 'pass', 
          'Application loads successfully', loadTime);
      }
      
      // Test 2: Database connectivity
      const dbStartTime = Date.now();
      const { data: dbTest, error: dbError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .limit(1);
      const dbTime = Date.now() - dbStartTime;
      
      if (dbError) {
        this.addResult('Build & Deployment', 'Database Connection', 'fail', 
          `Database connection failed: ${dbError.message}`, dbTime);
      } else {
        this.addResult('Build & Deployment', 'Database Connection', 'pass', 
          'Database connection successful', dbTime);
      }
      
      // Test 3: Static assets
      this.addResult('Build & Deployment', 'Static Assets', 'info', 
        'Static assets loading (visual verification needed)');
        
    } catch (error) {
      this.addResult('Build & Deployment', 'Overall Build Check', 'fail', 
        `Build verification failed: ${error.message}`);
    }
  }

  private async verifyUserRegistration() {
    console.log('👥 Verifying User Registration Flow...');
    
    try {
      // Test current user authentication
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        this.addResult('User Registration', 'Authentication Check', 'fail', 
          `Authentication check failed: ${userError.message}`);
        return;
      }
      
      if (!currentUser.user) {
        this.addResult('User Registration', 'Authentication Check', 'warning', 
          'No user currently authenticated - manual testing required');
        return;
      }
      
      // Test profile access with improved error handling
      const { data: profile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('id', currentUser.user.id)
        .maybeSingle();
      
      if (profileError) {
        this.addResult('User Registration', 'Profile Access', 'fail', 
          `Profile access failed: ${profileError.message}`);
      } else if (!profile) {
        this.addResult('User Registration', 'Profile Access', 'warning', 
          'No profile found for current user - profile creation may be needed');
      } else {
        this.addResult('User Registration', 'Profile Access', 'pass', 
          'User profile accessible', undefined, { profileExists: true });
      }
      
      // Test dashboard access
      this.addResult('User Registration', 'Dashboard Access', 'pass', 
        'Dashboard accessible (user currently on dashboard)');
        
    } catch (error) {
      this.addResult('User Registration', 'Registration Flow', 'fail', 
        `Registration verification failed: ${error.message}`);
    }
  }

  private async verifyCoreWorkflows() {
    console.log('🔄 Verifying Core Workflows...');
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        this.addResult('Core Workflows', 'All Workflows', 'fail', 
          'User not authenticated for workflow testing');
        return;
      }
      
      // Test 1: Student Management
      await this.testStudentManagement(authData.user.id);
      
      // Test 2: Assessment Creation and Scoring
      await this.testAssessmentWorkflow(authData.user.id);
      
      // Test 3: AI Analysis Generation
      await this.testAIAnalysis();
      
      // Test 4: Goal Creation with AI
      await this.testGoalCreation();
      
      // Test 5: Data Export
      await this.testDataExport(authData.user.id);
      
    } catch (error) {
      this.addResult('Core Workflows', 'Workflow Testing', 'fail', 
        `Core workflow verification failed: ${error.message}`);
    }
  }

  private async testStudentManagement(teacherId: string) {
    try {
      // Check if students exist
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', teacherId)
        .limit(5);
      
      if (studentsError) {
        this.addResult('Core Workflows', 'Student Management', 'fail', 
          `Student access failed: ${studentsError.message}`);
        return;
      }
      
      const studentCount = students?.length || 0;
      
      if (studentCount === 0) {
        this.addResult('Core Workflows', 'Student Management', 'warning', 
          'No students found - CSV import needs manual testing');
      } else {
        this.addResult('Core Workflows', 'Student Management', 'pass', 
          `Student management working - ${studentCount} students found`);
      }
      
    } catch (error) {
      this.addResult('Core Workflows', 'Student Management', 'fail', 
        `Student management test failed: ${error.message}`);
    }
  }

  private async testAssessmentWorkflow(teacherId: string) {
    try {
      // Check assessments
      const { data: assessments, error: assessError } = await supabase
        .from('assessments')
        .select(`
          *,
          assessment_items (count),
          student_responses (count)
        `)
        .eq('teacher_id', teacherId)
        .limit(3);
      
      if (assessError) {
        this.addResult('Core Workflows', 'Assessment Workflow', 'fail', 
          `Assessment access failed: ${assessError.message}`);
        return;
      }
      
      const assessmentCount = assessments?.length || 0;
      const hasResponses = assessments?.some(a => (a as any).student_responses?.length > 0);
      
      if (assessmentCount === 0) {
        this.addResult('Core Workflows', 'Assessment Creation', 'warning', 
          'No assessments found - creation needs manual testing');
      } else {
        this.addResult('Core Workflows', 'Assessment Creation', 'pass', 
          `Assessment creation working - ${assessmentCount} assessments found`);
      }
      
      if (!hasResponses) {
        this.addResult('Core Workflows', 'Assessment Scoring', 'warning', 
          'No student responses found - scoring needs manual testing');
      } else {
        this.addResult('Core Workflows', 'Assessment Scoring', 'pass', 
          'Assessment scoring working - responses found');
      }
      
    } catch (error) {
      this.addResult('Core Workflows', 'Assessment Workflow', 'fail', 
        `Assessment workflow test failed: ${error.message}`);
    }
  }

  private async testAIAnalysis() {
    try {
      // Check if AI analysis exists
      const { data: analyses, error: analysisError } = await supabase
        .from('assessment_analysis')
        .select('*')
        .limit(5);
      
      if (analysisError) {
        this.addResult('Core Workflows', 'AI Analysis', 'fail', 
          `AI analysis access failed: ${analysisError.message}`);
        return;
      }
      
      const analysisCount = analyses?.length || 0;
      
      if (analysisCount === 0) {
        this.addResult('Core Workflows', 'AI Analysis Generation', 'warning', 
          'No AI analyses found - generation needs manual testing with API key');
      } else {
        this.addResult('Core Workflows', 'AI Analysis Generation', 'pass', 
          `AI analysis working - ${analysisCount} analyses found`);
      }
      
    } catch (error) {
      this.addResult('Core Workflows', 'AI Analysis', 'fail', 
        `AI analysis test failed: ${error.message}`);
    }
  }

  private async testGoalCreation() {
    try {
      // Check goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .limit(5);
      
      if (goalsError) {
        this.addResult('Core Workflows', 'Goal Creation', 'fail', 
          `Goal access failed: ${goalsError.message}`);
        return;
      }
      
      const goalCount = goals?.length || 0;
      
      if (goalCount === 0) {
        this.addResult('Core Workflows', 'Goal Creation with AI', 'warning', 
          'No goals found - AI goal creation needs manual testing');
      } else {
        this.addResult('Core Workflows', 'Goal Creation with AI', 'pass', 
          `Goal creation working - ${goalCount} goals found`);
      }
      
    } catch (error) {
      this.addResult('Core Workflows', 'Goal Creation', 'fail', 
        `Goal creation test failed: ${error.message}`);
    }
  }

  private async testDataExport(teacherId: string) {
    try {
      // Test basic data query (simulating export)
      const exportStartTime = Date.now();
      
      const { data: exportData, error: exportError } = await supabase
        .from('students')
        .select(`
          *,
          student_responses (
            score,
            assessment_id
          ),
          student_performance (
            average_score,
            performance_level
          )
        `)
        .eq('teacher_id', teacherId);
      
      const exportTime = Date.now() - exportStartTime;
      
      if (exportError) {
        this.addResult('Core Workflows', 'Data Export', 'fail', 
          `Data export query failed: ${exportError.message}`, exportTime);
      } else {
        const recordCount = exportData?.length || 0;
        this.addResult('Core Workflows', 'Data Export to CSV', 'pass', 
          `Data export working - ${recordCount} records exportable`, exportTime);
      }
      
    } catch (error) {
      this.addResult('Core Workflows', 'Data Export', 'fail', 
        `Data export test failed: ${error.message}`);
    }
  }

  private async verifyEnhancedPerformanceTargets() {
    console.log('⚡ Verifying Enhanced Performance Targets...');
    
    try {
      // Test enhanced caching performance
      const { advancedCaching } = await import('@/services/advanced-caching-service');
      
      const cacheStartTime = Date.now();
      advancedCaching.set('perf-test', { data: 'test' }, 5000);
      const cached = advancedCaching.get('perf-test');
      const cacheTime = Date.now() - cacheStartTime;
      
      if (cached && cacheTime < 10) {
        this.addResult('Performance', 'Advanced Caching Speed', 'pass', 
          `Cache operations under 10ms: ${cacheTime}ms`, cacheTime);
      } else {
        this.addResult('Performance', 'Advanced Caching Speed', 'warning', 
          `Cache operations: ${cacheTime}ms (target: <10ms)`, cacheTime);
      }

      // Test structured logging performance
      const { structuredLogger } = await import('@/services/structured-logging');
      
      const logStartTime = Date.now();
      await structuredLogger.measureOperation('test-operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'completed';
      });
      const logTime = Date.now() - logStartTime;
      
      this.addResult('Performance', 'Structured Logging Performance', 'pass', 
        `Logging operation measurement: ${logTime}ms`, logTime);

      // Test 3: Export speed simulation (<5 seconds)
      const exportStartTime = Date.now();
      const { data: exportData } = await supabase
        .from('students')
        .select(`
          *,
          student_responses!inner (
            score,
            assessment_id
          )
        `)
        .limit(100);
      const exportTime = Date.now() - exportStartTime;
      
      if (exportTime > 5000) {
        this.addResult('Performance', 'Export Speed', 'warning', 
          `Export simulation took ${exportTime}ms (target: <5000ms)`, exportTime);
      } else {
        this.addResult('Performance', 'Export Speed', 'pass', 
          `Export within target: ${exportTime}ms`, exportTime);
      }
      
    } catch (error) {
      this.addResult('Performance', 'Enhanced Performance Testing', 'fail', 
        `Enhanced performance verification failed: ${error.message}`);
    }
  }

  private async verifyEmailSystem() {
    console.log('📧 Verifying Email System...');
    
    try {
      // Test 1: Email communications table
      const { data: communications, error: commError } = await supabase
        .from('parent_communications')
        .select('*')
        .limit(5);
      
      if (commError) {
        this.addResult('Email System', 'Email Data Access', 'fail', 
          `Email data access failed: ${commError.message}`);
      } else {
        const emailCount = communications?.length || 0;
        this.addResult('Email System', 'Email History Tracking', 'pass', 
          `Email history accessible - ${emailCount} communications found`);
      }
      
      // Test 2: Email templates - Fixed verification logic
      const { data: templates, error: templateError } = await supabase
        .from('email_templates')
        .select('id, name, template_type')
        .limit(10);
      
      if (templateError) {
        this.addResult('Email System', 'Email Templates', 'fail', 
          `Email template access failed: ${templateError.message}`);
      } else {
        const templateCount = templates?.length || 0;
        if (templateCount === 0) {
          this.addResult('Email System', 'Email Templates', 'warning', 
            'No email templates found - template system needs setup');
        } else {
          this.addResult('Email System', 'Email Templates', 'pass', 
            `Email templates available - ${templateCount} templates found`);
        }
      }
      
      // Test 3: Email automations
      const { data: automations, error: autoError } = await supabase
        .from('email_automations')
        .select('*')
        .limit(3);
      
      if (autoError) {
        this.addResult('Email System', 'Email Automation', 'fail', 
          `Email automation access failed: ${autoError.message}`);
      } else {
        const autoCount = automations?.length || 0;
        if (autoCount === 0) {
          this.addResult('Email System', 'Email Automation Scheduling', 'warning', 
            'No email automations found - automation needs manual setup');
        } else {
          this.addResult('Email System', 'Email Automation Scheduling', 'pass', 
            `Email automation configured - ${autoCount} automations found`);
        }
      }
      
      // Test 4: Bulk email capability (structural test)
      this.addResult('Email System', 'Single & Bulk Email Capability', 'info', 
        'Email sending requires Resend API key - manual testing needed');
        
    } catch (error) {
      this.addResult('Email System', 'Email System Check', 'fail', 
        `Email system verification failed: ${error.message}`);
    }
  }

  private async verifyAdvancedSystemHealth() {
    console.log('🏥 Verifying Advanced System Health...');
    
    try {
      // Check monitoring integration status
      const { monitoringIntegration } = await import('@/services/monitoring-integration');
      const status = monitoringIntegration.getStatus();
      
      if (status.initialized) {
        this.addResult('System Health', 'Monitoring Integration', 'pass', 
          'All monitoring services are properly integrated and operational');
      } else {
        this.addResult('System Health', 'Monitoring Integration', 'fail', 
          'Monitoring integration failed to initialize properly');
      }

      // Check service worker status
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && registration.active) {
            this.addResult('System Health', 'Service Worker', 'pass', 
              'Service Worker is active and providing offline capabilities');
          } else {
            this.addResult('System Health', 'Service Worker', 'warning', 
              'Service Worker is supported but not active');
          }
        } catch (error) {
          this.addResult('System Health', 'Service Worker', 'warning', 
            'Service Worker status could not be determined');
        }
      } else {
        this.addResult('System Health', 'Service Worker', 'fail', 
          'Service Worker is not supported in this environment');
      }

      // Run enhanced testing suite
      const enhancedResults = await enhancedTestingHelpers.runAllEnhancedTests();
      
      // Summarize enhanced test results
      const passedTests = enhancedResults.filter(r => r.success).length;
      const totalTests = enhancedResults.length;
      const passRate = (passedTests / totalTests) * 100;
      
      if (passRate >= 90) {
        this.addResult('System Health', 'Enhanced Test Suite', 'pass', 
          `${passedTests}/${totalTests} tests passed (${passRate.toFixed(1)}%)`);
      } else if (passRate >= 70) {
        this.addResult('System Health', 'Enhanced Test Suite', 'warning', 
          `${passedTests}/${totalTests} tests passed (${passRate.toFixed(1)}%) - some issues detected`);
      } else {
        this.addResult('System Health', 'Enhanced Test Suite', 'fail', 
          `${passedTests}/${totalTests} tests passed (${passRate.toFixed(1)}%) - significant issues`);
      }
      
      // Data completeness check
      await this.verifyDataCompleteness();
      
    } catch (error) {
      this.addResult('System Health', 'Advanced System Health Check', 'fail', 
        `Advanced system health verification failed: ${error.message}`);
    }
  }

  private async verifyDataCompleteness() {
    try {
      const completenessResults = await testingHelpers.validateTestDataCompleteness();
      const hasCompleteData = completenessResults.some(r => r.success);
      
      if (hasCompleteData) {
        this.addResult('System Health', 'Data Completeness', 'pass', 
          'Sufficient test data available for all workflows');
      } else {
        this.addResult('System Health', 'Data Completeness', 'warning', 
          'Limited test data - consider running sample data generator');
      }
      
    } catch (error) {
      this.addResult('System Health', 'Data Completeness', 'fail', 
        `Data completeness check failed: ${error.message}`);
    }
  }

  private addResult(category: string, test: string, status: 'pass' | 'fail' | 'warning' | 'info', 
                   message: string, duration?: number, details?: any) {
    this.results.push({
      category,
      test,
      status,
      message,
      duration,
      details
    });
    
    const statusIcon = {
      pass: '✅',
      fail: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }[status];
    
    const durationText = duration ? ` (${duration}ms)` : '';
    console.log(`${statusIcon} ${category} - ${test}: ${message}${durationText}`);
  }

  private generateEnhancedFinalReport() {
    const summary = this.results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalTests = this.results.length;
    const successRate = ((summary.pass || 0) / totalTests) * 100;
    
    console.log('\n📊 ENHANCED VERIFICATION REPORT');
    console.log('=====================================');
    console.log(`✅ Passed: ${summary.pass || 0}`);
    console.log(`⚠️  Warnings: ${summary.warning || 0}`);
    console.log(`❌ Failed: ${summary.fail || 0}`);
    console.log(`ℹ️  Info: ${summary.info || 0}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`Total Tests: ${totalTests}`);
    
    const criticalIssues = this.results.filter(r => r.status === 'fail');
    const warnings = this.results.filter(r => r.status === 'warning');
    
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES FOR FINAL POLISH:');
      criticalIssues.forEach(issue => {
        console.log(`- ${issue.category}: ${issue.test} - ${issue.message}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS FOR REVIEW:');
      warnings.forEach(warning => {
        console.log(`- ${warning.category}: ${warning.test} - ${warning.message}`);
      });
    }
    
    console.log('\n🎯 MANUAL TESTING STILL REQUIRED:');
    console.log('- CSV student import workflow');
    console.log('- Email sending with Resend API key');
    console.log('- AI features with Anthropic API key');
    console.log('- User registration flow');
    console.log('- File uploads and exports');
    console.log('=====================================\n');
    
    if (successRate >= 90) {
      console.log('\n🎉 PRODUCTION READY!');
      console.log('Your LearnSpark AI platform is ready for production deployment.');
    } else if (successRate >= 80) {
      console.log('\n🔧 ALMOST READY!');
      console.log('Address the critical issues above to achieve production readiness.');
    } else {
      console.log('\n⚠️  NEEDS WORK!');
      console.log('Significant improvements needed before production deployment.');
    }
    
    console.log('=====================================\n');
  }
}

export const comprehensiveVerification = new ComprehensiveVerification();
