import { useEffect, useRef, useState } from 'react';

// ARIA live region announcer for screen readers
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private liveRegion: HTMLElement | null = null;

  private constructor() {
    this.createLiveRegion();
  }

  public static getInstance(): ScreenReaderAnnouncer {
    if (!ScreenReaderAnnouncer.instance) {
      ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer();
    }
    return ScreenReaderAnnouncer.instance;
  }

  private createLiveRegion(): void {
    if (typeof window === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('class', 'sr-only');
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(this.liveRegion);
  }

  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement to allow repeated messages
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

// Hook for managing focus
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement>(null);

  const focusElement = (element?: HTMLElement | null) => {
    const target = element || focusRef.current;
    if (target) {
      target.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return { focusRef, focusElement, trapFocus };
}

// Hook for keyboard navigation
export function useKeyboardNavigation(
  items: any[],
  onSelect?: (index: number) => void,
  orientation: 'horizontal' | 'vertical' = 'vertical'
) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent) => {
    const { key } = e;
    let newIndex = activeIndex;

    switch (key) {
      case orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight':
        newIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
        e.preventDefault();
        break;
      case orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft':
        newIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
        e.preventDefault();
        break;
      case 'Home':
        newIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        newIndex = items.length - 1;
        e.preventDefault();
        break;
      case 'Enter':
      case ' ':
        if (activeIndex >= 0 && onSelect) {
          onSelect(activeIndex);
          e.preventDefault();
        }
        break;
      case 'Escape':
        setActiveIndex(-1);
        e.preventDefault();
        break;
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      itemRefs.current[newIndex]?.focus();
    }
  };

  const setItemRef = (index: number) => (ref: HTMLElement | null) => {
    itemRefs.current[index] = ref;
  };

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    setItemRef,
    itemRefs: itemRefs.current
  };
}

// Color contrast utilities
export const colorContrast = {
  // Calculate relative luminance
  getLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  // Calculate contrast ratio
  getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check WCAG AA compliance
  isWCAGAACompliant(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  },

  // Check WCAG AAA compliance
  isWCAGAAACompliant(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  },

  // Convert hex to RGB
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
};

// ARIA utilities
export const aria = {
  // Generate unique IDs for ARIA relationships
  generateId(prefix = 'aria'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Create ARIA attributes for form fields
  createFieldAttributes(
    id: string,
    label?: string,
    description?: string,
    error?: string,
    required = false
  ) {
    const attributes: Record<string, string> = {
      id,
      'aria-required': required.toString()
    };

    if (label) {
      attributes['aria-label'] = label;
    }

    const describedBy: string[] = [];
    if (description) {
      const descId = `${id}-description`;
      describedBy.push(descId);
    }
    if (error) {
      const errorId = `${id}-error`;
      describedBy.push(errorId);
      attributes['aria-invalid'] = 'true';
    }

    if (describedBy.length > 0) {
      attributes['aria-describedby'] = describedBy.join(' ');
    }

    return attributes;
  },

  // Create ARIA attributes for lists
  createListAttributes(totalItems: number, currentIndex?: number) {
    const attributes: Record<string, string> = {
      role: 'list',
      'aria-label': `List with ${totalItems} items`
    };

    if (currentIndex !== undefined) {
      attributes['aria-activedescendant'] = `item-${currentIndex}`;
    }

    return attributes;
  },

  // Create ARIA attributes for list items
  createListItemAttributes(index: number, isSelected = false, isActive = false) {
    return {
      role: 'listitem' as const,
      id: `item-${index}`,
      'aria-selected': isSelected.toString(),
      'aria-current': isActive ? ('true' as const) : undefined,
      tabIndex: isActive ? 0 : -1
    };
  }
};

// Skip link component for keyboard navigation
export function useSkipLinks() {
  useEffect(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 9999;
      border-radius: 4px;
      transition: top 0.3s;
    `;

    const handleFocus = () => {
      skipLink.style.top = '6px';
    };

    const handleBlur = () => {
      skipLink.style.top = '-40px';
    };

    skipLink.addEventListener('focus', handleFocus);
    skipLink.addEventListener('blur', handleBlur);

    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      skipLink.removeEventListener('focus', handleFocus);
      skipLink.removeEventListener('blur', handleBlur);
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);
}

// Reduced motion detection
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// High contrast detection
export function useHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
} 