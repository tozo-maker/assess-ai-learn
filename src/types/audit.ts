
export interface AuditResult {
  category: string;
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  recommendation?: string;
}

export interface AuditCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  checks: AuditResult[];
  score: number;
}
