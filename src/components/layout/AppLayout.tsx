
import React from 'react';
import Header from './Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, showBreadcrumbs = true }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 py-8 px-6 md:px-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
