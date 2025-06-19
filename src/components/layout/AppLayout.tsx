
import React from 'react';
import { Outlet } from 'react-router-dom';
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
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
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
            </div>
          </header>
          
          {/* Page Content */}
          <main className="p-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </ProductionErrorBoundary>
  );
};

export default AppLayout;
