/**
 * Security hardening service for LearnSpark AI
 * Implements CSRF protection, rate limiting, and request validation
 */

import { productionLogger } from './production-logger';

interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
  identifier: string;
}

interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'X-XSS-Protection': string;
}

class SecurityService {
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  private csrfTokens = new Set<string>();
  
  /**
   * Rate limiting implementation
   */
  checkRateLimit(identifier: string, rule: RateLimitRule): boolean {
    const now = Date.now();
    const key = `${rule.identifier}:${identifier}`;
    const existing = this.rateLimitStore.get(key);

    if (!existing || now > existing.resetTime) {
      // Reset or create new entry
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + rule.windowMs
      });
      return true;
    }

    if (existing.count >= rule.maxRequests) {
      productionLogger.warn('Rate limit exceeded', {
        identifier,
        rule: rule.identifier,
        count: existing.count,
        maxRequests: rule.maxRequests
      });
      return false;
    }

    existing.count++;
    return true;
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    const token = crypto.randomUUID();
    this.csrfTokens.add(token);
    
    // Auto-cleanup tokens after 1 hour
    setTimeout(() => {
      this.csrfTokens.delete(token);
    }, 3600000);
    
    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string): boolean {
    const isValid = this.csrfTokens.has(token);
    if (!isValid) {
      productionLogger.warn('Invalid CSRF token attempted', { token });
    }
    return isValid;
  }

  /**
   * Sanitize URL to prevent open redirects
   */
  sanitizeRedirectURL(url: string, allowedDomains: string[]): string | null {
    try {
      const parsedUrl = new URL(url);
      
      // Check if domain is in allowed list
      const isAllowed = allowedDomains.some(domain => 
        parsedUrl.hostname === domain || 
        parsedUrl.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        productionLogger.warn('Attempted redirect to unauthorized domain', {
          url,
          hostname: parsedUrl.hostname,
          allowedDomains
        });
        return null;
      }
      
      return url;
    } catch (error) {
      productionLogger.error('Invalid redirect URL format', error as Error, { url });
      return null;
    }
  }

  /**
   * Validate file upload security
   */
  validateFileUpload(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/csv'
    ];

    if (file.size > maxSize) {
      errors.push('File size exceeds 5MB limit');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} not allowed`);
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif'];
    const fileName = file.name.toLowerCase();
    
    if (suspiciousExtensions.some(ext => fileName.endsWith(ext))) {
      errors.push('Suspicious file extension detected');
    }

    const valid = errors.length === 0;
    
    if (!valid) {
      productionLogger.warn('File upload validation failed', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        errors
      });
    }

    return { valid, errors };
  }

  /**
   * Get security headers for HTTP responses
   */
  getSecurityHeaders(isDevelopment: boolean = false): SecurityHeaders {
    const baseCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://etlkxmgdmzzysmgkbudx.supabase.co wss://etlkxmgdmzzysmgkbudx.supabase.co",
      "frame-ancestors 'none'"
    ];

    if (isDevelopment) {
      baseCSP.push("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    }

    return {
      'Content-Security-Policy': baseCSP.join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block'
    };
  }

  /**
   * Validate authentication state
   */
  validateAuthState(user: any, requiredRole?: string): boolean {
    if (!user) {
      productionLogger.warn('Unauthorized access attempt');
      return false;
    }

    if (requiredRole && user.role !== requiredRole) {
      productionLogger.warn('Insufficient privileges', {
        userId: user.id,
        userRole: user.role,
        requiredRole
      });
      return false;
    }

    return true;
  }

  /**
   * Log security events
   */
  logSecurityEvent(event: string, details: Record<string, any>, severity: 'low' | 'medium' | 'high' = 'medium'): void {
    const logMethod = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
    
    productionLogger[logMethod](`Security Event: ${event}`, undefined, {
      securityEvent: true,
      event,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      ...details
    });
  }

  /**
   * Clean up expired rate limit entries
   */
  cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, data] of this.rateLimitStore.entries()) {
      if (now > data.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }
}

export const securityService = new SecurityService();

// Rate limit configurations
export const RATE_LIMITS = {
  API_GENERAL: { windowMs: 60000, maxRequests: 100, identifier: 'api_general' },
  LOGIN_ATTEMPTS: { windowMs: 300000, maxRequests: 5, identifier: 'login' },
  PASSWORD_RESET: { windowMs: 600000, maxRequests: 3, identifier: 'password_reset' },
  FILE_UPLOAD: { windowMs: 60000, maxRequests: 10, identifier: 'file_upload' },
  EMAIL_SEND: { windowMs: 300000, maxRequests: 20, identifier: 'email_send' }
};

// Cleanup rate limits every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    securityService.cleanupRateLimits();
  }, 300000);
}