
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSContentGrid,
  DSGridItem,
  DSPageContainer,
  DSSection
} from '@/components/ui/design-system';

const DashboardLoadingState: React.FC = () => {
  return (
    <DSSection>
      <DSPageContainer>
        {/* Welcome Section Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-80 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <DSContentGrid cols={3} className="mb-8">
          {[1, 2, 3].map((i) => (
            <DSGridItem key={i} span={1}>
              <DSCard>
                <DSCardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                  </div>
                </DSCardContent>
              </DSCard>
            </DSGridItem>
          ))}
        </DSContentGrid>

        {/* Main Content Grid Skeleton */}
        <DSContentGrid cols={3}>
          <DSGridItem span={2}>
            <DSCard>
              <DSCardHeader>
                <Skeleton className="h-6 w-48" />
              </DSCardHeader>
              <DSCardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </DSCardContent>
            </DSCard>
          </DSGridItem>
          
          <DSGridItem span={1}>
            <div className="space-y-6">
              <DSCard>
                <DSCardHeader>
                  <Skeleton className="h-6 w-40" />
                </DSCardHeader>
                <DSCardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                </DSCardContent>
              </DSCard>
              
              <DSCard>
                <DSCardHeader>
                  <Skeleton className="h-6 w-44" />
                </DSCardHeader>
                <DSCardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-5 w-10 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </DSCardContent>
              </DSCard>
            </div>
          </DSGridItem>
        </DSContentGrid>
      </DSPageContainer>
    </DSSection>
  );
};

export default DashboardLoadingState;
