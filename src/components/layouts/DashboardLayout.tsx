
import React from 'react';
import {
  DSPageContainer,
  DSSection,
  DSSpacer,
  DSPageTitle,
  DSBodyText,
  DSContentGrid
} from '@/components/ui/design-system';

interface DashboardLayoutProps {
  welcomeMessage?: string;
  userName?: string;
  children: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  welcomeMessage,
  userName,
  children,
  className = ''
}) => {
  const defaultWelcome = userName ? `Welcome back, ${userName}! 👋` : 'Welcome to your dashboard! 👋';
  const greeting = welcomeMessage || defaultWelcome;

  return (
    <DSSection className={className}>
      <DSPageContainer>
        {/* Welcome Section */}
        <div className="mb-8">
          <DSPageTitle>{greeting}</DSPageTitle>
          <DSBodyText className="mt-2 text-gray-600">
            Here's what's happening with your students today.
          </DSBodyText>
        </div>

        <DSSpacer size="lg" />

        {/* Dashboard Widgets Grid */}
        <div className="space-y-6">
          {children}
        </div>
      </DSPageContainer>
    </DSSection>
  );
};

// Widget Container for consistent styling
interface DashboardWidgetProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  children,
  className = '',
  cols = 1
}) => {
  const colClasses = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-4'
  };

  return (
    <div className={`${colClasses[cols]} ${className}`}>
      {children}
    </div>
  );
};

// Grid container for dashboard widgets
export const DashboardGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DSContentGrid cols={12} className="gap-6">
      {children}
    </DSContentGrid>
  );
};

export default DashboardLayout;
