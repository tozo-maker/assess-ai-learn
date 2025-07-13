/**
 * Unified State Management Hook
 * Standardizes useState patterns with consistent initialization, error handling, and logging
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { unifiedErrorSystem } from '@/services/unified-error-system';

export interface StateConfig<T> {
  initialValue: T;
  name?: string;
  validate?: (value: T) => boolean | string;
  onError?: (error: Error) => void;
  persist?: boolean;
  persistKey?: string;
}

export interface UnifiedState<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  reset: () => void;
  error: string | null;
  isValid: boolean;
  isDirty: boolean;
}

export function useUnifiedState<T>(config: StateConfig<T>): UnifiedState<T> {
  const { initialValue, name, validate, onError, persist = false, persistKey } = config;
  const mountedRef = useRef(true);
  const initialValueRef = useRef(initialValue);

  // Load persisted value if enabled
  const getInitialValue = useCallback((): T => {
    if (persist && persistKey) {
      try {
        const stored = localStorage.getItem(persistKey);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (validate) {
            const validationResult = validate(parsed);
            if (validationResult === true) {
              return parsed;
            }
          } else {
            return parsed;
          }
        }
      } catch (error) {
        unifiedErrorSystem.warn('Failed to load persisted state', {
          component: name || 'useUnifiedState',
          persistKey,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    return initialValue;
  }, [initialValue, persist, persistKey, validate, name]);

  const [value, setValueInternal] = useState<T>(getInitialValue);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const resolvedValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;

      // Validate if validator provided
      if (validate) {
        const validationResult = validate(resolvedValue);
        if (validationResult !== true) {
          const errorMessage = typeof validationResult === 'string' 
            ? validationResult 
            : 'Validation failed';
          
          setError(errorMessage);
          
          const validationError = new Error(`State validation failed: ${errorMessage}`);
          unifiedErrorSystem.warn('State validation failed', {
            component: name || 'useUnifiedState',
            validationError: errorMessage,
            value: resolvedValue
          });
          
          onError?.(validationError);
          return;
        }
      }

      // Clear any previous errors
      setError(null);
      
      // Update state if component is still mounted
      if (mountedRef.current) {
        setValueInternal(resolvedValue);
        setIsDirty(true);

        // Persist if enabled
        if (persist && persistKey) {
          try {
            localStorage.setItem(persistKey, JSON.stringify(resolvedValue));
          } catch (error) {
            unifiedErrorSystem.warn('Failed to persist state', {
              component: name || 'useUnifiedState',
              persistKey,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

        // Log state change in development
        if (process.env.NODE_ENV === 'development' && name) {
          unifiedErrorSystem.debug(`State updated: ${name}`, {
            component: name,
            newValue: resolvedValue,
            isDirty: true
          });
        }
      }
    } catch (error) {
      const stateError = error instanceof Error 
        ? error 
        : new Error('State update failed');
      
      setError(stateError.message);
      
      unifiedErrorSystem.error('State update error', {
        error: stateError,
        context: {
          component: name || 'useUnifiedState',
          attemptedValue: newValue
        }
      });
      
      onError?.(stateError);
    }
  }, [value, validate, onError, name, persist, persistKey]);

  const reset = useCallback(() => {
    try {
      setValueInternal(initialValueRef.current);
      setError(null);
      setIsDirty(false);

      // Clear persisted value if enabled
      if (persist && persistKey) {
        try {
          localStorage.removeItem(persistKey);
        } catch (error) {
          unifiedErrorSystem.warn('Failed to clear persisted state', {
            component: name || 'useUnifiedState',
            persistKey,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      if (process.env.NODE_ENV === 'development' && name) {
        unifiedErrorSystem.debug(`State reset: ${name}`, {
          component: name,
          resetTo: initialValueRef.current
        });
      }
    } catch (error) {
      const resetError = error instanceof Error 
        ? error 
        : new Error('State reset failed');
      
      setError(resetError.message);
      unifiedErrorSystem.error('State reset error', {
        error: resetError,
        context: { component: name || 'useUnifiedState' }
      });
      
      onError?.(resetError);
    }
  }, [persist, persistKey, name, onError]);

  const isValid = error === null;

  return {
    value,
    setValue,
    reset,
    error,
    isValid,
    isDirty
  };
}

// Specialized hooks for common patterns
export function useUnifiedStringState(
  initialValue: string = '',
  name?: string,
  maxLength?: number
): UnifiedState<string> {
  return useUnifiedState({
    initialValue,
    name,
    validate: maxLength 
      ? (value: string) => value.length <= maxLength || `Maximum length is ${maxLength} characters`
      : undefined
  });
}

export function useUnifiedNumberState(
  initialValue: number = 0,
  name?: string,
  min?: number,
  max?: number
): UnifiedState<number> {
  return useUnifiedState({
    initialValue,
    name,
    validate: (value: number) => {
      if (isNaN(value)) return 'Must be a valid number';
      if (min !== undefined && value < min) return `Must be at least ${min}`;
      if (max !== undefined && value > max) return `Must be at most ${max}`;
      return true;
    }
  });
}

export function useUnifiedBooleanState(
  initialValue: boolean = false,
  name?: string
): UnifiedState<boolean> {
  return useUnifiedState({
    initialValue,
    name
  });
}

export function useUnifiedArrayState<T>(
  initialValue: T[] = [],
  name?: string,
  maxItems?: number
): UnifiedState<T[]> {
  return useUnifiedState({
    initialValue,
    name,
    validate: maxItems 
      ? (value: T[]) => value.length <= maxItems || `Maximum ${maxItems} items allowed`
      : undefined
  });
}