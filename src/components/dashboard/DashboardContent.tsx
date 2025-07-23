
import React from 'react';
import { PerformanceResult } from '@/services/dashboard-performance-service';
import IntegratedDashboard from './IntegratedDashboard';
import { ValidationProvider } from '@/components/validation/FormValidationProvider';

interface DashboardContentProps {
  data: PerformanceResult<any>;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ data }) => {
  return (
    <ValidationProvider>
      <IntegratedDashboard data={data} />
    </ValidationProvider>
  );
};

export default DashboardContent;
