
import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

const DashboardBreadcrumbs: React.FC = () => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground px-4 sm:px-6 lg:px-8 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center">
        <Home className="h-4 w-4" />
        <span className="ml-2 font-medium text-foreground">Dashboard</span>
      </div>
      <ChevronRight className="h-4 w-4" />
      <span>Overview</span>
    </nav>
  );
};

export default DashboardBreadcrumbs;
