
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ResourceOptimizer {
  private cache = new Map<string, CacheEntry<any>>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  // Image optimization utilities
  static optimizeImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image optimization failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Advanced caching with TTL
  setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Clean up expired entries periodically
    this.cleanupExpiredCache();
  }

  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Preload critical resources
  preloadResource(url: string): void {
    if (this.preloadQueue.includes(url)) return;
    
    this.preloadQueue.push(url);
    
    if (!this.isPreloading) {
      this.processPreloadQueue();
    }
  }

  private async processPreloadQueue(): Promise<void> {
    this.isPreloading = true;
    
    while (this.preloadQueue.length > 0) {
      const url = this.preloadQueue.shift();
      if (!url) continue;
      
      try {
        // Preload based on resource type
        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          await this.preloadImage(url);
        } else if (url.match(/\.(js|css)$/i)) {
          await this.preloadScript(url);
        } else {
          await fetch(url);
        }
        
        console.log(`Preloaded resource: ${url}`);
      } catch (error) {
        console.warn(`Failed to preload resource: ${url}`, error);
      }
      
      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isPreloading = false;
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }

  private preloadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = url.endsWith('.css') ? 'style' : 'script';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  // Bundle size analysis
  static analyzeBundleSize(): {
    totalSize: number;
    recommendations: string[];
  } {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    let totalSize = 0;
    const recommendations: string[] = [];
    
    // Estimate bundle size (this is approximate)
    if (scripts.length > 10) {
      recommendations.push('Consider code splitting to reduce initial bundle size');
    }
    
    if (styles.length > 5) {
      recommendations.push('Consider CSS optimization and critical path extraction');
    }
    
    // Check for duplicate resources
    const srcSet = new Set();
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (srcSet.has(src)) {
        recommendations.push(`Duplicate script detected: ${src}`);
      }
      srcSet.add(src);
    });
    
    if (recommendations.length === 0) {
      recommendations.push('Bundle optimization looks good');
    }
    
    return {
      totalSize,
      recommendations
    };
  }

  // Memory management
  static monitorMemoryUsage(): {
    usage: any;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let usage = null;
    
    if ('memory' in performance) {
      usage = (performance as any).memory;
      const usedMB = Math.round(usage.usedJSHeapSize / 1024 / 1024);
      const totalMB = Math.round(usage.totalJSHeapSize / 1024 / 1024);
      
      if (usedMB > 50) {
        recommendations.push('High memory usage detected. Consider optimizing data structures.');
      }
      
      if (totalMB > 100) {
        recommendations.push('Large heap size detected. Review for memory leaks.');
      }
      
      const utilizationRate = usedMB / totalMB;
      if (utilizationRate > 0.8) {
        recommendations.push('Memory utilization is high. Consider garbage collection optimization.');
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Memory usage is within acceptable limits');
    }
    
    return {
      usage,
      recommendations
    };
  }

  // Network optimization
  static getNetworkOptimizations(): string[] {
    const optimizations: string[] = [];
    
    // Check for HTTP/2
    if (!window.location.protocol.includes('https')) {
      optimizations.push('Enable HTTPS for HTTP/2 support and better performance');
    }
    
    // Check for service worker
    if (!('serviceWorker' in navigator)) {
      optimizations.push('Consider implementing service worker for offline support and caching');
    }
    
    // Check for compression
    optimizations.push('Ensure gzip/brotli compression is enabled on the server');
    
    // CDN recommendations
    optimizations.push('Consider using a CDN for static assets');
    
    // Critical resource hints
    optimizations.push('Add resource hints (preload, prefetch) for critical resources');
    
    return optimizations;
  }

  // Lazy loading utilities
  static setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observe all images with data-src attribute
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Performance budget monitoring
  static checkPerformanceBudget(): {
    budget: any;
    violations: string[];
  } {
    const budget = {
      maxBundleSize: 1000, // KB
      maxImageSize: 500,   // KB
      maxFonts: 3,
      maxThirdPartyScripts: 5
    };

    const violations: string[] = [];
    
    // Check fonts
    const fonts = document.querySelectorAll('link[href*="font"]');
    if (fonts.length > budget.maxFonts) {
      violations.push(`Too many font files: ${fonts.length} (budget: ${budget.maxFonts})`);
    }
    
    // Check third-party scripts
    const thirdPartyScripts = Array.from(document.querySelectorAll('script[src]'))
      .filter(script => {
        const src = (script as HTMLScriptElement).src;
        return src && !src.includes(window.location.hostname);
      });
    
    if (thirdPartyScripts.length > budget.maxThirdPartyScripts) {
      violations.push(`Too many third-party scripts: ${thirdPartyScripts.length} (budget: ${budget.maxThirdPartyScripts})`);
    }
    
    return {
      budget,
      violations
    };
  }
}

export const resourceOptimizer = new ResourceOptimizer();

// Performance monitoring decorator
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  target: T,
  context: string
): T {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = target(...args);
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        console.log(`${context} took ${duration.toFixed(2)}ms`);
      });
    } else {
      const duration = performance.now() - start;
      console.log(`${context} took ${duration.toFixed(2)}ms`);
      return result;
    }
  }) as T;
}

// Critical resource preloader
export function preloadCriticalResources(): void {
  const criticalResources = [
    '/api/auth/user', // User session
    '/favicon.ico',   // Favicon
    // Add more critical resources as needed
  ];

  criticalResources.forEach(resource => {
    resourceOptimizer.preloadResource(resource);
  });
}
