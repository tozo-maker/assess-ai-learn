
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import ProductionErrorBoundary from '@/components/common/ProductionErrorBoundary';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import UniversalSearch from '@/components/search/UniversalSearch';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { signOut, user } = useAuth();

  return (
    <ProductionErrorBoundary>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          {/* Top Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <UniversalSearch />
            </div>
            
            {/* User Actions */}
            <div className="flex items-center gap-4">
              <NotificationCenter />
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            {children || <Outlet />}
          </main>
        </SidebarInset>
      </div>
    </ProductionErrorBoundary>
  );
};

export default AppLayout;
