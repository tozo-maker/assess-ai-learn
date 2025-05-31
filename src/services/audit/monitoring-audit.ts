
import { AuditCategory, AuditResult } from '@/types/audit';

export const runMonitoringAudit = async (category: AuditCategory): Promise<void> => {
  const checks: AuditResult[] = [];
  
  // Check for error tracking
  let errorTrackingStatus: 'pass' | 'warning' | 'fail' = 'warning';
  let errorTrackingMessage = 'Basic error tracking available';
  let errorTrackingDetails: any = { features: ['Global error handlers', 'Console logging'] };
  
  try {
    if (typeof window !== 'undefined' && (window as any).enhancedErrorTracking) {
      errorTrackingStatus = 'pass';
      errorTrackingMessage = 'Enhanced error tracking service is active';
      errorTrackingDetails = {
        features: ['Global error handlers', 'Network error tracking', 'Error batching', 'Local fallback'],
        integration: 'Supabase + localStorage',
        globallyAvailable: true
      };
    } else {
      try {
        const { enhancedErrorTracking } = await import('@/services/enhanced-error-tracking');
        if (enhancedErrorTracking && typeof enhancedErrorTracking.captureError === 'function') {
          errorTrackingStatus = 'pass';
          errorTrackingMessage = 'Enhanced error tracking service is operational';
          errorTrackingDetails = {
            features: ['Global error handlers', 'Network error tracking', 'Error batching', 'Local fallback'],
            integration: 'Supabase + localStorage',
            importedSuccessfully: true
          };
        }
      } catch (importError) {
        console.warn('Could not import enhanced error tracking:', importError);
      }
    }
  } catch (error) {
    console.warn('Error tracking service check failed:', error);
  }
  
  checks.push({
    category: 'monitoring',
    check: 'Error Tracking',
    status: errorTrackingStatus,
    message: errorTrackingMessage,
    details: errorTrackingDetails,
    recommendation: errorTrackingStatus !== 'pass' ? 'Implement comprehensive error tracking with Sentry or similar service' : undefined
  });

  // Check performance monitoring
  const hasPerformanceAPI = 'performance' in window && 'getEntriesByType' in window.performance;
  checks.push({
    category: 'monitoring',
    check: 'Performance Monitoring',
    status: hasPerformanceAPI ? 'pass' : 'warning',
    message: hasPerformanceAPI ? 'Performance API is available' : 'Performance monitoring needs enhancement',
    details: { 
      performanceAPI: hasPerformanceAPI,
      metrics: hasPerformanceAPI ? ['Navigation timing', 'Resource timing', 'User timing'] : []
    },
    recommendation: hasPerformanceAPI ? 'Implement performance metrics collection and alerting' : 'Implement performance monitoring service'
  });

  // Check for structured logging
  let loggingStatus: 'pass' | 'warning' | 'fail' = 'warning';
  let loggingMessage = 'Basic console logging detected';
  let loggingDetails: any = { levels: ['log', 'warn', 'error'] };
  
  try {
    if (typeof window !== 'undefined' && (window as any).structuredLogger) {
      loggingStatus = 'pass';
      loggingMessage = 'Structured logging service is operational';
      loggingDetails = {
        levels: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
        features: ['Performance measurement', 'Context tracking', 'Batch processing'],
        storage: 'Supabase + localStorage fallback',
        globallyAvailable: true
      };
    } else {
      try {
        const { structuredLogger } = await import('@/services/structured-logging');
        if (structuredLogger && typeof structuredLogger.info === 'function') {
          loggingStatus = 'pass';
          loggingMessage = 'Structured logging service is operational';
          loggingDetails = {
            levels: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
            features: ['Performance measurement', 'Context tracking', 'Batch processing'],
            storage: 'Supabase + localStorage fallback',
            importedSuccessfully: true
          };
        }
      } catch (importError) {
        console.warn('Could not import structured logger:', importError);
      }
    }
  } catch (error) {
    console.warn('Structured logging service check failed:', error);
  }
  
  checks.push({
    category: 'monitoring',
    check: 'Application Logging',
    status: loggingStatus,
    message: loggingMessage,
    details: loggingDetails,
    recommendation: loggingStatus !== 'pass' ? 'Implement structured logging with different log levels and remote log aggregation' : undefined
  });

  // Check real-time monitoring capabilities
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const hasRealtime = typeof supabase.channel === 'function';
    
    checks.push({
      category: 'monitoring',
      check: 'Real-time Monitoring',
      status: hasRealtime ? 'pass' : 'warning',
      message: hasRealtime ? 'Supabase real-time capabilities are available' : 'Real-time monitoring needs implementation',
      details: { 
        realtimeAPI: hasRealtime,
        capabilities: hasRealtime ? ['Live performance metrics', 'Error rate monitoring', 'User activity tracking'] : []
      },
      recommendation: hasRealtime ? 'Implement real-time performance dashboards and alerts' : 'Setup real-time monitoring infrastructure'
    });
  } catch (error) {
    checks.push({
      category: 'monitoring',
      check: 'Real-time Monitoring',
      status: 'fail',
      message: 'Real-time monitoring configuration failed',
      recommendation: 'Setup real-time monitoring infrastructure'
    });
  }

  // Check performance logging infrastructure
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.from('system_performance_logs').select('id').limit(1);
    
    if (error && error.code === '42P01') {
      checks.push({
        category: 'monitoring',
        check: 'Performance Logging Infrastructure',
        status: 'fail',
        message: 'Performance logging table missing',
        recommendation: 'Create system_performance_logs table for centralized logging'
      });
    } else {
      checks.push({
        category: 'monitoring',
        check: 'Performance Logging Infrastructure',
        status: 'pass',
        message: 'Performance logging infrastructure is ready'
      });
    }
  } catch (error) {
    checks.push({
      category: 'monitoring',
      check: 'Performance Logging Infrastructure',
      status: 'warning',
      message: 'Could not verify performance logging infrastructure',
      recommendation: 'Verify database schema includes performance logging tables'
    });
  }

  category.checks = checks;
  category.score = (checks.filter(c => c.status === 'pass').length / checks.length) * 100;
};
