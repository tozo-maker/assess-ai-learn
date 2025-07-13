
import React from 'react';
import UnifiedErrorBoundary from '@/components/common/UnifiedErrorBoundary';

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

const DashboardErrorBoundary: React.FC<DashboardErrorBoundaryProps> = (props) => {
  return (
    <UnifiedErrorBoundary
      componentName="Dashboard"
      severity="HIGH"
      allowRetry={true}
      allowReset={true}
      allowReload={true}
      {...props}
    />
  );
};

export default DashboardErrorBoundary;
