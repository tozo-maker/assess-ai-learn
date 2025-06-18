
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  className = ''
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "w-full",
      isMobile ? "px-4 py-4" : "px-6 py-6",
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 6,
  className = ''
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={cn(
      'grid',
      `grid-cols-${cols.mobile || 1}`,
      `sm:grid-cols-${cols.tablet || 2}`,
      `lg:grid-cols-${cols.desktop || 3}`,
      gapClasses[gap as keyof typeof gapClasses] || 'gap-6',
      className
    )}>
      {children}
    </div>
  );
};

interface MobileStackProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileStack: React.FC<MobileStackProps> = ({ children, className = '' }) => {
  return (
    <div className={cn(
      "flex flex-col space-y-4",
      "sm:flex-row sm:space-y-0 sm:space-x-4",
      className
    )}>
      {children}
    </div>
  );
};

export default MobileOptimizedLayout;
