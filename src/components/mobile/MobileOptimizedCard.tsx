import React, { ReactNode, useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mobileOptimizationService } from '@/services/mobile-optimization';

interface MobileOptimizedCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  swipeActions?: {
    left?: { label: string; action: () => void; variant?: 'default' | 'destructive' };
    right?: { label: string; action: () => void; variant?: 'default' | 'destructive' };
  };
  onTap?: () => void;
  onLongPress?: () => void;
  collapsible?: boolean;
  priority?: 'high' | 'normal' | 'low';
  loading?: boolean;
}

export const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  title,
  children,
  className,
  swipeActions,
  onTap,
  onLongPress,
  collapsible = false,
  priority = 'normal',
  loading = false
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isLongPressed, setIsLongPressed] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let longPressTimer: NodeJS.Timeout | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      
      // Long press detection
      longPressTimer = setTimeout(() => {
        setIsLongPressed(true);
        onLongPress?.();
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, 500);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - touchStartX;
      const deltaY = currentY - touchStartY;

      // Only handle horizontal swipes if there are swipe actions
      if (swipeActions && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        e.preventDefault();
        setSwipeOffset(deltaX);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      const touchEndTime = Date.now();
      const duration = touchEndTime - touchStartTime;
      const currentX = e.changedTouches[0].clientX;
      const deltaX = currentX - touchStartX;

      // Reset long press state
      setIsLongPressed(false);

      // Handle swipe actions
      if (Math.abs(deltaX) > 100 && swipeActions) {
        if (deltaX > 0 && swipeActions.right) {
          swipeActions.right.action();
        } else if (deltaX < 0 && swipeActions.left) {
          swipeActions.left.action();
        }
      }

      // Handle tap
      if (Math.abs(deltaX) < 10 && duration < 300 && !isLongPressed) {
        if (collapsible) {
          setIsCollapsed(!isCollapsed);
        }
        onTap?.();
      }

      // Reset swipe offset
      setSwipeOffset(0);
    };

    card.addEventListener('touchstart', handleTouchStart, { passive: false });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [swipeActions, onTap, onLongPress, collapsible, isCollapsed, isLongPressed]);

  const cardStyle = {
    transform: `translateX(${swipeOffset}px)`,
    transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none'
  };

  const priorityClasses = {
    high: 'border-red-200 bg-red-50/50',
    normal: '',
    low: 'opacity-80'
  };

  return (
    <div className="relative overflow-hidden" data-critical-ui>
      {/* Swipe Action Backgrounds */}
      {swipeActions?.left && (
        <div className={cn(
          "absolute inset-y-0 right-0 flex items-center justify-end px-4 w-20",
          swipeActions.left.variant === 'destructive' ? 'bg-destructive' : 'bg-primary'
        )}>
          <span className="text-white text-sm font-medium">
            {swipeActions.left.label}
          </span>
        </div>
      )}

      {swipeActions?.right && (
        <div className={cn(
          "absolute inset-y-0 left-0 flex items-center justify-start px-4 w-20",
          swipeActions.right.variant === 'destructive' ? 'bg-destructive' : 'bg-primary'
        )}>
          <span className="text-white text-sm font-medium">
            {swipeActions.right.label}
          </span>
        </div>
      )}

      {/* Main Card */}
      <Card 
        ref={cardRef}
        className={cn(
          "relative bg-background transition-all duration-200",
          "touch-manipulation select-none",
          priorityClasses[priority],
          isLongPressed && "ring-2 ring-primary scale-105",
          loading && "animate-pulse",
          className
        )}
        style={cardStyle}
      >
        {title && (
          <CardHeader 
            className={cn(
              "pb-3",
              collapsible && "cursor-pointer"
            )}
            data-sticky-mobile={collapsible ? "true" : undefined}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold truncate pr-2">
                {title}
              </CardTitle>
              <div className="flex items-center gap-2 flex-shrink-0">
                {loading && (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                {collapsible && (
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isCollapsed && "rotate-90"
                    )}
                  />
                )}
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
        )}

        <CardContent 
          className={cn(
            "transition-all duration-300",
            collapsible && isCollapsed && "max-h-0 overflow-hidden p-0"
          )}
        >
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Mobile-specific table component
interface MobileTableProps {
  data: any[];
  columns: { key: string; label: string; render?: (value: any, row: any) => ReactNode }[];
  onRowTap?: (row: any) => void;
  loading?: boolean;
}

export const MobileTable: React.FC<MobileTableProps> = ({
  data,
  columns,
  onRowTap,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <MobileOptimizedCard key={i} loading={true}>
            <div />
          </MobileOptimizedCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3" data-vertical-scroll-only>
      {data.map((row, index) => (
        <MobileOptimizedCard
          key={index}
          onTap={() => onRowTap?.(row)}
          className="p-0"
        >
          <div className="p-4 space-y-2">
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {column.label}
                </span>
                <div className="text-sm font-medium text-right max-w-[60%] truncate">
                  {column.render 
                    ? column.render(row[column.key], row)
                    : row[column.key]
                  }
                </div>
              </div>
            ))}
          </div>
        </MobileOptimizedCard>
      ))}
    </div>
  );
};

// Mobile-optimized list component
interface MobileListProps {
  items: Array<{
    id: string | number;
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    action?: ReactNode;
    meta?: string;
  }>;
  onItemTap?: (item: any) => void;
  virtualScrolling?: boolean;
}

export const MobileList: React.FC<MobileListProps> = ({
  items,
  onItemTap,
  virtualScrolling = false
}) => {
  return (
    <div 
      className="space-y-2" 
      data-virtual-scroll={virtualScrolling ? "true" : undefined}
    >
      {items.map((item, index) => (
        <MobileOptimizedCard
          key={item.id}
          onTap={() => onItemTap?.(item)}
          className="p-0"
        >
          <div className="flex items-center p-4 gap-3">
            {item.icon && (
              <div className="flex-shrink-0">
                {item.icon}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title}</p>
              {item.subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {item.subtitle}
                </p>
              )}
            </div>

            <div className="flex-shrink-0 flex items-center gap-2">
              {item.meta && (
                <span className="text-xs text-muted-foreground">
                  {item.meta}
                </span>
              )}
              {item.action || <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </MobileOptimizedCard>
      ))}
      
      {virtualScrolling && (
        <div data-scroll-sentinel className="h-1" />
      )}
    </div>
  );
};