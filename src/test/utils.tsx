import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { StudentWithPerformance, StudentPerformance } from '@/types/student';
import { User } from '@supabase/supabase-js';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data factories
export const createMockStudent = (overrides?: Partial<StudentWithPerformance>): StudentWithPerformance => ({
  id: 'student-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  grade_level: '10',
  student_id: 'STU001',
  learning_goals: 'Improve math skills',
  special_considerations: 'None',
  teacher_id: 'teacher-1',
  avatar_url: undefined,
  parent_name: 'Jane Doe',
  parent_email: 'jane.doe@example.com',
  parent_phone: '555-0123',
  created_at: '2023-09-01T00:00:00Z',
  updated_at: '2023-09-01T00:00:00Z',
  performance: {
    id: 'perf-1',
    student_id: 'student-1',
    assessment_count: 12,
    average_score: 85.5,
    last_assessment_date: '2023-11-01',
    performance_level: 'Above Average',
    needs_attention: false,
    created_at: '2023-09-01T00:00:00Z',
    updated_at: '2023-11-01T00:00:00Z'
  },
  ...overrides,
});

export const createMockStudents = (count: number): StudentWithPerformance[] => {
  return Array.from({ length: count }, (_, index) => {
    const performanceLevels = ['Above Average', 'Average', 'Below Average'];
    const randomPerformance = performanceLevels[Math.floor(Math.random() * performanceLevels.length)];
    
    return createMockStudent({
      id: `student-${index + 1}`,
      first_name: `Student${index + 1}`,
      last_name: `Last${index + 1}`,
      email: `student${index + 1}@example.com`,
      student_id: `STU${String(index + 1).padStart(3, '0')}`,
      performance: {
        id: `perf-${index + 1}`,
        student_id: `student-${index + 1}`,
        assessment_count: Math.floor(Math.random() * 20) + 1,
        average_score: Math.random() * 100,
        last_assessment_date: '2023-11-01',
        performance_level: randomPerformance,
        needs_attention: Math.random() > 0.7,
        created_at: '2023-09-01T00:00:00Z',
        updated_at: '2023-11-01T00:00:00Z'
      }
    });
  });
};

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-1',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'teacher@example.com',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  phone: '',
  confirmed_at: '2023-01-01T00:00:00Z',
  last_sign_in_at: '2023-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {
    first_name: 'Jane',
    last_name: 'Smith',
  },
  identities: [],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
});

// Mock functions
export const createMockFunctions = () => ({
  onSelectStudent: vi.fn(),
  onSelectAll: vi.fn(),
  onStudentClick: vi.fn(),
  onPageChange: vi.fn(),
  onSearchChange: vi.fn(),
  onSort: vi.fn(),
  onFilter: vi.fn(),
});

// Accessibility testing helpers
export const getByRole = (container: HTMLElement, role: string, options?: any) => {
  return container.querySelector(`[role="${role}"]`) || 
         container.querySelector(`[aria-label*="${options?.name}"]`);
};

export const getAllByRole = (container: HTMLElement, role: string) => {
  return Array.from(container.querySelectorAll(`[role="${role}"]`));
};

// Custom matchers for accessibility testing
export const expectToBeAccessible = (element: HTMLElement) => {
  // Check for proper ARIA attributes
  const hasAriaLabel = element.hasAttribute('aria-label') || 
                      element.hasAttribute('aria-labelledby');
  
  const hasRole = element.hasAttribute('role');
  
  const isFocusable = element.tabIndex >= 0 || 
                     ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase());

  return {
    hasAriaLabel,
    hasRole,
    isFocusable,
    isAccessible: hasAriaLabel && (hasRole || isFocusable)
  };
};

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Mock intersection observer for virtualization tests
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

// Mock resize observer for responsive tests
export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

// Simulate user interactions
export const simulateKeyboardNavigation = async (element: HTMLElement, key: string) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true });
  element.dispatchEvent(event);
};

export const simulateTouch = async (element: HTMLElement) => {
  const touchEvent = new TouchEvent('touchstart', { bubbles: true });
  element.dispatchEvent(touchEvent);
};

// Wait for async operations
export const waitForLoadingToFinish = async () => {
  // Wait for any loading states to complete
  await new Promise(resolve => setTimeout(resolve, 100));
};

// Mock local storage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Mock window methods
export const mockWindowMethods = () => {
  const originalScrollTo = window.scrollTo;
  const originalMatchMedia = window.matchMedia;
  
  window.scrollTo = vi.fn();
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

  return {
    restore: () => {
      window.scrollTo = originalScrollTo;
      window.matchMedia = originalMatchMedia;
    }
  };
}; 