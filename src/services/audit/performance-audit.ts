
import { AuditCategory, AuditResult } from '@/types/audit';

export const runPerformanceAudit = async (category: AuditCategory): Promise<void> => {
  const checks: AuditResult[] = [];
  
  try {
    // Test 1: Page Load Performance
    await testPageLoadPerformance(checks);
    
    // Test 2: Query Performance
    await testQueryPerformance(checks);
    
    // Test 3: Bundle Size Analysis
    await testBundleSize(checks);
    
    // Test 4: Memory Usage
    await testMemoryUsage(checks);
    
    // Test 5: Network Performance
    await testNetworkPerformance(checks);

  } catch (error) {
    checks.push({
      category: 'performance',
      check: 'Performance Audit',
      status: 'fail',
      message: 'Performance audit failed',
      details: error,
      recommendation: 'Review application performance optimization'
    });
  }

  category.checks = checks;
  category.score = (checks.filter(c => c.status === 'pass').length / checks.length) * 100;
};

const testPageLoadPerformance = async (checks: AuditResult[]) => {
  try {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigationEntry) {
        const loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
        const domContentLoaded = navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart;
        
        checks.push({
          category: 'performance',
          check: 'Page Load Time',
          status: loadTime < 3000 ? 'pass' : loadTime < 5000 ? 'warning' : 'fail',
          message: `Page load time: ${Math.round(loadTime)}ms`,
          duration: Math.round(loadTime),
          details: {
            loadTime: Math.round(loadTime),
            domContentLoaded: Math.round(domContentLoaded),
            firstContentfulPaint: navigationEntry.responseEnd - navigationEntry.fetchStart
          },
          recommendation: loadTime >= 3000 ? 'Optimize bundle size, implement code splitting, and add caching' : undefined
        });
      }
    } else {
      checks.push({
        category: 'performance',
        check: 'Page Load Time',
        status: 'warning',
        message: 'Performance API not available',
        recommendation: 'Performance monitoring limited in this environment'
      });
    }
  } catch (error) {
    checks.push({
      category: 'performance',
      check: 'Page Load Time',
      status: 'fail',
      message: 'Failed to measure page load performance',
      recommendation: 'Review performance measurement implementation'
    });
  }
};

const testQueryPerformance = async (checks: AuditResult[]) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Test simple query performance
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .limit(10);
    const queryTime = Date.now() - startTime;
    
    if (error) {
      checks.push({
        category: 'performance',
        check: 'Database Query Performance',
        status: 'fail',
        message: `Query failed: ${error.message}`,
        recommendation: 'Check database connection and query optimization'
      });
    } else {
      checks.push({
        category: 'performance',
        check: 'Database Query Performance',
        status: queryTime < 200 ? 'pass' : queryTime < 500 ? 'warning' : 'fail',
        message: `Simple query performance: ${queryTime}ms`,
        duration: queryTime,
        details: {
          queryTime,
          recordCount: data?.length || 0,
          benchmark: 'Target: <200ms excellent, <500ms acceptable'
        },
        recommendation: queryTime >= 200 ? 'Consider query optimization and database indexing' : undefined
      });
    }

    // Test complex query performance
    const complexStartTime = Date.now();
    const { data: complexData, error: complexError } = await supabase
      .from('students')
      .select(`
        *,
        student_performance (*),
        student_responses (*)
      `)
      .limit(5);
    const complexQueryTime = Date.now() - complexStartTime;

    if (!complexError) {
      checks.push({
        category: 'performance',
        check: 'Complex Query Performance',
        status: complexQueryTime < 500 ? 'pass' : complexQueryTime < 1000 ? 'warning' : 'fail',
        message: `Complex query performance: ${complexQueryTime}ms`,
        duration: complexQueryTime,
        details: {
          queryTime: complexQueryTime,
          joins: 2,
          benchmark: 'Target: <500ms excellent, <1000ms acceptable'
        },
        recommendation: complexQueryTime >= 500 ? 'Optimize complex queries with proper indexing and query structure' : undefined
      });
    }

  } catch (error) {
    checks.push({
      category: 'performance',
      check: 'Database Query Performance',
      status: 'fail',
      message: 'Failed to test query performance',
      recommendation: 'Review database connection and query implementation'
    });
  }
};

const testBundleSize = async (checks: AuditResult[]) => {
  try {
    // Estimate bundle size based on resource timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const scriptResources = resources.filter(r => r.name.includes('.js'));
      const styleResources = resources.filter(r => r.name.includes('.css'));
      
      const totalTransferSize = resources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
      const scriptSize = scriptResources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
      
      const totalSizeMB = totalTransferSize / (1024 * 1024);
      const scriptSizeMB = scriptSize / (1024 * 1024);
      
      checks.push({
        category: 'performance',
        check: 'Bundle Size Analysis',
        status: totalSizeMB < 2 ? 'pass' : totalSizeMB < 5 ? 'warning' : 'fail',
        message: `Total transfer size: ${totalSizeMB.toFixed(2)}MB (JS: ${scriptSizeMB.toFixed(2)}MB)`,
        details: {
          totalSizeMB: totalSizeMB.toFixed(2),
          scriptSizeMB: scriptSizeMB.toFixed(2),
          resourceCount: resources.length,
          scriptCount: scriptResources.length,
          styleCount: styleResources.length
        },
        recommendation: totalSizeMB >= 2 ? 'Implement code splitting and tree shaking to reduce bundle size' : undefined
      });
    } else {
      checks.push({
        category: 'performance',
        check: 'Bundle Size Analysis',
        status: 'warning',
        message: 'Bundle size analysis not available',
        recommendation: 'Use build tools to analyze bundle size'
      });
    }
  } catch (error) {
    checks.push({
      category: 'performance',
      check: 'Bundle Size Analysis',
      status: 'fail',
      message: 'Failed to analyze bundle size',
      recommendation: 'Review bundle analysis implementation'
    });
  }
};

const testMemoryUsage = async (checks: AuditResult[]) => {
  try {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedMB = memInfo.usedJSHeapSize / (1024 * 1024);
      const totalMB = memInfo.totalJSHeapSize / (1024 * 1024);
      const limitMB = memInfo.jsHeapSizeLimit / (1024 * 1024);
      
      const usagePercent = (usedMB / limitMB) * 100;
      
      checks.push({
        category: 'performance',
        check: 'Memory Usage',
        status: usagePercent < 50 ? 'pass' : usagePercent < 80 ? 'warning' : 'fail',
        message: `Memory usage: ${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB (${usagePercent.toFixed(1)}%)`,
        details: {
          usedMB: usedMB.toFixed(1),
          totalMB: totalMB.toFixed(1),
          limitMB: limitMB.toFixed(1),
          usagePercent: usagePercent.toFixed(1)
        },
        recommendation: usagePercent >= 50 ? 'Monitor for memory leaks and optimize component lifecycle' : undefined
      });
    } else {
      checks.push({
        category: 'performance',
        check: 'Memory Usage',
        status: 'warning',
        message: 'Memory monitoring not available in this environment',
        recommendation: 'Use development tools to monitor memory usage'
      });
    }
  } catch (error) {
    checks.push({
      category: 'performance',
      check: 'Memory Usage',
      status: 'fail',
      message: 'Failed to measure memory usage',
      recommendation: 'Review memory monitoring implementation'
    });
  }
};

const testNetworkPerformance = async (checks: AuditResult[]) => {
  try {
    // Test connection quality
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;
      
      let status: 'pass' | 'warning' | 'fail' = 'pass';
      if (effectiveType === 'slow-2g' || effectiveType === '2g') status = 'fail';
      else if (effectiveType === '3g') status = 'warning';
      
      checks.push({
        category: 'performance',
        check: 'Network Performance',
        status,
        message: `Connection: ${effectiveType}, Downlink: ${downlink}Mbps`,
        details: {
          effectiveType,
          downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        },
        recommendation: status !== 'pass' ? 'Optimize for slower connections with data reduction techniques' : undefined
      });
    } else {
      checks.push({
        category: 'performance',
        check: 'Network Performance',
        status: 'warning',
        message: 'Network information not available',
        recommendation: 'Test on various network conditions manually'
      });
    }

    // Test API response time
    const { supabase } = await import('@/integrations/supabase/client');
    const apiStartTime = Date.now();
    await supabase.from('students').select('id').limit(1);
    const apiResponseTime = Date.now() - apiStartTime;

    checks.push({
      category: 'performance',
      check: 'API Response Time',
      status: apiResponseTime < 200 ? 'pass' : apiResponseTime < 500 ? 'warning' : 'fail',
      message: `API response time: ${apiResponseTime}ms`,
      duration: apiResponseTime,
      recommendation: apiResponseTime >= 200 ? 'Optimize API calls and consider caching strategies' : undefined
    });

  } catch (error) {
    checks.push({
      category: 'performance',
      check: 'Network Performance',
      status: 'fail',
      message: 'Failed to test network performance',
      recommendation: 'Review network performance testing implementation'
    });
  }
};
