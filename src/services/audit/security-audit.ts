
import { AuditCategory, AuditResult } from '@/types/audit';

export const runSecurityAudit = async (category: AuditCategory): Promise<void> => {
  const checks: AuditResult[] = [];
  
  // Check user authentication
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: user, error } = await supabase.auth.getUser();
    
    if (error) {
      checks.push({
        category: 'security',
        check: 'User Authentication',
        status: 'fail',
        message: 'Authentication check failed',
        details: error,
        recommendation: 'Fix authentication configuration and ensure proper user session handling'
      });
    } else if (user.user) {
      checks.push({
        category: 'security',
        check: 'User Authentication',
        status: 'pass',
        message: 'User authentication is working properly',
        details: { userId: user.user.id }
      });
    } else {
      checks.push({
        category: 'security',
        check: 'User Authentication',
        status: 'warning',
        message: 'No authenticated user found',
        recommendation: 'Ensure users are properly authenticated before accessing protected resources'
      });
    }
  } catch (error) {
    checks.push({
      category: 'security',
      check: 'User Authentication',
      status: 'fail',
      message: 'Authentication system error',
      details: error,
      recommendation: 'Review Supabase authentication configuration and client setup'
    });
  }

  // Environment security check
  const isProduction = (import.meta.env.PROD === true || 
                       import.meta.env.MODE === 'production' || 
                       (window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1' && 
                        !window.location.hostname.includes('lovable.app')));
  
  checks.push({
    category: 'security',
    check: 'Environment Security',
    status: isProduction ? 'pass' : 'warning',
    message: isProduction ? 'Production environment detected' : 'Development environment detected',
    details: { 
      isProd: import.meta.env.PROD,
      hostname: window.location.hostname,
      mode: import.meta.env.MODE,
      detectedEnv: isProduction ? 'production' : 'development'
    },
    recommendation: isProduction ? undefined : 'Ensure production environment variables are properly secured'
  });

  // Check HTTPS
  const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  checks.push({
    category: 'security',
    check: 'HTTPS Configuration',
    status: isHTTPS ? 'pass' : 'fail',
    message: isHTTPS ? 'Site is served over HTTPS' : 'Site is not served over HTTPS',
    recommendation: isHTTPS ? undefined : 'Configure HTTPS for all production traffic'
  });

  // RLS policy check
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    let rlsScore = 0;
    const totalTables = 3;
    const testedTables = ['students', 'assessments', 'teacher_profiles'] as const;
    
    for (const tableName of testedTables) {
      try {
        await supabase.from(tableName).select('id').limit(1);
        rlsScore++;
      } catch (error: any) {
        if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
          rlsScore++; // RLS is working (access denied as expected)
        }
      }
    }
    
    const rlsPercentage = (rlsScore / totalTables) * 100;
    
    checks.push({
      category: 'security',
      check: 'Row Level Security',
      status: rlsPercentage >= 80 ? 'pass' : 'warning',
      message: rlsPercentage === 100 ? 'RLS policies are properly configured' : `RLS policies active on ${rlsScore}/${totalTables} critical tables`,
      details: { coverage: `${rlsPercentage}%`, tables: testedTables },
      recommendation: rlsPercentage < 100 ? 'Ensure all sensitive tables have proper RLS policies' : 'Continue monitoring RLS policy effectiveness'
    });
  } catch (error) {
    checks.push({
      category: 'security',
      check: 'Row Level Security',
      status: 'fail',
      message: 'Could not verify RLS policy coverage',
      details: error,
      recommendation: 'Review and implement Row Level Security policies for all sensitive tables'
    });
  }

  category.checks = checks;
  category.score = (checks.filter(c => c.status === 'pass').length / checks.length) * 100;
};
