
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

        {/* Priority Alerts + Quick Actions Split */}
        <DSContentGrid cols={2}>
          <DSGridItem span={1}>
            {alertsSection}
          </DSGridItem>
          <DSGridItem span={1}>
            {quickActions}
          </DSGridItem>
        </DSContentGrid>

        <DSSpacer size="xl" />

        {/* Performance Overview - Full Width */}
        <div>
          <DSSectionHeader className="mb-6">Performance Overview</DSSectionHeader>
          {metricsOverview}
        </div>

        <DSSpacer size="2xl" />

        {/* Main Content - Activity, Additional Tools & Insights */}
        <div>
          <DSSectionHeader className="mb-6">Recent Activity & AI Insights</DSSectionHeader>
          <DSContentGrid cols={3}>
            <DSGridItem span={1}>
              {/* Recent Activity Feed goes here */}
              {React.cloneElement(activityAndInsights as React.ReactElement, { 
                renderActivityOnly: true 
              })}
            </DSGridItem>
            <DSGridItem span={1}>
              {/* AI Insights goes here */}
              {React.cloneElement(activityAndInsights as React.ReactElement, { 
                renderInsightsOnly: true 
              })}
            </DSGridItem>
            <DSGridItem span={1}>
              {/* Additional Tools moved here */}
              {additionalTools}
            </DSGridItem>
          </DSContentGrid>
        </div>

        <DSSpacer size="3xl" />
      </DSPageContainer>
    </DSSection>
  );
};

export default OptimizedDashboardLayout;
