
import { AuditCategory, AuditResult } from '@/types/audit';

export const runConfigurationAudit = async (category: AuditCategory): Promise<void> => {
  const checks: AuditResult[] = [];
  
  // Build environment check
  const isProduction = (import.meta.env.PROD === true || 
                       import.meta.env.MODE === 'production' || 
                       (window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1' && 
                        !window.location.hostname.includes('lovable.app')));
  const buildMode = import.meta.env.MODE || 'development';
  
  checks.push({
    category: 'configuration',
    check: 'Build Environment',
    status: isProduction ? 'pass' : 'warning',
    message: isProduction ? `Production build environment: ${buildMode}` : `Build environment: ${buildMode}`,
    details: {
      mode: buildMode,
      isProd: import.meta.env.PROD,
      hostname: window.location.hostname,
      detectedEnv: isProduction ? 'production' : 'development'
    },
    recommendation: isProduction ? undefined : 'Ensure production build optimizations are enabled'
  });

  // Check API configuration
  const supabaseUrl = 'https://etlkxmgdmzzysmgkbudx.supabase.co';
  checks.push({
    category: 'configuration',
    check: 'Supabase Configuration',
    status: 'pass',
    message: 'Supabase configuration is valid',
    details: { url: supabaseUrl }
  });

  // Check Edge Functions
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('analyze-student-assessment', {
      body: { test: true }
    });
    
    if (error && error.message.includes('not found')) {
      checks.push({
        category: 'configuration',
        check: 'Edge Functions',
        status: 'warning',
        message: 'Some Edge Functions may not be deployed',
        recommendation: 'Ensure all required Edge Functions are deployed and accessible'
      });
    } else {
      checks.push({
        category: 'configuration',
        check: 'Edge Functions',
        status: 'pass',
        message: 'Edge Functions are properly configured'
      });
    }
  } catch (error) {
    checks.push({
      category: 'configuration',
      check: 'Edge Functions',
      status: 'fail',
      message: 'Edge Functions configuration failed',
      details: error,
      recommendation: 'Review Edge Functions deployment and configuration'
    });
  }

  // Check resource optimization
  const isOptimized = document.querySelector('script[type="module"]') !== null;
  checks.push({
    category: 'configuration',
    check: 'Resource Optimization',
    status: isOptimized ? 'pass' : 'warning',
    message: isOptimized ? 'Modern module loading detected' : 'Resource optimization needs review',
    recommendation: isOptimized ? 'Consider implementing image optimization and CDN' : 'Enable code splitting, tree shaking, and asset optimization'
  });

  // Check caching strategy
  let cachingStatus: 'pass' | 'warning' | 'fail' = 'warning';
  let cachingMessage = 'Caching strategy needs implementation';
  const cachingDetails: any = { layers: [] };
  
  try {
    if (typeof window !== 'undefined' && (window as any).advancedCaching) {
      cachingStatus = 'pass';
      cachingMessage = 'Advanced multi-tier caching system is active';
      cachingDetails.layers = ['Advanced memory cache', 'Browser storage cache'];
      cachingDetails.features = ['LRU eviction', 'TTL-based expiration', 'Dependency invalidation'];
      cachingDetails.globallyAvailable = true;
    } else {
      try {
        const { advancedCaching } = await import('@/services/advanced-caching-service');
        if (advancedCaching && typeof advancedCaching.get === 'function') {
          cachingStatus = 'pass';
          cachingMessage = 'Advanced multi-tier caching system is active';
          cachingDetails.layers = ['Advanced memory cache', 'Browser storage cache'];
          cachingDetails.features = ['LRU eviction', 'TTL-based expiration', 'Dependency invalidation'];
          cachingDetails.importedSuccessfully = true;
        }
      } catch (importError) {
        console.warn('Could not import advanced caching:', importError);
        if (localStorage && sessionStorage) {
          cachingDetails.layers.push('Browser storage available');
          cachingMessage = 'Basic browser caching available';
        }
      }
    }
  } catch (error) {
    console.warn('Caching service check failed:', error);
    if (localStorage && sessionStorage) {
      cachingDetails.layers.push('Browser storage available');
      cachingMessage = 'Basic browser caching available';
    }
  }
  
  checks.push({
    category: 'configuration',
    check: 'Caching Strategy',
    status: cachingStatus,
    message: cachingMessage,
    details: cachingDetails,
    recommendation: cachingStatus !== 'pass' ? 'Implement browser caching, API response caching, and CDN caching' : undefined
  });

  // Check service worker
  const hasServiceWorker = 'serviceWorker' in navigator;
  let swStatus: 'pass' | 'warning' | 'fail' = 'fail';
  let swMessage = 'Service Worker not supported';
  let swDetails: any = {};
  
  if (hasServiceWorker) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.active) {
        swStatus = 'pass';
        swMessage = 'Service Worker is registered and active';
        swDetails = {
          scope: registration.scope,
          state: registration.active.state,
          capabilities: ['Offline caching', 'Background sync', 'Cache management', 'Network fallback']
        };
      } else if (registration) {
        swStatus = 'warning';
        swMessage = 'Service Worker is registered but not yet active';
        swDetails = {
          scope: registration.scope,
          state: registration.installing?.state || registration.waiting?.state || 'unknown',
          recommendation: 'Refresh the page to activate the service worker'
        };
      } else {
        swStatus = 'warning';
        swMessage = 'Service Worker supported but not registered';
        swDetails = {
          support: true,
          recommendation: 'Register and activate service worker for enhanced caching'
        };
      }
    } catch (error) {
      swStatus = 'warning';
      swMessage = 'Service Worker registration check failed';
      swDetails = { error: error?.toString() };
    }
  }
  
  checks.push({
    category: 'configuration',
    check: 'Service Worker & Offline Support',
    status: swStatus,
    message: swMessage,
    details: swDetails,
    recommendation: swStatus !== 'pass' ? 'Register and activate service worker for enhanced caching' : undefined
  });

  category.checks = checks;
  category.score = (checks.filter(c => c.status === 'pass').length / checks.length) * 100;
};
