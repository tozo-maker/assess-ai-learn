/**
 * Consolidated Performance Monitoring Hook
 * Replaces duplicate usePerformanceMonitor implementations
 */

import { useEffect, useRef, useState } from 'react';
import { productionLogger } from '@/services/production-logger';

interface PerformanceMetrics {
  renderCount: number;
  timeSinceMount: number;
  renderTime: number;
  layoutShift: number;
  fontLoadTime: number;
}

interface PerformanceMonitorOptions {
  componentName: string;
  enableLogging?: boolean;
  renderThreshold?: number; // ms threshold for slow renders
}

export const useConsolidatedPerformance = (options: PerformanceMonitorOptions) => {
  const { componentName, enableLogging = process.env.NODE_ENV === 'development', renderThreshold = 16 } = options;
  
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());
  const renderStartTime = useRef<number>();
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    timeSinceMount: 0,
    renderTime: 0,
    layoutShift: 0,
    fontLoadTime: 0
  });

  // Track render start
  renderStartTime.current = performance.now();
  renderCountRef.current++;

  useEffect(() => {
    if (!enableLogging || !renderStartTime.current) return;

    const renderTime = performance.now() - renderStartTime.current;
    
    setMetrics(prev => ({
      ...prev,
      renderCount: renderCountRef.current,
      timeSinceMount: Date.now() - mountTimeRef.current,
      renderTime
    }));

    // Log slow renders
    if (renderTime > renderThreshold) {
      productionLogger.warn(`Slow render detected: ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCountRef.current,
        threshold: `${renderThreshold}ms`
      });
    } else if (process.env.NODE_ENV === 'development') {
      productionLogger.debug(`Component render: ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCountRef.current,
        timeSinceMount: Date.now() - mountTimeRef.current
      });
    }
  });

  // Setup Web Vitals monitoring
  useEffect(() => {
    let observer: PerformanceObserver | null = null;

    if ('PerformanceObserver' in window) {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name === 'font-display') {
            setMetrics(prev => ({
              ...prev,
              fontLoadTime: entry.duration
            }));
          }
          
          if (entry.entryType === 'layout-shift') {
            setMetrics(prev => ({
              ...prev,
              layoutShift: prev.layoutShift + (entry as any).value
            }));
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['measure', 'layout-shift'] });
      } catch (error) {
        productionLogger.warn('Performance monitoring not fully supported', { error: error as Error });
      }
    }

    // Component unmount tracking
    return () => {
      const unmountTime = Date.now();
      const lifespan = unmountTime - mountTimeRef.current;
      
      if (observer) {
        observer.disconnect();
      }
      
      if (process.env.NODE_ENV === 'development') {
        productionLogger.debug(`Component unmounted: ${componentName}`, {
          component: componentName,
          lifespan,
          totalRenders: renderCountRef.current
        });
      }
    };
  }, [componentName, enableLogging]);

  return {
    metrics,
    renderCount: renderCountRef.current,
    timeSinceMount: Date.now() - mountTimeRef.current,
    markRenderComplete: () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        return renderTime;
      }
      return 0;
    }
  };
};

// Backward compatibility exports
export const usePerformanceMonitor = useConsolidatedPerformance;