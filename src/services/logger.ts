type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  source?: string;
}

class Logger {
  private isDevelopment: boolean;
  private enabledLevels: Set<LogLevel>;
  private logQueue: LogEntry[] = [];
  private maxQueueSize = 100;

  constructor() {
    this.isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
    this.enabledLevels = new Set(this.isDevelopment ? ['debug', 'info', 'warn', 'error'] : ['warn', 'error']);
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLevels.has(level);
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>, source?: string): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      source
    };
  }

  private addToQueue(entry: LogEntry): void {
    this.logQueue.push(entry);
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue.shift(); // Remove oldest entry
    }
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;
    const source = entry.source ? ` [${entry.source}]` : '';
    return `${prefix}${source}: ${entry.message}`;
  }

  debug(message: string, context?: Record<string, unknown>, source?: string): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', message, context, source);
    this.addToQueue(entry);
    
    if (this.isDevelopment) {
      console.debug(this.formatMessage(entry), context || '');
    }
  }

  info(message: string, context?: Record<string, unknown>, source?: string): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', message, context, source);
    this.addToQueue(entry);
    
    if (this.isDevelopment) {
      console.info(this.formatMessage(entry), context || '');
    }
  }

  warn(message: string, context?: Record<string, unknown>, source?: string): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', message, context, source);
    this.addToQueue(entry);
    
    console.warn(this.formatMessage(entry), context || '');
  }

  error(message: string, context?: Record<string, unknown>, source?: string): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.createLogEntry('error', message, context, source);
    this.addToQueue(entry);
    
    console.error(this.formatMessage(entry), context || '');
  }

  // Performance logging
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Cache logging
  cacheHit(key: string, source?: string): void {
    this.debug(`Cache HIT: ${key}`, { key, type: 'cache_hit' }, source);
  }

  cacheMiss(key: string, source?: string): void {
    this.debug(`Cache MISS: ${key}`, { key, type: 'cache_miss' }, source);
  }

  cacheSet(key: string, ttl?: number, source?: string): void {
    this.debug(`Cache SET: ${key}${ttl ? ` (TTL: ${ttl}ms)` : ''}`, { key, ttl, type: 'cache_set' }, source);
  }

  cacheEvicted(key: string, reason: string, source?: string): void {
    this.debug(`Cache EVICTED: ${key} (${reason})`, { key, reason, type: 'cache_evicted' }, source);
  }

  // API logging
  apiCall(method: string, endpoint: string, duration?: number, source?: string): void {
    const message = `API ${method} ${endpoint}${duration ? ` (${duration}ms)` : ''}`;
    this.debug(message, { method, endpoint, duration, type: 'api_call' }, source);
  }

  apiError(method: string, endpoint: string, error: string, source?: string): void {
    const message = `API ${method} ${endpoint} failed: ${error}`;
    this.error(message, { method, endpoint, error, type: 'api_error' }, source);
  }

  // Service logging
  serviceOperation(service: string, operation: string, duration?: number, source?: string): void {
    const message = `${service}.${operation}${duration ? ` completed in ${duration}ms` : ''}`;
    this.debug(message, { service, operation, duration, type: 'service_operation' }, source);
  }

  serviceError(service: string, operation: string, error: string, source?: string): void {
    const message = `${service}.${operation} failed: ${error}`;
    this.error(message, { service, operation, error, type: 'service_error' }, source);
  }

  // Get recent logs for debugging
  getRecentLogs(level?: LogLevel, limit = 50): LogEntry[] {
    let logs = this.logQueue;
    
    if (level) {
      logs = logs.filter(entry => entry.level === level);
    }
    
    return logs.slice(-limit);
  }

  // Clear logs
  clearLogs(): void {
    this.logQueue = [];
  }

  // Configure logging levels
  setEnabledLevels(levels: LogLevel[]): void {
    this.enabledLevels = new Set(levels);
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logQueue, null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
export type { LogLevel, LogEntry }; 