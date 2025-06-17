
import React from 'react';
import {
  DSSection,
  DSPageContainer,
  DSContentGrid,
  DSGridItem,
  DSSpacer,
  DSSectionHeader
} from '@/components/ui/design-system';

interface OptimizedDashboardLayoutProps {
  welcomeSection: React.ReactNode;
  alertsSection?: React.ReactNode;
  quickActions: React.ReactNode;
  metricsOverview: React.ReactNode;
  activityAndInsights: React.ReactNode;
  additionalTools: React.ReactNode;
}

const OptimizedDashboardLayout: React.FC<OptimizedDashboardLayoutProps> = ({
  welcomeSection,
  alertsSection,
  quickActions,
  metricsOverview,
  activityAndInsights,
  additionalTools
}) => {
  return (
    <DSSection>
      <DSPageContainer>
        {/* Welcome Section */}
        {welcomeSection}
        <DSSpacer size="xl" />

        {/* Critical Alerts */}
        {alertsSection && (
          <>
            {alertsSection}
            <DSSpacer size="xl" />
          </>
        )}

        {/* Quick Actions + Key Metrics Split */}
        <DSContentGrid cols={3}>
          <DSGridItem span={1}>
            {quickActions}
          </DSGridItem>
          <DSGridItem span={2}>
            <div>
              <DSSectionHeader className="mb-6">Performance Overview</DSSectionHeader>
              {metricsOverview}
            </div>
          </DSGridItem>
        </DSContentGrid>

        <DSSpacer size="2xl" />

        {/* Main Content - Activity & Insights */}
        <div>
          <DSSectionHeader className="mb-6">Recent Activity & AI Insights</DSSectionHeader>
          {activityAndInsights}
        </div>

        <DSSpacer size="2xl" />

        {/* Additional Tools */}
        <div>
          <DSSectionHeader className="mb-6">Additional Tools</DSSectionHeader>
          {additionalTools}
        </div>

        <DSSpacer size="3xl" />
      </DSPageContainer>
    </DSSection>
  );
};

export default OptimizedDashboardLayout;
