import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ 
  children, 
  active = true, 
  className 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0];
    lastFocusableRef.current = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstFocusableRef.current?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

interface RovingTabIndexProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
}

export const RovingTabIndex: React.FC<RovingTabIndexProps> = ({ 
  children, 
  className,
  orientation = 'both',
  loop = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll('[data-roving-tabindex-item]')
    ) as HTMLElement[];

    if (items.length === 0) return;

    // Set initial tabindex
    items.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = items.findIndex(item => item === document.activeElement);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            e.preventDefault();
            nextIndex = currentIndex + 1;
            if (nextIndex >= items.length) {
              nextIndex = loop ? 0 : items.length - 1;
            }
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            e.preventDefault();
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? items.length - 1 : 0;
            }
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            e.preventDefault();
            nextIndex = currentIndex + 1;
            if (nextIndex >= items.length) {
              nextIndex = loop ? 0 : items.length - 1;
            }
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            e.preventDefault();
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? items.length - 1 : 0;
            }
          }
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        items[currentIndex].tabIndex = -1;
        items[nextIndex].tabIndex = 0;
        items[nextIndex].focus();
      }
    };

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const clickedIndex = items.findIndex(item => item === target || item.contains(target));
      
      if (clickedIndex !== -1) {
        items.forEach((item, index) => {
          item.tabIndex = index === clickedIndex ? 0 : -1;
        });
        items[clickedIndex].focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('click', handleClick);
    };
  }, [orientation, loop]);

  return (
    <div ref={containerRef} className={className} role="group">
      {children}
    </div>
  );
};

// Component for creating accessible action buttons with keyboard support
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  description?: string;
  shortcut?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({ 
  children, 
  description, 
  shortcut,
  className,
  ...props 
}) => {
  useEffect(() => {
    if (!shortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === shortcut && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        // Trigger button click
        const button = document.querySelector(`[data-shortcut="${shortcut}"]`) as HTMLButtonElement;
        button?.click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcut]);

  return (
    <button
      {...props}
      className={cn(
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'transition-colors duration-200',
        className
      )}
      aria-describedby={description ? `${props.id}-description` : undefined}
      data-shortcut={shortcut}
    >
      {children}
      {description && (
        <span id={`${props.id}-description`} className="sr-only">
          {description}
        </span>
      )}
      {shortcut && (
        <span className="sr-only">
          Keyboard shortcut: Ctrl+{shortcut}
        </span>
      )}
    </button>
  );
};

// Component for creating accessible form groups
interface AccessibleFormGroupProps {
  children: React.ReactNode;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export const AccessibleFormGroup: React.FC<AccessibleFormGroupProps> = ({
  children,
  label,
  description,
  error,
  required,
  className
}) => {
  const id = React.useId();

  return (
    <div className={cn('space-y-2', className)}>
      <label 
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-semantic-danger ml-1">*</span>}
      </label>
      
      {description && (
        <p id={`${id}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <div>
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-describedby': [
            description ? `${id}-description` : '',
            error ? `${id}-error` : ''
          ].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required
        })}
      </div>
      
      {error && (
        <p 
          id={`${id}-error`} 
          className="text-sm text-semantic-danger"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </div>
  );
};