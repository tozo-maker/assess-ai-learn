
import React from 'react';
import Header from './Header';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, showBreadcrumbs = true }) => {
  return (
    <div className="min-h-screen flex w-full">
      {/* Desktop Sidebar */}
      <AppSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
