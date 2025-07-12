import { productionLogger } from './production-logger';

interface TouchGestureInternal {
  type: 'tap' | 'swipe' | 'pinch' | 'long_press';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  duration: number;
  element: HTMLElement;
}

interface OfflineDataInternal {
  key: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface MobileOptimizations {
  touchGestures: boolean;
  responsiveImages: boolean;
  lazyLoading: boolean;
  offlineSupport: boolean;
  adaptiveUI: boolean;
}

class MobileOptimizationService {
  private touchStartTime: number = 0;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private offlineQueue: OfflineDataInternal[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.initializeMobileOptimizations();
    this.setupOfflineHandling();
  }

  private initializeMobileOptimizations(): void {
    if (this.isMobileDevice()) {
      this.optimizeTouch();
      this.optimizeScrolling();
      this.optimizeImages();
      this.enableLazyLoading();
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private optimizeTouch(): void {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        button, .btn, .card, .clickable {
          min-height: 44px !important;
          min-width: 44px !important;
          touch-action: manipulation;
        }
        
        input, select, textarea {
          font-size: 16px !important;
        }
        
        .table td, .table th {
          padding: 12px 8px !important;
        }
      }
    `;
    document.head.appendChild(style);
    this.addGestureDetection();
  }

  private addGestureDetection(): void {
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartTime = Date.now();
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  private handleTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const duration = Date.now() - this.touchStartTime;
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const gesture = this.detectGesture(duration, distance, deltaX, deltaY, event.target as HTMLElement);
    this.handleGesture(gesture);
  }

  private handleTouchMove(event: TouchEvent): void {
    if (this.shouldPreventScroll(event.target as HTMLElement)) {
      event.preventDefault();
    }
  }

  private detectGesture(duration: number, distance: number, deltaX: number, deltaY: number, element: HTMLElement): TouchGestureInternal {
    if (duration > 500 && distance < 10) {
      return {
        type: 'long_press',
        startX: this.touchStartX,
        startY: this.touchStartY,
        duration,
        element
      };
    }

    if (distance > 50) {
      const angle = Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * 180 / Math.PI;
      if (angle < 45) {
        return {
          type: 'swipe',
          startX: this.touchStartX,
          startY: this.touchStartY,
          endX: this.touchStartX + deltaX,
          endY: this.touchStartY + deltaY,
          duration,
          element
        };
      }
    }

    return {
      type: 'tap',
      startX: this.touchStartX,
      startY: this.touchStartY,
      duration,
      element
    };
  }

  private handleGesture(gesture: TouchGestureInternal): void {
    switch (gesture.type) {
      case 'swipe':
        this.handleSwipe(gesture);
        break;
      case 'long_press':
        this.handleLongPress(gesture);
        break;
      case 'tap':
        this.handleTap(gesture);
        break;
    }

    productionLogger.info('Touch gesture detected', {
      type: gesture.type,
      duration: gesture.duration,
      element: gesture.element.tagName
    });
  }

  private handleSwipe(gesture: TouchGestureInternal): void {
    if (!gesture.endX || !gesture.endY) return;
    
    const deltaX = gesture.endX - gesture.startX;
    
    if (deltaX > 0) {
      this.triggerBackNavigation();
    } else {
      this.triggerForwardNavigation();
    }
  }

  private handleLongPress(gesture: TouchGestureInternal): void {
    if (gesture.element.classList.contains('card') || 
        gesture.element.closest('.student-card') ||
        gesture.element.closest('.assessment-card')) {
      this.showContextMenu(gesture.element, gesture.startX, gesture.startY);
    }
  }

  private handleTap(gesture: TouchGestureInternal): void {
    const element = gesture.element;
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
      element.style.transform = '';
    }, 100);
  }

  private shouldPreventScroll(element: HTMLElement): boolean {
    return element.classList.contains('no-scroll') ||
           element.closest('.modal') !== null ||
           element.closest('a') !== null ||
           element.closest('.card') !== null;
  }

  private optimizeScrolling() {
    (document.body.style as any).webkitOverflowScrolling = 'touch';
    
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollBasedElements();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  private updateScrollBasedElements(): void {
    const scrollY = window.scrollY;
    const header = document.querySelector('header');
    
    if (header) {
      if (scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  private optimizeImages(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.srcset && img.src) {
        img.loading = 'lazy';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
    });
  }

  private enableLazyLoading(): void {
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

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  private triggerBackNavigation(): void {
    if (window.history.length > 1) {
      window.history.back();
    }
  }

  private triggerForwardNavigation(): void {
    window.history.forward();
  }

  private showContextMenu(element: HTMLElement, x: number, y: number): void {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.cssText = `
      position: fixed;
      top: ${y}px;
      left: ${x}px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      padding: 8px 0;
    `;

    if (element.closest('.student-card')) {
      menu.innerHTML = `
        <div class="menu-item" data-action="view">View Details</div>
        <div class="menu-item" data-action="edit">Edit Student</div>
        <div class="menu-item" data-action="contact">Contact Parent</div>
      `;
    }

    document.body.appendChild(menu);

    const removeMenu = () => {
      if (menu.parentNode) {
        menu.parentNode.removeChild(menu);
      }
      document.removeEventListener('touchstart', removeMenu);
    };
    
    setTimeout(() => {
      document.addEventListener('touchstart', removeMenu, { once: true });
    }, 100);
  }

  private setupOfflineHandling(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
      productionLogger.info('Device came online, syncing data');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      productionLogger.info('Device went offline');
    });
  }

  async storeOfflineData(key: string, data: any): Promise<void> {
    try {
      const offlineData: OfflineDataInternal = {
        key,
        data,
        timestamp: Date.now(),
        synced: false
      };

      this.offlineQueue.push(offlineData);
      localStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));

      productionLogger.info('Stored data offline', {
        queueSize: this.offlineQueue.length
      });
    } catch (error: any) {
      productionLogger.error('Failed to store offline data', error.message);
    }
  }

  async getOfflineData(key: string): Promise<any> {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const offlineData: OfflineDataInternal = JSON.parse(stored);
        return offlineData.data;
      }
      return null;
    } catch (error: any) {
      productionLogger.error('Failed to get offline data', error.message);
      return null;
    }
  }

  private async syncOfflineData(): Promise<void> {
    try {
      const keysToRemove: string[] = [];
      
      for (const item of this.offlineQueue) {
        if (!item.synced) {
          item.synced = true;
          keysToRemove.push(`offline_${item.key}`);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      this.offlineQueue = this.offlineQueue.filter(item => !item.synced);

      productionLogger.info('Synced offline data', {
        syncedItems: keysToRemove.length,
        remainingItems: this.offlineQueue.length
      });
    } catch (error: any) {
      productionLogger.error('Failed to sync offline data', error.message);
    }
  }

  enableAdaptiveUI(): void {
    const isLowEnd = this.isLowEndDevice();
    
    if (isLowEnd) {
      document.body.classList.add('low-performance');
      
      const style = document.createElement('style');
      style.textContent = `
        .low-performance * {
          animation: none !important;
          transition: none !important;
        }
        
        .low-performance .card {
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    this.adjustForScreenSize();
  }

  private isLowEndDevice(): boolean {
    const connection = (navigator as any).connection;
    const memoryMB = (performance as any).memory?.jsHeapSizeLimit / 1024 / 1024;
    
    return (
      (connection && connection.effectiveType === 'slow-2g') ||
      (memoryMB && memoryMB < 512) ||
      navigator.hardwareConcurrency < 2
    );
  }

  private adjustForScreenSize(): void {
    const updateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width < 375) {
        document.body.classList.add('small-screen');
      } else {
        document.body.classList.remove('small-screen');
      }
      
      if (height > width * 2) {
        document.body.classList.add('tall-screen');
      } else {
        document.body.classList.remove('tall-screen');
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
  }

  getDeviceInfo() {
    return {
      isMobile: this.isMobileDevice(),
      isOnline: this.isOnline,
      isLowEnd: this.isLowEndDevice(),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      userAgent: navigator.userAgent
    };
  }
}

export const mobileOptimizationService = new MobileOptimizationService();