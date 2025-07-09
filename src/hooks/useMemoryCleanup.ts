import { useEffect, useRef } from 'react';

/**
 * Custom hook to ensure proper cleanup of resources
 * Helps prevent memory leaks in React components
 */
export const useMemoryCleanup = () => {
  const cleanupFunctions = useRef<Array<() => void>>([]);

  const addCleanup = (cleanupFn: () => void) => {
    cleanupFunctions.current.push(cleanupFn);
  };

  const clearCleanup = () => {
    cleanupFunctions.current = [];
  };

  useEffect(() => {
    return () => {
      // Execute all cleanup functions on unmount
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, []);

  return { addCleanup, clearCleanup };
};

/**
 * Hook to track and cleanup event listeners
 */
export const useEventListenerCleanup = () => {
  const listeners = useRef<Array<{
    target: EventTarget;
    event: string;
    handler: EventListener;
    options?: boolean | AddEventListenerOptions;
  }>>([]);

  const addEventListener = (
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    target.addEventListener(event, handler, options);
    listeners.current.push({ target, event, handler, options });
  };

  const removeEventListener = (target: EventTarget, event: string, handler: EventListener) => {
    target.removeEventListener(event, handler);
    listeners.current = listeners.current.filter(
      listener => !(listener.target === target && listener.event === event && listener.handler === handler)
    );
  };

  useEffect(() => {
    return () => {
      // Cleanup all event listeners
      listeners.current.forEach(({ target, event, handler }) => {
        target.removeEventListener(event, handler);
      });
      listeners.current = [];
    };
  }, []);

  return { addEventListener, removeEventListener };
};