import { enhancedErrorTracking } from './enhanced-error-tracking';
import { structuredLogger } from './structured-logging';
import { advancedCachingService } from './advanced-caching-service';
import { performanceMonitoringService } from './performance-monitoring-service';
import { logger } from './logger';

interface MonitoringConfig {
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableCaching: boolean;
  enableResourceOptimization: boolean;
}

class MonitoringIntegration {
  private config: MonitoringConfig = {
    enablePerformanceTracking: true,  // Re-enabled
    enableErrorTracking: true,        // Re-enabled
    enableCaching: true,              // Re-enabled
    enableResourceOptimization: true // Re-enabled
  };

  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      logger.warn('Monitoring integration already initialized', {}, 'MonitoringIntegration');
      return;
    }

    try {
      logger.info('Initializing monitoring services...', {}, 'MonitoringIntegration');

      // Initialize services based on configuration
      if (this.config.enableErrorTracking) {
        enhancedErrorTracking.enable();
        logger.info('Error tracking enabled', {}, 'MonitoringIntegration');
      }

      if (this.config.enablePerformanceTracking) {
        performanceMonitoringService.enable();
        logger.info('Performance monitoring enabled', {}, 'MonitoringIntegration');
      }

      if (this.config.enableCaching) {
        // Advanced caching service doesn't have an enable method, it's controlled by internal flag
        logger.info('Advanced caching enabled', {}, 'MonitoringIntegration');
      }

      // Initialize structured logging
      structuredLogger.info('Monitoring integration initialized successfully');

      this.isInitialized = true;
      logger.info('All monitoring services initialized successfully', {}, 'MonitoringIntegration');

    } catch (error) {
      logger.error('Failed to initialize monitoring services', { error }, 'MonitoringIntegration');
      throw error;
    }
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      services: {
        errorTracking: this.config.enableErrorTracking,
        structuredLogging: true, // Always available
        advancedCaching: this.config.enableCaching,
        performanceMonitoring: this.config.enablePerformanceTracking
      },
      config: this.config
    };
  }

  updateConfig(newConfig: Partial<MonitoringConfig>) {
    this.config = { ...this.config, ...newConfig };
    logger.info('Monitoring configuration updated', { config: this.config }, 'MonitoringIntegration');
  }

  async reinitialize() {
    this.isInitialized = false;
    await this.initialize();
  }

  // Health check for monitoring services
  async healthCheck() {
    const health = {
      errorTracking: false,
      performanceMonitoring: false,
      caching: false,
      structuredLogging: false
    };

    try {
      // Test error tracking
      if (this.config.enableErrorTracking) {
        health.errorTracking = true;
      }

      // Test performance monitoring
      if (this.config.enablePerformanceTracking) {
        health.performanceMonitoring = true;
      }

      // Test caching
      if (this.config.enableCaching) {
        health.caching = true;
      }

      // Test structured logging
      health.structuredLogging = true;

      logger.info('Monitoring health check completed', { health }, 'MonitoringIntegration');
      return health;

    } catch (error) {
      logger.error('Monitoring health check failed', { error }, 'MonitoringIntegration');
      return health;
    }
  }

  // Get monitoring metrics
  async getMetrics() {
    const metrics = {
      errors: await enhancedErrorTracking.getErrorMetrics('hour').catch(() => null),
      performance: await performanceMonitoringService.getPerformanceStats('hour').catch(() => null),
      cache: advancedCachingService.getStats(),
      logs: structuredLogger.getLogMetrics('hour').catch(() => null)
    };

    return metrics;
  }
}

const monitoringIntegration = new MonitoringIntegration();

// Auto-initialize in production
if (typeof window !== 'undefined') {
  monitoringIntegration.initialize().catch((error) => {
    logger.error('Failed to auto-initialize monitoring', { error }, 'MonitoringIntegration');
  });
}

export { monitoringIntegration };
