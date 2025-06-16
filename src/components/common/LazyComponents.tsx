
import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Lazy loading with error boundaries
const LazyActivityFeed = lazy(() => import('@/components/dashboard/DashboardActivityFeed'));
const LazyRecentInsights = lazy(() => import('@/components/dashboard/DashboardRecentInsights'));
const LazySecondaryWidgets = lazy(() => import('@/components/dashboard/DashboardSecondaryWidgets'));

// Error boundary component for lazy loaded components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Unable to load this section. Please refresh the page.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Loading skeleton for lazy components
const LazyLoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-48" />
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Wrapper components
export const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LazyErrorBoundary>
    <Suspense fallback={<LazyLoadingSkeleton />}>
      {children}
    </Suspense>
  </LazyErrorBoundary>
);

export const LazyContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-0">
    {children}
  </div>
);

// Export lazy components with proper error handling
export { LazyActivityFeed, LazyRecentInsights, LazySecondaryWidgets };
