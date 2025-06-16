
import { enhancedErrorTracking } from './enhanced-error-tracking';
import { structuredLogger } from './structured-logging';
import { advancedCachingService } from './advanced-caching-service';
import { performanceMonitoringService } from './performance-monitoring-service';

interface MonitoringConfig {
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableCaching: boolean;
  enableResourceOptimization: boolean;
}

class MonitoringIntegration {
  private config: MonitoringConfig = {
    enablePerformanceTracking: false, // Disabled to prevent interference
    enableErrorTracking: false,       // Disabled to prevent interference
    enableCaching: false,             // Disabled to prevent interference
    enableResourceOptimization: false // Disabled to prevent interference
  };

  private isInitialized = false;

  async initialize() {
    // Skip initialization completely to prevent interference with landing page
    console.log('Monitoring services disabled to prevent landing page interference');
    return;
  }

  getStatus() {
    return {
      initialized: false,
      services: {
        errorTracking: false,
        structuredLogging: false,
        advancedCaching: false,
        performanceMonitoring: false
      }
    };
  }

  private shouldInitialize(): boolean {
    return false; // Always return false to keep services disabled
  }
}

const monitoringIntegration = new MonitoringIntegration();

// Don't auto-initialize to prevent interference
export { monitoringIntegration };
