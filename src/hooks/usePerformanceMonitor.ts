import { useEffect, useRef } from 'react';
import { logger } from '@/utils/performance-logger';

interface PerformanceOptions {
  componentName: string;
  enableLogging?: boolean;
  threshold?: number; // ms threshold for slow renders
}

export const usePerformanceMonitor = (options: PerformanceOptions) => {
  const renderStartTime = useRef<number>();
  const renderCount = useRef(0);
  const { componentName, enableLogging = process.env.NODE_ENV === 'development', threshold = 16 } = options;

  // Track render start
  renderStartTime.current = performance.now();
  renderCount.current += 1;

  useEffect(() => {
    if (!enableLogging || !renderStartTime.current) return;

    const renderTime = performance.now() - renderStartTime.current;
    
    if (renderTime > threshold) {
      logger.warn(`Slow render detected: ${componentName}`, {
        context: {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
          threshold: `${threshold}ms`
        }
      });
    } else if (process.env.NODE_ENV === 'development') {
      logger.debug(`Render performance: ${componentName}`, {
        context: {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current
        }
      });
    }
  });

  // Memory cleanup tracking
  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Component unmounted: ${componentName}`, {
          context: {
            totalRenders: renderCount.current
          }
        });
      }
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    markRenderComplete: () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        return renderTime;
      }
      return 0;
    }
  };
};