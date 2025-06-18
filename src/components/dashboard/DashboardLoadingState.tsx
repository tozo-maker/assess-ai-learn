
import React from 'react';
import UniversalLoadingState from '@/components/common/UniversalLoadingState';

const DashboardLoadingState: React.FC = () => {
  return <UniversalLoadingState type="dashboard" message="Loading your dashboard..." />;
};

export default DashboardLoadingState;
