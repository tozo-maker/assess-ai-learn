
import React from 'react';
import AppLayout from './AppLayout';
import Breadcrumbs from '../navigation/Breadcrumbs';

interface StandardPageLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  className?: string;
}

const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  children,
  showBreadcrumbs = true,
  className = ''
}) => {
  return (
    <AppLayout>
      {showBreadcrumbs && <Breadcrumbs />}
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {children}
      </div>
    </AppLayout>
  );
};

export default StandardPageLayout;
