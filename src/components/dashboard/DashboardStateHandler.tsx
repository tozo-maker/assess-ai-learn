
import React from 'react';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState';
import DashboardContent from '@/components/dashboard/DashboardContent';
import ErrorState from '@/components/common/ErrorState';
import { DSPageContainer } from '@/components/ui/design-system';

interface DashboardStateHandlerProps {
  isInitialLoading: boolean;
  error: any;
  data: any;
  isEmpty: boolean;
  refetch: () => void;
}

const DashboardStateHandler: React.FC<DashboardStateHandlerProps> = ({
  isInitialLoading,
  error,
  data,
  isEmpty,
  refetch
}) => {
  console.log('DashboardStateHandler render:', { 
    isInitialLoading, 
    error: !!error, 
    isEmpty, 
    hasData: !!data,
    studentsCount: data?.students?.length 
  });

  // Show loading state for initial load
  if (isInitialLoading) {
    console.log('Showing loading state');
    return <DashboardLoadingState />;
  }

  // Show error state with recovery options
  if (error || !data) {
    console.log('Showing error state:', error?.message || 'No data');
    return (
      <DSPageContainer>
        <ErrorState
          error={error}
          title="Failed to load dashboard"
          description="There was an error loading your dashboard data. Please try again."
          onRetry={refetch}
        />
      </DSPageContainer>
    );
  }

  // Show empty state if no students
  if (isEmpty) {
    console.log('Showing empty state - no students');
    return <DashboardEmptyState teacher={data.teacher} />;
  }

  // Show dashboard with data - remove the data prop since DashboardContent doesn't accept it
  console.log('Showing dashboard content with data');
  return <DashboardContent />;
};

export default DashboardStateHandler;
