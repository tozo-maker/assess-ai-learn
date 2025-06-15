import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  ScreenReaderAnnouncer, 
  useFocusManagement, 
  useKeyboardNavigation,
  aria,
  colorContrast,
  useReducedMotion,
  useHighContrast
} from './accessibility';

describe('ScreenReaderAnnouncer', () => {
  let announcer: ScreenReaderAnnouncer;

  beforeEach(() => {
    // Clear any existing live regions and reset singleton
    document.body.innerHTML = '';
    // Reset the singleton instance
    (ScreenReaderAnnouncer as any).instance = null;
    announcer = ScreenReaderAnnouncer.getInstance();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    // Reset the singleton instance
    (ScreenReaderAnnouncer as any).instance = null;
  });

  it('creates a singleton instance', () => {
    const announcer1 = ScreenReaderAnnouncer.getInstance();
    const announcer2 = ScreenReaderAnnouncer.getInstance();
    expect(announcer1).toBe(announcer2);
  });

  it('creates live region with proper attributes', () => {
    // The live region should be created when getInstance is called
    const liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(liveRegion).toHaveClass('sr-only');
  });

  it('announces messages with polite priority by default', () => {
    announcer.announce('Test message');
    
    const liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion).toHaveTextContent('Test message');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('announces messages with assertive priority when specified', () => {
    announcer.announce('Urgent message', 'assertive');
    
    const liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion).toHaveTextContent('Urgent message');
    expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
  });

  it('clears message after timeout', async () => {
    vi.useFakeTimers();
    
    announcer.announce('Test message');
    const liveRegion = document.querySelector('[aria-live]');
    expect(liveRegion).toHaveTextContent('Test message');
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(liveRegion).toHaveTextContent('');
    
    vi.useRealTimers();
  });
});

describe('useFocusManagement', () => {
  it('provides focus utilities', () => {
    const { result } = renderHook(() => useFocusManagement());
    
    expect(result.current.focusRef).toBeDefined();
    expect(result.current.focusElement).toBeTypeOf('function');
    expect(result.current.trapFocus).toBeTypeOf('function');
  });

  it('focuses element when focusElement is called', () => {
    const mockElement = document.createElement('button');
    mockElement.focus = vi.fn();
    document.body.appendChild(mockElement);
    
    const { result } = renderHook(() => useFocusManagement());
    
    act(() => {
      result.current.focusElement(mockElement);
    });
    
    expect(mockElement.focus).toHaveBeenCalled();
  });

  it('traps focus within container', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    
    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);
    
    button1.focus = vi.fn();
    button2.focus = vi.fn();
    
    const { result } = renderHook(() => useFocusManagement());
    
    act(() => {
      result.current.trapFocus(container);
    });
    
    expect(button1.focus).toHaveBeenCalled();
  });
});

describe('useKeyboardNavigation', () => {
  const mockItems = ['item1', 'item2', 'item3'];
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation(mockItems, mockOnSelect)
    );
    
    expect(result.current.activeIndex).toBe(-1);
    expect(result.current.handleKeyDown).toBeTypeOf('function');
    expect(result.current.setItemRef).toBeTypeOf('function');
  });

  it('handles arrow down navigation', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation(mockItems, mockOnSelect)
    );
    
    const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    mockEvent.preventDefault = vi.fn();
    
    act(() => {
      result.current.handleKeyDown(mockEvent);
    });
    
    expect(result.current.activeIndex).toBe(0);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('handles enter key selection', () => {
    const { result } = renderHook(() => 
      useKeyboardNavigation(mockItems, mockOnSelect)
    );
    
    act(() => {
      result.current.setActiveIndex(1);
    });
    
    const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    mockEvent.preventDefault = vi.fn();
    
    act(() => {
      result.current.handleKeyDown(mockEvent);
    });
    
    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });
});

describe('aria utilities', () => {
  describe('generateId', () => {
    it('generates unique IDs with default prefix', () => {
      const id1 = aria.generateId();
      const id2 = aria.generateId();
      
      expect(id1).toMatch(/^aria-/);
      expect(id2).toMatch(/^aria-/);
      expect(id1).not.toBe(id2);
    });

    it('generates unique IDs with custom prefix', () => {
      const id = aria.generateId('custom');
      expect(id).toMatch(/^custom-/);
    });
  });

  describe('createFieldAttributes', () => {
    it('creates basic field attributes', () => {
      const attributes = aria.createFieldAttributes('test-id');
      
      expect(attributes).toEqual({
        id: 'test-id',
        'aria-required': 'false'
      });
    });

    it('creates field attributes with label', () => {
      const attributes = aria.createFieldAttributes('test-id', 'Test Label');
      
      expect(attributes).toEqual({
        id: 'test-id',
        'aria-required': 'false',
        'aria-label': 'Test Label'
      });
    });

    it('creates field attributes with error', () => {
      const attributes = aria.createFieldAttributes(
        'test-id', 
        undefined, 
        undefined, 
        'Test error'
      );
      
      expect(attributes).toEqual({
        id: 'test-id',
        'aria-required': 'false',
        'aria-describedby': 'test-id-error',
        'aria-invalid': 'true'
      });
    });
  });

  describe('createListAttributes', () => {
    it('creates basic list attributes', () => {
      const attributes = aria.createListAttributes(5);
      
      expect(attributes).toEqual({
        role: 'list',
        'aria-label': 'List with 5 items'
      });
    });

    it('creates list attributes with active descendant', () => {
      const attributes = aria.createListAttributes(5, 2);
      
      expect(attributes).toEqual({
        role: 'list',
        'aria-label': 'List with 5 items',
        'aria-activedescendant': 'item-2'
      });
    });
  });
});

describe('colorContrast utilities', () => {
  describe('hexToRgb', () => {
    it('converts hex to RGB correctly', () => {
      expect(colorContrast.hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(colorContrast.hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(colorContrast.hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('returns null for invalid hex', () => {
      expect(colorContrast.hexToRgb('invalid')).toBeNull();
    });
  });

  describe('getLuminance', () => {
    it('calculates luminance correctly', () => {
      expect(colorContrast.getLuminance('#ffffff')).toBeCloseTo(1, 2);
      expect(colorContrast.getLuminance('#000000')).toBeCloseTo(0, 2);
    });
  });

  describe('getContrastRatio', () => {
    it('calculates contrast ratio correctly', () => {
      const ratio = colorContrast.getContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeCloseTo(21, 0); // Maximum contrast ratio
    });
  });

  describe('WCAG compliance checks', () => {
    it('correctly identifies WCAG AA compliant colors', () => {
      // High contrast - should pass
      expect(colorContrast.isWCAGAACompliant('#000000', '#ffffff')).toBe(true);
      
      // Low contrast - should fail
      expect(colorContrast.isWCAGAACompliant('#cccccc', '#ffffff')).toBe(false);
    });

    it('correctly identifies WCAG AAA compliant colors', () => {
      // High contrast - should pass
      expect(colorContrast.isWCAGAAACompliant('#000000', '#ffffff')).toBe(true);
      
      // Medium contrast - might pass AA but fail AAA
      expect(colorContrast.isWCAGAAACompliant('#666666', '#ffffff')).toBe(false);
    });
  });
});

describe('useReducedMotion', () => {
  beforeEach(() => {
    // Reset matchMedia mock
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('returns false when user does not prefer reduced motion', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when user prefers reduced motion', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });
});

describe('useHighContrast', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('returns false when user does not prefer high contrast', () => {
    const { result } = renderHook(() => useHighContrast());
    expect(result.current).toBe(false);
  });

  it('returns true when user prefers high contrast', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-contrast: high)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useHighContrast());
    expect(result.current).toBe(true);
  });
}); 