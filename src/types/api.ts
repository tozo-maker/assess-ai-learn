// API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  error: string | null;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Service Function Parameters
export interface AIFunctionParams {
  studentId?: string;
  assessmentId?: string;
  goalId?: string;
  context?: Record<string, unknown>;
  options?: {
    includeHistory?: boolean;
    maxResults?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

export interface BatchProcessingParams {
  items: unknown[];
  batchSize?: number;
  concurrency?: number;
  onProgress?: (current: number, total: number) => void;
}

// Cache Types
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  accessed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  hitRate: number;
  totalMemory: number;
}

// Import/Export Types
export interface ImportResult {
  successful: number;
  failed: number;
  duplicates: number;
  errors: string[];
  warnings: string[];
}

export interface ParsedCSVData {
  headers: string[];
  data: Record<string, string | number | boolean>[];
  errors: string[];
  warnings: string[];
}

export interface ImportOptions {
  duplicateHandling: 'skip' | 'update' | 'create_new';
  validateEmails: boolean;
  createBackup: boolean;
  dryRun?: boolean;
}

// Performance Monitoring Types
export interface PerformanceMetric {
  endpoint: string;
  method: string;
  response_time_ms: number;
  status_code: number;
  error_message?: string;
  user_id?: string;
  timestamp?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: string;
}

// Error Tracking Types
export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  url: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, unknown>;
  user_id?: string;
  timestamp: string;
  count: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: string;
  }>;
  errorsByHour: Array<{
    hour: string;
    count: number;
  }>;
}

// Form Data Types
export interface FormFieldError {
  message: string;
  type: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, FormFieldError>;
  warnings: Record<string, string>;
}

// Generic Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Database Operation Types
export interface DatabaseOperationResult<T = unknown> {
  data: T | null;
  error: string | null;
  count?: number;
  status: 'success' | 'error' | 'warning';
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

// Email Service Types
export interface EmailRecipient {
  email: string;
  name?: string;
  type: 'to' | 'cc' | 'bcc';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface EmailSendResult {
  messageId: string;
  status: 'sent' | 'failed' | 'queued';
  error?: string;
  timestamp: string;
} 