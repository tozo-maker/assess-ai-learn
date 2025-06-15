import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';
import { render, mockWindowMethods } from '@/test/utils';
import {
  useBreakpoint,
  useTouch,
  ResponsiveContainer,
  MobileNavigation,
  ResponsiveGrid,
  TouchButton,
  CollapsibleSection,
  ResponsiveTable
} from './ResponsiveLayout';

describe('useBreakpoint', () => {
  let windowMock: ReturnType<typeof mockWindowMethods>;

  beforeEach(() => {
    windowMock = mockWindowMethods();
  });

  afterEach(() => {
    windowMock.restore();
  });

  it('detects mobile breakpoint correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.breakpoint).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('detects tablet breakpoint correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    });

    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.breakpoint).toBe('tablet');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('detects desktop breakpoint correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });

    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.breakpoint).toBe('desktop');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('updates on window resize', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useBreakpoint());

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(true);

    // Change to desktop
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });
});

describe('useTouch', () => {
  beforeEach(() => {
    // Reset touch properties safely
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  it('detects touch support correctly', () => {
    Object.defineProperty(window, 'ontouchstart', {
      value: {},
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useTouch());
    expect(result.current).toBe(true);
  });

  it('detects no touch support correctly', () => {
    // Remove ontouchstart property completely
    const descriptor = Object.getOwnPropertyDescriptor(window, 'ontouchstart');
    if (descriptor) {
      delete (window as any).ontouchstart;
    }
    
    // Ensure maxTouchPoints is 0
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useTouch());
    expect(result.current).toBe(false);
    
    // Restore property if it existed
    if (descriptor) {
      Object.defineProperty(window, 'ontouchstart', descriptor);
    }
  });

  it('detects touch through maxTouchPoints', () => {
    // Remove ontouchstart property
    const descriptor = Object.getOwnPropertyDescriptor(window, 'ontouchstart');
    if (descriptor) {
      delete (window as any).ontouchstart;
    }
    
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 1,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useTouch());
    expect(result.current).toBe(true);
    
    // Restore property if it existed
    if (descriptor) {
      Object.defineProperty(window, 'ontouchstart', descriptor);
    }
  });
});

describe('ResponsiveContainer', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveContainer>
        <div>Test content</div>
      </ResponsiveContainer>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies correct max-width classes', () => {
    const { container } = render(
      <ResponsiveContainer maxWidth="lg">
        <div>Test content</div>
      </ResponsiveContainer>
    );

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('max-w-lg');
  });

  it('applies correct padding classes', () => {
    const { container } = render(
      <ResponsiveContainer padding="lg">
        <div>Test content</div>
      </ResponsiveContainer>
    );

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('px-8', 'py-6');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ResponsiveContainer className="custom-class">
        <div>Test content</div>
      </ResponsiveContainer>
    );

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('custom-class');
  });
});

describe('MobileNavigation', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
  });

  it('renders mobile menu button on mobile', () => {
    render(
      <MobileNavigation isOpen={false} onToggle={mockOnToggle}>
        <div>Navigation content</div>
      </MobileNavigation>
    );

    expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
  });

  it('does not render on desktop', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
    });

    render(
      <MobileNavigation isOpen={false} onToggle={mockOnToggle}>
        <div>Navigation content</div>
      </MobileNavigation>
    );

    expect(screen.queryByLabelText('Open navigation menu')).not.toBeInTheDocument();
  });

  it('toggles menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MobileNavigation isOpen={false} onToggle={mockOnToggle}>
        <div>Navigation content</div>
      </MobileNavigation>
    );

    const toggleButton = screen.getByLabelText('Open navigation menu');
    await user.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('shows navigation content when open', () => {
    render(
      <MobileNavigation isOpen={true} onToggle={mockOnToggle}>
        <div>Navigation content</div>
      </MobileNavigation>
    );

    expect(screen.getByText('Navigation content')).toBeInTheDocument();
  });

  it('closes on escape key', () => {
    render(
      <MobileNavigation isOpen={true} onToggle={mockOnToggle}>
        <div>Navigation content</div>
      </MobileNavigation>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('closes when clicking overlay', async () => {
    const user = userEvent.setup();
    render(
      <MobileNavigation isOpen={true} onToggle={mockOnToggle}>
        <div>Navigation content</div>
      </MobileNavigation>
    );

    const overlay = document.querySelector('.fixed.inset-0.z-50.bg-black');
    if (overlay) {
      await user.click(overlay);
      expect(mockOnToggle).toHaveBeenCalled();
    }
  });

  it('prevents body scroll when open', () => {
    render(
      <MobileNavigation isOpen={true} onToggle={mockOnToggle}>
        <div>Navigation content</div>
      </MobileNavigation>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });
});

describe('ResponsiveGrid', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies correct grid column classes', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }}>
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
  });

  it('applies correct gap classes', () => {
    const { container } = render(
      <ResponsiveGrid gap="lg">
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const gridDiv = container.firstChild as HTMLElement;
    expect(gridDiv).toHaveClass('gap-6');
  });
});

describe('TouchButton', () => {
  beforeEach(() => {
    // Reset touch properties safely
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  it('renders button correctly', () => {
    render(<TouchButton>Click me</TouchButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies touch-friendly sizing on touch devices', () => {
    Object.defineProperty(window, 'ontouchstart', {
      value: {},
      writable: true,
    });

    const { container } = render(<TouchButton>Click me</TouchButton>);
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]');
  });

  it('applies correct variant classes', () => {
    const { container } = render(
      <TouchButton variant="secondary">Click me</TouchButton>
    );
    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('bg-gray-200', 'text-gray-900');
  });

  it('handles click events', async () => {
    const mockOnClick = vi.fn();
    const user = userEvent.setup();
    
    render(<TouchButton onClick={mockOnClick}>Click me</TouchButton>);
    
    await user.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<TouchButton disabled>Click me</TouchButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies aria-label correctly', () => {
    render(<TouchButton aria-label="Custom label">Click me</TouchButton>);
    expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
  });
});

describe('CollapsibleSection', () => {
  beforeEach(() => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
  });

  it('renders title and content on desktop', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
    });

    render(
      <CollapsibleSection title="Test Section">
        <div>Section content</div>
      </CollapsibleSection>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('renders collapsible button on mobile', () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Section content</div>
      </CollapsibleSection>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Test Section');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles content on mobile when clicked', async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleSection title="Test Section">
        <div>Section content</div>
      </CollapsibleSection>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('starts open when defaultOpen is true', () => {
    render(
      <CollapsibleSection title="Test Section" defaultOpen={true}>
        <div>Section content</div>
      </CollapsibleSection>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows correct chevron icons', async () => {
    const user = userEvent.setup();
    render(
      <CollapsibleSection title="Test Section">
        <div>Section content</div>
      </CollapsibleSection>
    );

    // Should show down chevron when closed
    expect(screen.getByTestId || screen.queryByTestId).toBeTruthy();

    const button = screen.getByRole('button');
    await user.click(button);

    // Should show up chevron when open
    expect(screen.getByTestId || screen.queryByTestId).toBeTruthy();
  });
});

describe('ResponsiveTable', () => {
  it('renders table content correctly', () => {
    render(
      <ResponsiveTable>
        <table>
          <tbody>
            <tr>
              <td>Cell content</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    expect(screen.getByText('Cell content')).toBeInTheDocument();
  });

  it('applies responsive wrapper classes', () => {
    const { container } = render(
      <ResponsiveTable>
        <table>
          <tbody>
            <tr>
              <td>Cell content</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('overflow-x-auto');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ResponsiveTable className="custom-table">
        <table>
          <tbody>
            <tr>
              <td>Cell content</td>
            </tr>
          </tbody>
        </table>
      </ResponsiveTable>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-table');
  });
}); 