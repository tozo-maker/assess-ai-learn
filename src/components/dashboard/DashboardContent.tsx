
import React from 'react';
import { PerformanceResult } from '@/services/dashboard-performance-service';
import EnhancedDashboardContent from './EnhancedDashboardContent';
import DashboardWelcome from './DashboardWelcome';
import { ValidationProvider } from '@/components/validation/FormValidationProvider';

interface DashboardContentProps {
  data: PerformanceResult<any>;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ data }) => {
  const dashboardData = data?.data || data;
  const teacherName = dashboardData?.teacher?.full_name || dashboardData?.teacher?.firstName || 'Teacher';

  return (
    <ValidationProvider>
      <div className="space-y-6">
        <DashboardWelcome teacherName={teacherName} />
        <EnhancedDashboardContent data={data} />
      </div>
    </ValidationProvider>
  );
};

export default DashboardContent;
