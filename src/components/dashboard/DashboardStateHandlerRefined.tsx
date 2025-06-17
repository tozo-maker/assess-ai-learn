
import React from 'react';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState';
import DashboardContentRefined from '@/components/dashboard/DashboardContentRefined';
import ErrorState from '@/components/common/ErrorState';
import { DSPageContainer } from '@/components/ui/design-system';

interface DashboardStateHandlerRefinedProps {
  isInitialLoading: boolean;
  error: any;
  data: any;
  isEmpty: boolean;
  refetch: () => void;
}

const DashboardStateHandlerRefined: React.FC<DashboardStateHandlerRefinedProps> = ({
  isInitialLoading,
  error,
  data,
  isEmpty,
  refetch
}) => {
  console.log('DashboardStateHandlerRefined render:', { 
    isInitialLoading, 
    error: !!error, 
    isEmpty, 
    hasData: !!data,
    studentsCount: data?.students?.length 
  });

  // Show loading state for initial load
  if (isInitialLoading) {
    console.log('Showing refined loading state');
    return <DashboardLoadingState />;
  }

  // Show error state with recovery options
  if (error || !data) {
    console.log('Showing refined error state:', error?.message || 'No data');
    return (
      <DSPageContainer>
        <ErrorState
          error={error}
          title="Unable to Load Dashboard"
          description="We're having trouble loading your dashboard data. Please check your connection and try again."
          onRetry={refetch}
        />
      </DSPageContainer>
    );
  }

  // Show empty state if no students
  if (isEmpty) {
    console.log('Showing refined empty state - no students');
    return <DashboardEmptyState teacher={data.teacher} />;
  }

  // Show refined dashboard with enhanced features
  console.log('Showing refined dashboard content with enhanced features');
  return <DashboardContentRefined data={data} />;
};

export default DashboardStateHandlerRefined;
