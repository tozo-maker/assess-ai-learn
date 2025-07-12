import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Skeleton } from '@/components/ui/loading-skeleton';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<any>;
  delay?: number;
}

// Error fallback component
const DefaultErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5">
    <h3 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h3>
    <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
    >
      Try again
    </button>
  </div>
);

// Default loading fallback
const DefaultLoadingFallback: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

// Performance optimizer component that wraps children with error boundaries and suspense
export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  fallback = <DefaultLoadingFallback />,
  errorFallback = DefaultErrorFallback,
  delay = 0,
}) => {
  return (
    <ErrorBoundary 
      FallbackComponent={errorFallback}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={fallback}>
        {delay > 0 ? (
          <DelayedRenderer delay={delay}>
            {children}
          </DelayedRenderer>
        ) : (
          children
        )}
      </Suspense>
    </ErrorBoundary>
  );
};

// Component to delay rendering for performance optimization
const DelayedRenderer: React.FC<{ children: React.ReactNode; delay: number }> = ({ 
  children, 
  delay 
}) => {
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldRender) {
    return <DefaultLoadingFallback />;
  }

  return <>{children}</>;
};

// Higher-order component for wrapping components with performance optimization
export function withPerformanceOptimization<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  options?: {
    fallback?: React.ReactNode;
    errorFallback?: React.ComponentType<any>;
    delay?: number;
  }
) {
  const WrappedComponent: React.FC<T> = (props) => (
    <PerformanceOptimizer 
      fallback={options?.fallback}
      errorFallback={options?.errorFallback}
      delay={options?.delay}
    >
      <Component {...props} />
    </PerformanceOptimizer>
  );
  
  WrappedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for monitoring component performance
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
        
        // Warn about slow renders
        if (renderTime > 100) {
          console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });
}

// Virtual scrolling component for large lists
interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}