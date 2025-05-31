
import React from 'react';
import Header from './Header';
import AppSidebar from './AppSidebar';
import { DSPageContainer } from '@/components/ui/design-system';

interface AppLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, showBreadcrumbs = true }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Desktop Sidebar */}
      <AppSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <DSPageContainer>
            {children}
          </DSPageContainer>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
