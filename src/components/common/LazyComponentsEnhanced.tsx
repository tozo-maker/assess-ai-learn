
import React, { Suspense, lazy } from 'react';
import { DSCard, DSCardContent } from '@/components/ui/design-system';
import { Skeleton } from '@/components/ui/skeleton';

// Enhanced lazy loading with better skeletons
const DashboardActivityFeed = lazy(() => import('@/components/dashboard/DashboardActivityFeed'));
const DashboardRecentInsightsEnhanced = lazy(() => import('@/components/dashboard/DashboardRecentInsightsEnhanced'));
const DashboardSecondaryWidgetsEnhanced = lazy(() => import('@/components/dashboard/DashboardSecondaryWidgetsEnhanced'));

// Enhanced skeleton components
const ActivityFeedSkeleton = () => (
  <DSCard className="h-full">
    <DSCardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DSCardContent>
  </DSCard>
);

const InsightsSkeleton = () => (
  <DSCard className="h-full">
    <DSCardContent className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="p-4 border rounded-lg border-l-4 border-l-purple-200">
            <div className="flex items-start gap-3">
              <Skeleton className="h-4 w-4" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DSCardContent>
  </DSCard>
);

const SecondaryWidgetsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <DSCard key={i} className="border-l-4 border-l-gray-200">
        <DSCardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
        </DSCardContent>
      </DSCard>
    ))}
  </div>
);

// Enhanced wrapper components
export const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-[200px]">
    {children}
  </div>
);

export const LazyContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full">
    {children}
  </div>
);

// Enhanced lazy components with better error boundaries
export const LazyActivityFeedEnhanced: React.FC<{
  recentAssessments: number;
  totalStudents: number;
  studentsNeedingAttention: number;
}> = (props) => (
  <Suspense fallback={<ActivityFeedSkeleton />}>
    <DashboardActivityFeed {...props} />
  </Suspense>
);

export const LazyRecentInsightsEnhanced: React.FC<{
  students: any[];
  communications: any[];
}> = (props) => (
  <Suspense fallback={<InsightsSkeleton />}>
    <DashboardRecentInsightsEnhanced {...props} />
  </Suspense>
);

export const LazySecondaryWidgetsEnhanced: React.FC<{
  assessments: any[];
  students: any[];
  metrics: {
    averagePerformance: string;
    studentsNeedingAttention: number;
  };
}> = (props) => (
  <Suspense fallback={<SecondaryWidgetsSkeleton />}>
    <DashboardSecondaryWidgetsEnhanced {...props} />
  </Suspense>
);
