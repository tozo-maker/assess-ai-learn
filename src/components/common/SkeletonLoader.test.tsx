import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { render } from '@/test/utils';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonDashboard,
  SkeletonList,
  SkeletonForm,
  LoadingWrapper
} from './SkeletonLoader';
import { useReducedMotion } from '@/utils/accessibility';

// Mock the useReducedMotion hook
vi.mock('@/utils/accessibility', () => ({
  useReducedMotion: vi.fn()
}));

describe('Skeleton', () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it('renders with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('bg-gray-200');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveAttribute('role', 'presentation');
  });

  it('applies correct variant classes', () => {
    const { container: circularContainer } = render(<Skeleton variant="circular" />);
    const circularSkeleton = circularContainer.firstChild as HTMLElement;
    expect(circularSkeleton).toHaveClass('rounded-full');

    const { container: textContainer } = render(<Skeleton variant="text" />);
    const textSkeleton = textContainer.firstChild as HTMLElement;
    expect(textSkeleton).toHaveClass('rounded');

    const { container: roundedContainer } = render(<Skeleton variant="rounded" />);
    const roundedSkeleton = roundedContainer.firstChild as HTMLElement;
    expect(roundedSkeleton).toHaveClass('rounded-lg');
  });

  it('applies animation classes when motion is not reduced', () => {
    const { container } = render(<Skeleton animation="pulse" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('does not apply animation when motion is reduced', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    
    const { container } = render(<Skeleton animation="pulse" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).not.toHaveClass('animate-pulse');
  });

  it('applies custom width and height', () => {
    const { container } = render(<Skeleton width={100} height={50} />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton.style.width).toBe('100px');
    expect(skeleton.style.height).toBe('50px');
  });

  it('applies string width and height', () => {
    const { container } = render(<Skeleton width="100%" height="2rem" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('2rem');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('custom-class');
  });

  it('respects animation="none"', () => {
    const { container } = render(<Skeleton animation="none" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).not.toHaveClass('animate-pulse');
    expect(skeleton).not.toHaveClass('animate-shimmer');
  });
});

describe('SkeletonText', () => {
  it('renders correct number of lines', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const skeletons = container.querySelectorAll('[role="presentation"]');
    expect(skeletons).toHaveLength(3);
  });

  it('applies correct spacing classes', () => {
    const { container: tightContainer } = render(<SkeletonText spacing="tight" />);
    const tightWrapper = tightContainer.firstChild as HTMLElement;
    expect(tightWrapper).toHaveClass('space-y-1');

    const { container: looseContainer } = render(<SkeletonText spacing="loose" />);
    const looseWrapper = looseContainer.firstChild as HTMLElement;
    expect(looseWrapper).toHaveClass('space-y-3');
  });

  it('makes last line shorter', () => {
    const { container } = render(<SkeletonText lines={2} />);
    const skeletons = container.querySelectorAll('[role="presentation"]');
    
    const firstLine = skeletons[0] as HTMLElement;
    const lastLine = skeletons[1] as HTMLElement;
    
    expect(firstLine.style.width).toBe('100%');
    expect(lastLine.style.width).toBe('75%');
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonText className="custom-text" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-text');
  });
});

describe('SkeletonAvatar', () => {
  it('renders with default medium size', () => {
    const { container } = render(<SkeletonAvatar />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('w-10', 'h-10', 'rounded-full');
  });

  it('applies correct size classes', () => {
    const { container: smContainer } = render(<SkeletonAvatar size="sm" />);
    const smAvatar = smContainer.firstChild as HTMLElement;
    expect(smAvatar).toHaveClass('w-8', 'h-8');

    const { container: lgContainer } = render(<SkeletonAvatar size="lg" />);
    const lgAvatar = lgContainer.firstChild as HTMLElement;
    expect(lgAvatar).toHaveClass('w-12', 'h-12');

    const { container: xlContainer } = render(<SkeletonAvatar size="xl" />);
    const xlAvatar = xlContainer.firstChild as HTMLElement;
    expect(xlAvatar).toHaveClass('w-16', 'h-16');
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonAvatar className="custom-avatar" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('custom-avatar');
  });
});

describe('SkeletonCard', () => {
  it('renders basic card structure', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-6', 'border', 'border-gray-200', 'rounded-lg');
  });

  it('includes avatar when hasAvatar is true', () => {
    const { container } = render(<SkeletonCard hasAvatar={true} />);
    const avatars = container.querySelectorAll('.rounded-full');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('includes image when hasImage is true', () => {
    const { container } = render(<SkeletonCard hasImage={true} />);
    const skeletons = container.querySelectorAll('[role="presentation"]');
    
    // Should have image skeleton (first one with height 200)
    const imageSkeleton = Array.from(skeletons).find(skeleton => {
      const element = skeleton as HTMLElement;
      return element.style.height === '200px';
    });
    expect(imageSkeleton).toBeTruthy();
  });

  it('renders correct number of text lines', () => {
    const { container } = render(<SkeletonCard lines={5} />);
    // Count text skeletons (excluding avatar, buttons, etc.)
    const textSkeletons = container.querySelectorAll('[role="presentation"]');
    expect(textSkeletons.length).toBeGreaterThan(5); // Should include title + lines + buttons
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonCard className="custom-card" />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-card');
  });
});

describe('SkeletonTable', () => {
  it('renders table structure', () => {
    const { container } = render(<SkeletonTable />);
    const table = container.firstChild as HTMLElement;
    expect(table).toHaveClass('border', 'border-gray-200', 'rounded-lg');
  });

  it('includes header when hasHeader is true', () => {
    const { container } = render(<SkeletonTable hasHeader={true} />);
    const header = container.querySelector('.bg-gray-50');
    expect(header).toBeInTheDocument();
  });

  it('does not include header when hasHeader is false', () => {
    const { container } = render(<SkeletonTable hasHeader={false} />);
    const header = container.querySelector('.bg-gray-50');
    expect(header).not.toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    const { container } = render(<SkeletonTable rows={3} hasHeader={false} />);
    const rows = container.querySelectorAll('.px-6.py-4');
    expect(rows).toHaveLength(3);
  });

  it('renders correct number of columns', () => {
    const { container } = render(<SkeletonTable columns={5} rows={1} hasHeader={false} />);
    const firstRow = container.querySelector('.px-6.py-4');
    const columns = firstRow?.querySelectorAll('.flex-1');
    expect(columns).toHaveLength(5);
  });

  it('includes avatars in first column', () => {
    const { container } = render(<SkeletonTable rows={2} hasHeader={false} />);
    const avatars = container.querySelectorAll('.rounded-full');
    expect(avatars.length).toBe(2); // One avatar per row
  });
});

describe('SkeletonDashboard', () => {
  it('renders dashboard structure', () => {
    const { container } = render(<SkeletonDashboard />);
    const dashboard = container.firstChild as HTMLElement;
    expect(dashboard).toHaveClass('space-y-8');
  });

  it('includes stats cards', () => {
    const { container } = render(<SkeletonDashboard />);
    const statsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    expect(statsGrid).toBeInTheDocument();
    
    const statCards = statsGrid?.children;
    expect(statCards).toHaveLength(4);
  });

  it('includes chart sections', () => {
    const { container } = render(<SkeletonDashboard />);
    const chartGrid = container.querySelector('.grid.lg\\:grid-cols-2');
    expect(chartGrid).toBeInTheDocument();
    
    const chartCards = chartGrid?.children;
    expect(chartCards).toHaveLength(2);
  });

  it('includes content grid', () => {
    const { container } = render(<SkeletonDashboard />);
    const contentGrid = container.querySelector('.grid.lg\\:grid-cols-3');
    expect(contentGrid).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonDashboard className="custom-dashboard" />);
    const dashboard = container.firstChild as HTMLElement;
    expect(dashboard).toHaveClass('custom-dashboard');
  });
});

describe('SkeletonList', () => {
  it('renders correct number of items', () => {
    const { container } = render(<SkeletonList items={3} />);
    const listItems = container.querySelectorAll('.flex.items-center.space-x-4');
    expect(listItems).toHaveLength(3);
  });

  it('includes avatars when hasAvatar is true', () => {
    const { container } = render(<SkeletonList items={2} hasAvatar={true} />);
    const avatars = container.querySelectorAll('.rounded-full');
    expect(avatars.length).toBe(2);
  });

  it('does not include avatars when hasAvatar is false', () => {
    const { container } = render(<SkeletonList items={2} hasAvatar={false} />);
    const avatars = container.querySelectorAll('.rounded-full');
    expect(avatars.length).toBe(0);
  });

  it('includes action buttons when hasActions is true', () => {
    const { container } = render(<SkeletonList items={1} hasActions={true} />);
    const actionSection = container.querySelector('.flex.space-x-2');
    const actionButtons = actionSection?.querySelectorAll('[role="presentation"]');
    expect(actionButtons?.length).toBe(2);
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonList className="custom-list" />);
    const list = container.firstChild as HTMLElement;
    expect(list).toHaveClass('custom-list');
  });
});

describe('SkeletonForm', () => {
  it('renders correct number of fields', () => {
    const { container } = render(<SkeletonForm fields={3} />);
    const fieldGroups = container.querySelectorAll('.space-y-2');
    // Should have header + 3 fields = 4 groups
    expect(fieldGroups.length).toBeGreaterThanOrEqual(3);
  });

  it('includes submit buttons when hasSubmit is true', () => {
    const { container } = render(<SkeletonForm hasSubmit={true} />);
    const submitSection = container.querySelector('.flex.space-x-3.pt-4');
    expect(submitSection).toBeInTheDocument();
    
    const submitButtons = submitSection?.querySelectorAll('[role="presentation"]');
    expect(submitButtons?.length).toBe(2);
  });

  it('does not include submit buttons when hasSubmit is false', () => {
    const { container } = render(<SkeletonForm hasSubmit={false} />);
    const submitSection = container.querySelector('.flex.space-x-3.pt-4');
    expect(submitSection).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SkeletonForm className="custom-form" />);
    const form = container.firstChild as HTMLElement;
    expect(form).toHaveClass('custom-form');
  });
});

describe('LoadingWrapper', () => {
  const TestContent = () => <div>Actual content</div>;
  const TestSkeleton = () => <div>Loading skeleton</div>;

  it('shows skeleton when loading', () => {
    render(
      <LoadingWrapper 
        isLoading={true} 
        skeleton={<TestSkeleton />} 
        children={<TestContent />} 
      />
    );
    
    expect(screen.getByText('Loading skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Actual content')).not.toBeInTheDocument();
  });

  it('shows content when not loading', () => {
    render(
      <LoadingWrapper 
        isLoading={false} 
        skeleton={<TestSkeleton />} 
        children={<TestContent />} 
      />
    );
    
    expect(screen.getByText('Actual content')).toBeInTheDocument();
    expect(screen.queryByText('Loading skeleton')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <LoadingWrapper 
        isLoading={false} 
        skeleton={<TestSkeleton />} 
        children={<TestContent />}
        className="custom-wrapper"
      />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-wrapper');
  });

  it('transitions between loading and content states', () => {
    const { rerender } = render(
      <LoadingWrapper 
        isLoading={true} 
        skeleton={<TestSkeleton />} 
        children={<TestContent />} 
      />
    );
    
    expect(screen.getByText('Loading skeleton')).toBeInTheDocument();
    
    rerender(
      <LoadingWrapper 
        isLoading={false} 
        skeleton={<TestSkeleton />} 
        children={<TestContent />} 
      />
    );
    
    expect(screen.getByText('Actual content')).toBeInTheDocument();
    expect(screen.queryByText('Loading skeleton')).not.toBeInTheDocument();
  });
}); 