
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import Header from './Header';
import { BulkOperationsProvider } from '@/components/bulk/BulkOperationsProvider';
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <RealtimeProvider>
      <BulkOperationsProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BulkOperationsProvider>
    </RealtimeProvider>
  );
};

export default AppLayout;
