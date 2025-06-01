
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
    <>
      {/* Desktop Sidebar */}
      <AppSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8 bg-gray-50">
          <DSPageContainer>
            {children}
          </DSPageContainer>
        </main>
      </div>
    </>
  );
};

export default AppLayout;
