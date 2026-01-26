import { supabase } from '@/integrations/supabase/client';

interface AuditResult {
  category: string;
  feature: string;
  status: 'working' | 'partial' | 'failed' | 'not_tested';
  message: string;
  duration?: number;
  details?: string;
}

export const functionalityAudit = {
  async runFullAudit(teacherId: string): Promise<AuditResult[]> {
    const checks: AuditResult[] = [];
    
    // Test core database connectivity
    await testDatabaseConnectivity(checks, teacherId);
    
    // Test student management
    await testStudentManagement(checks, teacherId);
    
    // Test assessment system
    await testAssessmentSystem(checks, teacherId);
    
    // Test goals system
    await testGoalsSystem(checks, teacherId);
    
    // Test skills system
    await testSkillsSystem(checks, teacherId);
    
    return checks;
  }
};

const testDatabaseConnectivity = async (checks: AuditResult[], teacherId: string) => {
  try {
    const startTime = Date.now();
    const { error } = await supabase.from('teacher_profiles').select('id').eq('id', teacherId).single();
    const duration = Date.now() - startTime;

    if (error) {
      checks.push({
        category: 'Database',
        feature: 'Connectivity',
        status: 'failed',
        message: `Database connection failed: ${error.message}`,
        duration
      });
    } else {
      checks.push({
        category: 'Database',
        feature: 'Connectivity',
        status: 'working',
        message: 'Database connection successful',
        duration
      });
    }
  } catch (error) {
    checks.push({
      category: 'Database',
      feature: 'Connectivity',
      status: 'failed',
      message: `Database connection error: ${(error as Error).message}`
    });
  }
};

const testStudentManagement = async (checks: AuditResult[], teacherId: string) => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .eq('teacher_id', teacherId)
      .limit(5);
    const duration = Date.now() - startTime;

    if (error) {
      checks.push({
        category: 'Students',
        feature: 'List Students',
        status: 'failed',
        message: `Failed to fetch students: ${error.message}`,
        duration
      });
    } else {
      checks.push({
        category: 'Students',
        feature: 'List Students',
        status: 'working',
        message: `Successfully fetched ${data?.length || 0} students`,
        duration
      });
    }
  } catch (error) {
    checks.push({
      category: 'Students',
      feature: 'List Students',
      status: 'failed',
      message: `Error: ${(error as Error).message}`
    });
  }
};

const testAssessmentSystem = async (checks: AuditResult[], teacherId: string) => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('assessments')
      .select('id, title')
      .eq('teacher_id', teacherId)
      .limit(5);
    const duration = Date.now() - startTime;

    if (error) {
      checks.push({
        category: 'Assessments',
        feature: 'List Assessments',
        status: 'failed',
        message: `Failed to fetch assessments: ${error.message}`,
        duration
      });
    } else {
      checks.push({
        category: 'Assessments',
        feature: 'List Assessments',
        status: 'working',
        message: `Successfully fetched ${data?.length || 0} assessments`,
        duration
      });
    }
  } catch (error) {
    checks.push({
      category: 'Assessments',
      feature: 'List Assessments',
      status: 'failed',
      message: `Error: ${(error as Error).message}`
    });
  }
};

const testGoalsSystem = async (checks: AuditResult[], teacherId: string) => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('goals')
      .select('id, title, progress')
      .eq('teacher_id', teacherId)
      .limit(5);
    const duration = Date.now() - startTime;

    if (error) {
      checks.push({
        category: 'Goals',
        feature: 'List Goals',
        status: 'failed',
        message: `Failed to fetch goals: ${error.message}`,
        duration
      });
    } else {
      checks.push({
        category: 'Goals',
        feature: 'List Goals',
        status: 'working',
        message: `Successfully fetched ${data?.length || 0} goals`,
        duration
      });
    }
  } catch (error) {
    checks.push({
      category: 'Goals',
      feature: 'List Goals',
      status: 'failed',
      message: `Error: ${(error as Error).message}`
    });
  }
};

const testSkillsSystem = async (checks: AuditResult[], teacherId: string) => {
  try {
    const startTime = Date.now();
    // Skills table exists, student_skills does not
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .limit(10);
    
    const duration = Date.now() - startTime;
    
    if (skillsError) {
      checks.push({
        category: 'Skills',
        feature: 'Skills Library',
        status: 'failed',
        message: `Failed to fetch skills: ${skillsError.message}`,
        duration
      });
    } else {
      checks.push({
        category: 'Skills',
        feature: 'Skills Library',
        status: 'working',
        message: `Skills library accessible with ${skills?.length || 0} skills`,
        duration
      });
    }

    // Note: student_skills table doesn't exist yet
    checks.push({
      category: 'Skills',
      feature: 'Student Skills Tracking',
      status: 'not_tested',
      message: 'Student skills table not yet implemented',
      duration: 0
    });
  } catch (error) {
    checks.push({
      category: 'Skills',
      feature: 'Skills System',
      status: 'failed',
      message: `Skills system error: ${(error as Error).message}`
    });
  }
};

export default functionalityAudit;
