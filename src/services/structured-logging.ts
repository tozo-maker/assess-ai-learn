
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
}

interface LogMetrics {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  recentActivity: Array<{ timestamp: string; count: number }>;
}

class StructuredLoggingService {
  private logQueue: LogEntry[] = [];
  private batchSize = 20;
  private flushInterval = 5000; // 5 seconds
  private sessionId = this.generateSessionId();
  private minLogLevel: LogLevel = 'INFO';

  constructor() {
    this.setupLogLevel();
    this.startBatchProcessor();
  }

  private setupLogLevel() {
    // Set log level based on environment
    if (process.env.NODE_ENV === 'development') {
      this.minLogLevel = 'DEBUG';
    } else {
      this.minLogLevel = 'INFO';
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      'DEBUG': 0,
      'INFO': 1,
      'WARN': 2,
      'ERROR': 3
    };
    return levels[level] >= levels[this.minLogLevel];
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      return 'current-user-id'; // This would be replaced with actual user context
    } catch {
      return undefined;
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('DEBUG')) return;
    
    const logEntry = this.createLogEntry('DEBUG', message, context);
    this.addToQueue(logEntry);
    console.debug(`[DEBUG] ${message}`, context);
  }

  info(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('INFO')) return;
    
    const logEntry = this.createLogEntry('INFO', message, context);
    this.addToQueue(logEntry);
    console.info(`[INFO] ${message}`, context);
  }

  warn(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('WARN')) return;
    
    const logEntry = this.createLogEntry('WARN', message, context);
    this.addToQueue(logEntry);
    console.warn(`[WARN] ${message}`, context);
  }

  error(message: string, context?: Record<string, any>) {
    if (!this.shouldLog('ERROR')) return;
    
    const logEntry = this.createLogEntry('ERROR', message, context);
    this.addToQueue(logEntry);
    console.error(`[ERROR] ${message}`, context);
  }

  private addToQueue(logEntry: LogEntry) {
    this.logQueue.push(logEntry);
    
    if (this.logQueue.length >= this.batchSize || logEntry.level === 'ERROR') {
      this.flushLogs();
    }
  }

  private startBatchProcessor() {
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  private async flushLogs() {
    if (this.logQueue.length === 0) return;

    const logsToFlush = [...this.logQueue];
    this.logQueue = [];

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const performanceLogs = logsToFlush.map(log => ({
        endpoint: 'application_log',
        method: log.level,
        response_time_ms: 0,
        status_code: this.levelToStatusCode(log.level),
        error_message: `${log.message} | Context: ${JSON.stringify(log.context || {})}`,
        user_id: log.userId
      }));

      const { error } = await supabase
        .from('system_performance_logs')
        .insert(performanceLogs);

      if (error) {
        console.warn('Failed to flush logs to database:', error);
        this.storeLogsLocally(logsToFlush);
      }
    } catch (error) {
      console.warn('Logging service failed:', error);
      this.storeLogsLocally(logsToFlush);
    }
  }

  private levelToStatusCode(level: LogLevel): number {
    switch (level) {
      case 'ERROR': return 500;
      case 'WARN': return 300;
      case 'INFO': return 200;
      case 'DEBUG': return 100;
      default: return 200;
    }
  }

  private storeLogsLocally(logs: LogEntry[]) {
    try {
      const existing = JSON.parse(localStorage.getItem('application_logs') || '[]');
      const combined = [...existing, ...logs].slice(-100); // Keep last 100 logs
      localStorage.setItem('application_logs', JSON.stringify(combined));
    } catch (error) {
      console.warn('Failed to store logs locally:', error);
    }
  }

  // Performance monitoring wrapper
  async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    this.debug(`Starting operation: ${operationName}`, context);
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.info(`Operation completed: ${operationName}`, {
        ...context,
        duration: `${duration.toFixed(2)}ms`,
        success: true
      });
      
      return result;
    } catch (error: any) {
      const duration = performance.now() - startTime;
      
      this.error(`Operation failed: ${operationName}`, {
        ...context,
        duration: `${duration.toFixed(2)}ms`,
        error: error.message,
        success: false
      });
      
      throw error;
    }
  }

  // Get log metrics for monitoring dashboard
  async getLogMetrics(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<LogMetrics> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const timeframeHours = timeframe === 'hour' ? 1 : timeframe === 'day' ? 24 : 168;
      const since = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('system_performance_logs')
        .select('*')
        .eq('endpoint', 'application_log')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (error) {
        return this.getLocalLogMetrics();
      }

      const totalLogs = data.length;
      const logsByLevel: Record<LogLevel, number> = {
        'DEBUG': 0,
        'INFO': 0,
        'WARN': 0,
        'ERROR': 0
      };

      data.forEach(log => {
        const level = log.method as LogLevel;
        if (level in logsByLevel) {
          logsByLevel[level]++;
        }
      });

      const recentActivity = this.groupLogsByTime(data);

      return {
        totalLogs,
        logsByLevel,
        recentActivity
      };
    } catch (error) {
      return this.getLocalLogMetrics();
    }
  }

  private getLocalLogMetrics(): LogMetrics {
    try {
      const logs = JSON.parse(localStorage.getItem('application_logs') || '[]');
      const logsByLevel: Record<LogLevel, number> = {
        'DEBUG': 0,
        'INFO': 0,
        'WARN': 0,
        'ERROR': 0
      };

      logs.forEach((log: LogEntry) => {
        if (log.level in logsByLevel) {
          logsByLevel[log.level]++;
        }
      });

      return {
        totalLogs: logs.length,
        logsByLevel,
        recentActivity: []
      };
    } catch {
      return {
        totalLogs: 0,
        logsByLevel: { 'DEBUG': 0, 'INFO': 0, 'WARN': 0, 'ERROR': 0 },
        recentActivity: []
      };
    }
  }

  private groupLogsByTime(data: any[]): Array<{ timestamp: string; count: number }> {
    const timeGroups = new Map<string, number>();
    
    data.forEach(log => {
      const timeKey = new Date(log.created_at).toISOString().substring(0, 16); // Group by minute
      timeGroups.set(timeKey, (timeGroups.get(timeKey) || 0) + 1);
    });

    return Array.from(timeGroups.entries())
      .map(([timestamp, count]) => ({ timestamp, count }))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .slice(-60); // Last 60 time periods
  }
}

export const structuredLogger = new StructuredLoggingService();
