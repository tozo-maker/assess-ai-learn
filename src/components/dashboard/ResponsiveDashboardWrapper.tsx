
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveDashboardWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDashboardWrapper: React.FC<ResponsiveDashboardWrapperProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      "min-h-screen bg-background",
      "px-4 sm:px-6 lg:px-8 py-6 lg:py-8",
      "max-w-7xl mx-auto",
      className
    )}>
      <div className="space-y-6 lg:space-y-8">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveDashboardWrapper;
