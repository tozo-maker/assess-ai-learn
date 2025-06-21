
import React from 'react';
import PublicHeader from './PublicHeader';

interface PublicLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, showNavigation = true }) => {
  return (
    <div className="min-h-screen bg-white">
      {showNavigation && <PublicHeader />}
      {children}
    </div>
  );
};

export default PublicLayout;
