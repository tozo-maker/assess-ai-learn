/**
 * Production-ready logging utility that conditionally logs based on environment
 * Replaces direct console.log usage for better performance in production
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogOptions {
  level?: LogLevel;
  context?: Record<string, any>;
  error?: Error;
}

class PerformanceLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private enabledLevels: Set<LogLevel> = new Set();

  constructor() {
    if (this.isDevelopment) {
      this.enabledLevels = new Set(['DEBUG', 'INFO', 'WARN', 'ERROR']);
    } else {
      // Only log warnings and errors in production
      this.enabledLevels = new Set(['WARN', 'ERROR']);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLevels.has(level);
  }

  debug(message: string, options?: LogOptions): void {
    if (!this.shouldLog('DEBUG')) return;
    console.log(`[DEBUG] ${message}`, options?.context);
  }

  info(message: string, options?: LogOptions): void {
    if (!this.shouldLog('INFO')) return;
    console.info(`[INFO] ${message}`, options?.context);
  }

  warn(message: string, options?: LogOptions): void {
    if (!this.shouldLog('WARN')) return;
    console.warn(`[WARN] ${message}`, options?.context);
  }

  error(message: string, options?: LogOptions): void {
    if (!this.shouldLog('ERROR')) return;
    if (options?.error) {
      console.error(`[ERROR] ${message}`, options.error, options?.context);
    } else {
      console.error(`[ERROR] ${message}`, options?.context);
    }
  }

  // Performance measurement utility
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

  // Group logging for related operations
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
}

export const logger = new PerformanceLogger();