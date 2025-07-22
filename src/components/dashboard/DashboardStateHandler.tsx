
import React from 'react';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { EnhancedErrorState } from '@/components/common/EnhancedErrorStates';
import { DSPageContainer } from '@/components/ui/design-system';

interface DashboardStateHandlerProps {
  isInitialLoading: boolean;
  error: Error | null;
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
  // Show loading state for initial load
  if (isInitialLoading) {
    return <DashboardLoadingState />;
  }

  // Show error state with recovery options
  if (error || !data) {
    return (
      <DSPageContainer>
        <EnhancedErrorState
          type="network"
          title="Failed to load dashboard"
          message="There was an error loading your dashboard data. Please try again."
          details={error?.message || 'Unknown error occurred'}
          actions={[
            {
              label: 'Retry',
              onClick: refetch,
              variant: 'default'
            }
          ]}
        />
      </DSPageContainer>
    );
  }

  // Show empty state if no students
  if (isEmpty) {
    return <DashboardEmptyState teacher={data.teacher} />;
  }

  // Show dashboard with data
  return <DashboardContent data={data} />;
};

export default DashboardStateHandler;
