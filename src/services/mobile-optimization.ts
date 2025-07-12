import { productionLogger } from './production-logger';

export interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'long_press';
  direction?: 'left' | 'right' | 'up' | 'down';
  startPoint: { x: number; y: number };
  endPoint?: { x: number; y: number };
  duration: number;
  velocity?: number;
}

export interface OfflineData {
  timestamp: string;
  type: 'student_data' | 'assessment_data' | 'user_actions';
  data: any;
  synced: boolean;
}

class MobileOptimizationService {
  private touchStartTime = 0;
  private touchStartPoint = { x: 0, y: 0 };
  private gestureHandlers = new Map<string, (gesture: TouchGesture) => void>();
  private offlineQueue: OfflineData[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.initializeOfflineHandling();
    this.initializeTouchOptimizations();
    this.setupViewportOptimizations();
  }

  // Touch Interface Optimizations
  initializeTouchOptimizations() {
    // Prevent zoom on double tap for better UX
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

    // Optimize scroll performance
    this.optimizeScrolling();
  }

  private handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.touchStartTime = Date.now();
      this.touchStartPoint = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }

    // Prevent double-tap zoom on critical UI elements
    if (this.isCriticalUIElement(event.target as Element)) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }
  }

  private handleTouchMove(event: TouchEvent) {
    // Optimize scrolling performance
    if (event.touches.length === 1) {
      const currentPoint = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };

      const deltaX = Math.abs(currentPoint.x - this.touchStartPoint.x);
      const deltaY = Math.abs(currentPoint.y - this.touchStartPoint.y);

      // Prevent horizontal scrolling on vertical swipes
      if (deltaY > deltaX && deltaY > 10) {
        const element = event.target as Element;
        if (this.shouldPreventHorizontalScroll(element)) {
          document.body.style.overflowX = 'hidden';
        }
      }
    }
  }

  private handleTouchEnd(event: TouchEvent) {
    document.body.style.overflowX = '';

    if (event.changedTouches.length === 1) {
      const endPoint = {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY
      };

      const duration = Date.now() - this.touchStartTime;
      const gesture = this.detectGesture(this.touchStartPoint, endPoint, duration);

      if (gesture) {
        this.handleGesture(gesture);
      }
    }
  }

  private detectGesture(startPoint: { x: number; y: number }, endPoint: { x: number; y: number }, duration: number): TouchGesture | null {
    const deltaX = endPoint.x - startPoint.x;
    const deltaY = endPoint.y - startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Long press
    if (duration > 500 && distance < 10) {
      return {
        type: 'long_press',
        startPoint,
        endPoint,
        duration
      };
    }

    // Swipe gesture
    if (distance > 50 && duration < 300) {
      const velocity = distance / duration;
      let direction: 'left' | 'right' | 'up' | 'down';

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      return {
        type: 'swipe',
        direction,
        startPoint,
        endPoint,
        duration,
        velocity
      };
    }

    // Tap
    if (distance < 10 && duration < 200) {
      return {
        type: 'tap',
        startPoint,
        endPoint,
        duration
      };
    }

    return null;
  }

  private handleGesture(gesture: TouchGesture) {
    const handlers = this.gestureHandlers.get(gesture.type);
    if (handlers) {
      handlers(gesture);
    }

    // Default gesture behaviors
    switch (gesture.type) {
      case 'swipe':
        this.handleSwipeGesture(gesture);
        break;
      case 'long_press':
        this.handleLongPressGesture(gesture);
        break;
    }
  }

  private handleSwipeGesture(gesture: TouchGesture) {
    // Navigation swipes
    if (gesture.direction === 'right' && gesture.startPoint.x < 50) {
      // Trigger sidebar open
      this.triggerSidebarOpen();
    } else if (gesture.direction === 'left' && gesture.startPoint.x > window.innerWidth - 50) {
      // Trigger sidebar close
      this.triggerSidebarClose();
    }
  }

  private handleLongPressGesture(gesture: TouchGesture) {
    const element = document.elementFromPoint(gesture.startPoint.x, gesture.startPoint.y);
    if (element && this.isInteractiveElement(element)) {
      // Show context menu or additional options
      this.showContextMenu(element, gesture.startPoint);
    }
  }

  private triggerSidebarOpen() {
    const event = new CustomEvent('mobile-sidebar-open');
    document.dispatchEvent(event);
  }

  private triggerSidebarClose() {
    const event = new CustomEvent('mobile-sidebar-close');
    document.dispatchEvent(event);
  }

  private showContextMenu(element: Element, point: { x: number; y: number }) {
    const event = new CustomEvent('mobile-context-menu', {
      detail: { element, point }
    });
    document.dispatchEvent(event);
  }

  registerGestureHandler(gestureType: string, handler: (gesture: TouchGesture) => void) {
    this.gestureHandlers.set(gestureType, handler);
  }

  private isCriticalUIElement(element: Element): boolean {
    return element.closest('[data-critical-ui]') !== null ||
           element.closest('button') !== null ||
           element.closest('input') !== null ||
           element.closest('select') !== null;
  }

  private shouldPreventHorizontalScroll(element: Element): boolean {
    return element.closest('[data-vertical-scroll-only]') !== null ||
           element.closest('.table-container') !== null;
  }

  private isInteractiveElement(element: Element): boolean {
    return element.closest('button') !== null ||
           element.closest('[role="button"]') !== null ||
           element.closest('a') !== null ||
           element.closest('.card') !== null;
  }

  // Responsive Design Helpers
  private optimizeScrolling() {
    // Enable smooth scrolling with momentum
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Optimize scroll performance
    let ticking = false;
    const updateScrollPosition = () => {
      ticking = false;
      // Update sticky elements, headers, etc.
      this.updateStickyElements();
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    }, { passive: true });
  }

  private updateStickyElements() {
    const stickyElements = document.querySelectorAll('[data-sticky-mobile]');
    const scrollY = window.scrollY;

    stickyElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const offset = parseInt(htmlElement.dataset.stickyOffset || '0');
      
      if (scrollY > offset) {
        htmlElement.classList.add('stuck');
      } else {
        htmlElement.classList.remove('stuck');
      }
    });
  }

  private setupViewportOptimizations() {
    // Handle viewport changes for mobile keyboards
    const viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewportMeta) {
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }

    // Handle safe area insets
    this.applySafeAreaInsets();

    // Optimize for different screen orientations
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
  }

  private applySafeAreaInsets() {
    const root = document.documentElement;
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
  }

  private handleOrientationChange() {
    // Recalculate responsive breakpoints
    this.updateResponsiveClasses();
    
    // Adjust layout for new orientation
    const event = new CustomEvent('mobile-orientation-change', {
      detail: { orientation: screen.orientation?.angle || 0 }
    });
    document.dispatchEvent(event);
  }

  private updateResponsiveClasses() {
    const body = document.body;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Remove existing responsive classes
    body.classList.remove('mobile-portrait', 'mobile-landscape', 'tablet-portrait', 'tablet-landscape');

    // Add appropriate classes
    if (width < 768) {
      body.classList.add(height > width ? 'mobile-portrait' : 'mobile-landscape');
    } else if (width < 1024) {
      body.classList.add(height > width ? 'tablet-portrait' : 'tablet-landscape');
    }
  }

  // Offline Capabilities
  private initializeOfflineHandling() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
      productionLogger.info('Device came online, syncing data');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      productionLogger.info('Device went offline, queuing actions');
    });

    // Load queued data from localStorage
    this.loadOfflineQueue();
  }

  queueOfflineAction(type: string, data: any) {
    const offlineData: OfflineData = {
      timestamp: new Date().toISOString(),
      type: type as any,
      data,
      synced: false
    };

    this.offlineQueue.push(offlineData);
    this.saveOfflineQueue();

    productionLogger.info('Queued offline action', { type, dataSize: JSON.stringify(data).length });
  }

  private async syncOfflineData() {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    const unsyncedData = this.offlineQueue.filter(item => !item.synced);
    
    for (const item of unsyncedData) {
      try {
        await this.syncSingleItem(item);
        item.synced = true;
        productionLogger.info('Synced offline data item', { type: item.type });
      } catch (error) {
        productionLogger.error('Failed to sync offline data item', { error, item });
        break; // Stop syncing if one fails
      }
    }

    // Remove synced items
    this.offlineQueue = this.offlineQueue.filter(item => !item.synced);
    this.saveOfflineQueue();
  }

  private async syncSingleItem(item: OfflineData): Promise<void> {
    // Implement actual sync logic based on item type
    switch (item.type) {
      case 'student_data':
        // Sync student updates
        break;
      case 'assessment_data':
        // Sync assessment submissions
        break;
      case 'user_actions':
        // Sync user actions/analytics
        break;
    }
  }

  private saveOfflineQueue() {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      productionLogger.error('Failed to save offline queue', { error });
    }
  }

  private loadOfflineQueue() {
    try {
      const saved = localStorage.getItem('offline_queue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
      }
    } catch (error) {
      productionLogger.error('Failed to load offline queue', { error });
      this.offlineQueue = [];
    }
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  getQueuedItemCount(): number {
    return this.offlineQueue.filter(item => !item.synced).length;
  }

  // Performance Optimizations
  optimizeForMobile() {
    // Reduce animation complexity on mobile
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      document.body.classList.add('reduce-motion');
    }

    // Optimize image loading
    this.optimizeImages();

    // Implement virtual scrolling for large lists
    this.implementVirtualScrolling();
  }

  private optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      // Add loading="lazy" if not already present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }

      // Use responsive images
      if (!img.hasAttribute('sizes')) {
        img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw');
      }
    });
  }

  private implementVirtualScrolling() {
    const lists = document.querySelectorAll('[data-virtual-scroll]');
    lists.forEach((list) => {
      // Implement intersection observer for virtual scrolling
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load more items
            const event = new CustomEvent('load-more-items', {
              detail: { list: entry.target }
            });
            entry.target.dispatchEvent(event);
          }
        });
      }, {
        rootMargin: '100px'
      });

      const sentinel = list.querySelector('[data-scroll-sentinel]');
      if (sentinel) {
        observer.observe(sentinel);
      }
    });
  }
}

export const mobileOptimizationService = new MobileOptimizationService();