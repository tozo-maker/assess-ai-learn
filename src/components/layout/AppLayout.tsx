
import React from 'react';
import Header from './Header';
import AppSidebar from './AppSidebar';

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
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
