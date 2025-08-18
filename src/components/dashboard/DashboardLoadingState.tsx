
import React from 'react';
import { PageLoader } from '@/components/common/UnifiedLoading';

const DashboardLoadingState: React.FC = () => {
  return <PageLoader message="Loading your dashboard..." />;
};

export default DashboardLoadingState;
