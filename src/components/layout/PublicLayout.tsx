
import React from 'react';
import Header from './Header';

interface PublicLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, showNavigation = true }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
    </div>
  );
};

export default PublicLayout;
