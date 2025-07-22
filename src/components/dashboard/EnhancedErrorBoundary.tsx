import React from 'react';
import UnifiedErrorBoundary from '@/components/common/UnifiedErrorBoundary';
import { enhancedDashboardMetricsService } from '@/services/enhanced-dashboard-metrics';
import { errorService } from '@/services/error-service';

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  componentName: string;
  fallback?: React.ComponentType<{ error: Error; retry: () => void; reset: () => void }>;
}

const EnhancedErrorBoundary: React.FC<EnhancedErrorBoundaryProps> = ({ 
  children, 
  componentName, 
  fallback 
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to enhanced error service with context
    errorService.logError(componentName, error, {
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
    
    // Additional logging for dashboard components
    if (componentName.includes('Dashboard')) {
      console.error('Dashboard Component Error:', {
        component: componentName,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <UnifiedErrorBoundary
      componentName={componentName}
      severity="HIGH"
      allowRetry={true}
      allowReset={true}
      allowReload={false}
      onError={handleError}
      fallback={fallback}
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </UnifiedErrorBoundary>
  );
};

export default EnhancedErrorBoundary;