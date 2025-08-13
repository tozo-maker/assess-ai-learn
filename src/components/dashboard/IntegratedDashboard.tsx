
import React from 'react';
import { PerformanceResult } from '@/services/dashboard-performance-service';
import EnhancedDashboardContent from './EnhancedDashboardContent';
import EnhancedWelcomeSection from './EnhancedWelcomeSection';
import ResponsiveDashboardWrapper from './ResponsiveDashboardWrapper';
import { ValidationProvider } from '@/components/validation/FormValidationProvider';
import { useSEO } from '@/hooks/useSEO';

interface IntegratedDashboardProps {
  data: PerformanceResult<any>;
}

const IntegratedDashboard: React.FC<IntegratedDashboardProps> = ({ data }) => {
  const dashboardData = data?.data || data;
  const teacher = dashboardData?.teacher || { full_name: 'Teacher', firstName: 'Teacher' };
  const metrics = dashboardData?.metrics || {};

  const contextualInfo = {
    totalStudents: metrics.totalStudents || 0,
    activeAssessments: metrics.totalAssessments || 0,
    upcomingDeadlines: metrics.studentsNeedingAttention || 0,
    recentInsights: metrics.todaysInsights || 0
  };

  useSEO({
    title: 'Dashboard | LearnSpark AI',
    description: 'Teacher dashboard for student performance insights and actionable recommendations.',
    canonicalPath: '/app/dashboard'
  });

  return (
    <ValidationProvider>
      <ResponsiveDashboardWrapper>
        {/* Enhanced Welcome Section with contextual information */}
        <EnhancedWelcomeSection 
          teacher={teacher}
          contextualInfo={contextualInfo}
        />
        
        {/* Enhanced Dashboard Content with all Phase 1 & 2 improvements */}
        <EnhancedDashboardContent data={data} />
      </ResponsiveDashboardWrapper>
    </ValidationProvider>
  );
};

export default IntegratedDashboard;
