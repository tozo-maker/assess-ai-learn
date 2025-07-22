
import React, { useEffect, useState } from 'react';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

interface PerformanceMetrics {
  fontLoadTime: number;
  renderTime: number;
  layoutShift: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fontLoadTime: 0,
    renderTime: 0,
    layoutShift: 0
  });

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
        console.warn('Performance monitoring not fully supported:', error);
      }
    }

    // Monitor font loading performance
    if (document.fonts) {
      const startTime = performance.now();
      
      document.fonts.ready.then(() => {
        const loadTime = performance.now() - startTime;
        setMetrics(prev => ({
          ...prev,
          fontLoadTime: loadTime
        }));
        
        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Font loading completed in ${loadTime.toFixed(2)}ms`);
        }
      });
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return metrics;
};

interface PerformanceMonitorProps {
  children: React.ReactNode;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  onMetricsUpdate
}) => {
  const metrics = usePerformanceMonitor();
  const { announceMessage } = useAccessibility();

  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }

    // Announce significant performance issues
    if (metrics.fontLoadTime > 3000) {
      announceMessage('Fonts are loading slowly, using fallback fonts', 'polite');
    }
    
    if (metrics.layoutShift > 0.1) {
      announceMessage('Page layout optimized for better accessibility', 'polite');
    }
  }, [metrics, onMetricsUpdate, announceMessage]);

  return <>{children}</>;
};

// Hook for monitoring specific component performance
export const useComponentPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`${componentName} render time: ${renderTime.toFixed(2)}ms (may affect 60fps)`);
      }
    };
  });
};
