
import React from 'react';
import Header from './Header';
import Navigation from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, showBreadcrumbs = true }) => {
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Desktop Navigation Sidebar */}
      <div className="hidden md:block">
        <Navigation />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <Header />
        <main className="flex-1 py-8 px-6 md:px-8 mb-16 md:mb-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
