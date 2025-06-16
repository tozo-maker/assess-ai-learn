
import React, { Suspense, lazy } from 'react';
import EnhancedLoadingState from '@/components/common/EnhancedLoadingState';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Lazy load heavy dashboard components
export const LazyDashboardStats = lazy(() => 
  import('@/components/dashboard/DashboardStatsRedesigned')
    .then(module => ({ default: module.default }))
);

export const LazyActivityFeed = lazy(() => 
  import('@/components/dashboard/DashboardActivityFeed')
    .then(module => ({ default: module.default }))
);

export const LazyRecentInsights = lazy(() => 
  import('@/components/dashboard/DashboardRecentInsights')
    .then(module => ({ default: module.default }))
);

export const LazySecondaryWidgets = lazy(() => 
  import('@/components/dashboard/DashboardSecondaryWidgets')
    .then(module => ({ default: module.default }))
);

// Lazy load assessment components
export const LazyAssessmentList = lazy(() => 
  import('@/components/assessments/AssessmentList')
    .then(module => ({ default: module.default }))
);

export const LazyStudentList = lazy(() => 
  import('@/components/students/EnhancedStudentList')
    .then(module => ({ default: module.default }))
);

// Lazy load chart components
export const LazyPerformanceChart = lazy(() => 
  import('@/components/charts/PerformanceTimelineChart')
    .then(module => ({ default: module.default }))
);

export const LazySkillsMasteryGrid = lazy(() => 
  import('@/components/charts/SkillsMasteryGrid')
    .then(module => ({ default: module.default }))
);

// Higher-order component for lazy loading with error boundary
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <EnhancedLoadingState type="component" />,
  errorFallback = <div className="p-4 text-center text-gray-500">Failed to load component</div>
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Intersection Observer hook for lazy loading on scroll
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        rootMargin: '100px', // Load 100px before element comes into view
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { isIntersecting, hasIntersected };
};

// Lazy container that loads content when scrolled into view
interface LazyContainerProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
}

export const LazyContainer: React.FC<LazyContainerProps> = ({
  children,
  placeholder = <EnhancedLoadingState type="component" />,
  className = ''
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { hasIntersected } = useIntersectionObserver(containerRef);

  return (
    <div ref={containerRef} className={className}>
      {hasIntersected ? children : placeholder}
    </div>
  );
};

// Performance monitoring for lazy components
export const useLazyLoadingStats = () => {
  const [loadedComponents, setLoadedComponents] = React.useState<Set<string>>(new Set());
  const [loadTimes, setLoadTimes] = React.useState<Map<string, number>>(new Map());

  const trackComponentLoad = React.useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      setLoadedComponents(prev => new Set([...prev, componentName]));
      setLoadTimes(prev => new Map([...prev, [componentName, loadTime]]));
      
      console.log(`Lazy component "${componentName}" loaded in ${loadTime.toFixed(2)}ms`);
    };
  }, []);

  const getStats = React.useCallback(() => {
    const avgLoadTime = Array.from(loadTimes.values()).reduce((sum, time) => sum + time, 0) / loadTimes.size;
    
    return {
      totalLoaded: loadedComponents.size,
      averageLoadTime: avgLoadTime || 0,
      slowestComponent: Array.from(loadTimes.entries()).sort(([, a], [, b]) => b - a)[0],
      allLoadTimes: Object.fromEntries(loadTimes)
    };
  }, [loadedComponents, loadTimes]);

  return {
    trackComponentLoad,
    getStats,
    loadedComponents: Array.from(loadedComponents),
    loadTimes: Object.fromEntries(loadTimes)
  };
};
