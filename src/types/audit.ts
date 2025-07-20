
export interface AuditResult {
  category: 'database' | 'security' | 'monitoring' | 'configuration' | 'functionality' | 'performance';
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  recommendation?: string;
  duration?: number;
}

export interface AuditCategory {
  name: string;
  description: string;
  checks: AuditResult[];
  score: number;
}

export interface ComprehensiveAuditReport {
  timestamp: string;
  categories: AuditCategory[];
  overallScore: number;
  criticalIssues: AuditResult[];
  recommendations: string[];
}
