
import React from 'react';
import DashboardStatsRedesigned from './DashboardStatsRedesigned';
import PerformanceSection from './PerformanceSection';
import DashboardPerformanceWidget from './DashboardPerformanceWidget';
import AIAnalysisStatusCard from './AIAnalysisStatusCard';
import PerformanceMetricsWidget from './PerformanceMetricsWidget';
import {
  DSSection,
  DSContentGrid,
  DSGridItem
} from '@/components/ui/design-system';

interface EnhancedDashboardContentProps {
  data: any;
}

const EnhancedDashboardContent: React.FC<EnhancedDashboardContentProps> = ({ data }) => {
  const dashboardData = data?.data || data;
  
  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <DashboardStatsRedesigned
        totalStudents={dashboardData?.metrics?.totalStudents || 0}
        totalAssessments={dashboardData?.metrics?.totalAssessments || 0}
        aiInsights={dashboardData?.metrics?.aiInsights || 0}
        recentAssessments={dashboardData?.metrics?.recentAssessments || 0}
        newStudentsThisMonth={dashboardData?.metrics?.newStudentsThisMonth || 0}
        todaysInsights={dashboardData?.metrics?.todaysInsights || 0}
        studentMetrics={dashboardData?.metrics?.studentMetrics}
      />

      {/* Performance Overview */}
      <PerformanceSection
        assessments={dashboardData?.assessments || []}
        studentMetrics={dashboardData?.metrics?.studentMetrics}
      />

      {/* System Status and AI Analysis */}
      <DSSection>
        <DSContentGrid cols={3}>
          <DSGridItem span={1}>
            <DashboardPerformanceWidget />
          </DSGridItem>
          <DSGridItem span={1}>
            <PerformanceMetricsWidget />
          </DSGridItem>
          <DSGridItem span={1}>
            <AIAnalysisStatusCard />
          </DSGridItem>
        </DSContentGrid>
      </DSSection>
    </div>
  );
};

export default EnhancedDashboardContent;
