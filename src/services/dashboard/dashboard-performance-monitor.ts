
interface PerformanceEntry {
  name: string;
  startTime: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class DashboardPerformanceMonitor {
  private static instance: DashboardPerformanceMonitor;
  private entries: Map<string, PerformanceEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private maxEntries = 100;

  static getInstance(): DashboardPerformanceMonitor {
    if (!DashboardPerformanceMonitor.instance) {
      DashboardPerformanceMonitor.instance = new DashboardPerformanceMonitor();
    }
    return DashboardPerformanceMonitor.instance;
  }

  constructor() {
    // Auto-cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  startTimer(name: string, metadata?: Record<string, any>): void {
    this.entries.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  endTimer(name: string): number | null {
    const entry = this.entries.get(name);
    if (!entry) return null;

    const duration = performance.now() - entry.startTime;
    this.entries.set(name, { ...entry, duration });

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow dashboard operation: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.startTimer(name, metadata);
    try {
      const result = fn();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  async measureAsync<T>(
    name: string, 
    fn: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name, metadata);
    try {
      const result = await fn();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  getStats() {
    const completedEntries = Array.from(this.entries.values())
      .filter(entry => entry.duration !== undefined);

    if (completedEntries.length === 0) {
      return {
        averageTime: 0,
        slowOperations: 0,
        totalOperations: 0,
        memoryUsage: this.getMemoryUsage()
      };
    }

    const totalTime = completedEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const averageTime = totalTime / completedEntries.length;
    const slowOperations = completedEntries.filter(entry => (entry.duration || 0) > 1000).length;

    return {
      averageTime: Math.round(averageTime),
      slowOperations,
      totalOperations: completedEntries.length,
      memoryUsage: this.getMemoryUsage()
    };
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }

  private cleanup(): void {
    const now = performance.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Remove old entries
    for (const [name, entry] of this.entries) {
      if (entry.startTime < fiveMinutesAgo) {
        this.entries.delete(name);
      }
    }

    // Limit total entries
    if (this.entries.size > this.maxEntries) {
      const sortedEntries = Array.from(this.entries.entries())
        .sort(([, a], [, b]) => b.startTime - a.startTime);
      
      this.entries.clear();
      sortedEntries.slice(0, this.maxEntries).forEach(([name, entry]) => {
        this.entries.set(name, entry);
      });
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.entries.clear();
  }
}

export const dashboardPerformanceMonitor = DashboardPerformanceMonitor.getInstance();
