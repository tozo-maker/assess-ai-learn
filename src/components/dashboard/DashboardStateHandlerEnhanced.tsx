
import React from 'react';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState';
import DashboardContentEnhanced from '@/components/dashboard/DashboardContentEnhanced';
import ErrorState from '@/components/common/ErrorState';
import { DSPageContainer } from '@/components/ui/design-system';

interface DashboardStateHandlerEnhancedProps {
  isInitialLoading: boolean;
  error: any;
  data: any;
  isEmpty: boolean;
  refetch: () => void;
}

const DashboardStateHandlerEnhanced: React.FC<DashboardStateHandlerEnhancedProps> = ({
  isInitialLoading,
  error,
  data,
  isEmpty,
  refetch
}) => {
  console.log('DashboardStateHandlerEnhanced render:', { 
    isInitialLoading, 
    error: !!error, 
    isEmpty, 
    hasData: !!data,
    studentsCount: data?.students?.length 
  });

  // Show loading state for initial load
  if (isInitialLoading) {
    console.log('Showing enhanced loading state');
    return <DashboardLoadingState />;
  }

  // Show error state with recovery options
  if (error || !data) {
    console.log('Showing enhanced error state:', error?.message || 'No data');
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
    console.log('Showing enhanced empty state - no students');
    return <DashboardEmptyState teacher={data.teacher} />;
  }

  // Show enhanced dashboard with data
  console.log('Showing enhanced dashboard content with data');
  return <DashboardContentEnhanced data={data} />;
};

export default DashboardStateHandlerEnhanced;
