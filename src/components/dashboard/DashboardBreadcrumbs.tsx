
import React from 'react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const DashboardBreadcrumbs: React.FC = () => {
  return (
    <div className="py-3 border-b border-border/50 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
      </div>
    </div>
  );
};

export default DashboardBreadcrumbs;
