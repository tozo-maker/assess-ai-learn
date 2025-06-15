import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { logger } from '@/services/logger';

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
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
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (renderTime > 100) { // Log slow renders
      logger.warn(
        `Slow render detected in ${componentName}`,
        { renderTime, renderCount: renderCount.current },
        'PerformanceMonitor'
      );
    }
    
    startTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
    logPerformance: (operation: string, duration: number) => {
      logger.debug(
        `${componentName} - ${operation}`,
        { duration, renderCount: renderCount.current },
        'PerformanceMonitor'
      );
    }
  };
}

// Memoized callback with dependencies tracking
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef<T>(callback);
  const depsRef = useRef(deps);

  // Update callback if dependencies changed
  if (!depsRef.current || deps.some((dep, i) => dep !== depsRef.current[i])) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }

  return useCallback(callbackRef.current, []);
}

// Optimized state updates
export function useBatchedUpdates<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef<Partial<T>[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchedSetState = useCallback((update: Partial<T> | ((prev: T) => Partial<T>)) => {
    const updateValue = typeof update === 'function' ? update(state) : update;
    pendingUpdates.current.push(updateValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        const finalUpdate = pendingUpdates.current.reduce(
          (acc, update) => ({ ...acc, ...update }),
          {}
        );
        pendingUpdates.current = [];
        return { ...prevState, ...finalUpdate };
      });
    }, 0);
  }, [state]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchedSetState] as const;
}

// Memory usage monitoring
export function useMemoryMonitor(componentName: string) {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        setMemoryUsage(usedMB);
        
        if (usedMB > 100) { // Log high memory usage
          logger.warn(
            `High memory usage in ${componentName}`,
            { memoryUsage: usedMB },
            'MemoryMonitor'
          );
        }
      }
    };

    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds
    checkMemory(); // Initial check

    return () => clearInterval(interval);
  }, [componentName]);

  return memoryUsage;
}

// Optimized list rendering
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight,
  };
}

// Component performance wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = React.memo((props: P) => {
    const { logPerformance } = usePerformanceMonitor(componentName);
    
    useEffect(() => {
      const startTime = Date.now();
      return () => {
        const duration = Date.now() - startTime;
        logPerformance('mount-unmount', duration);
      };
    }, [logPerformance]);

    return React.createElement(Component, props);
  });

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return WrappedComponent;
} 