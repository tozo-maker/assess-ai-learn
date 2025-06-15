
import React from 'react';
import Header from '@/components/layout/Header';
import AppSidebar from '@/components/layout/AppSidebar';
import FloatingActionButton from '@/components/layout/FloatingActionButton';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Sidebar - hidden on mobile */}
      <AppSidebar />
      
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="md:ml-64 pt-16 md:pt-0">
        {children}
      </main>

      {/* Floating Action Button - mobile only */}
      <FloatingActionButton />
    </div>
  );
};

export default AppLayout;
