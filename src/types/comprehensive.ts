/**
 * Comprehensive Type Definitions
 * Replaces 'any' types throughout the application
 */

// Core Entity Types
export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  grade_level: string;
  teacher_id: string;
  class_id?: string;
  avatar_url?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  learning_goals?: string;
  special_considerations?: string;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  assessment_type: string;
  teacher_id: string;
  max_score: number;
  assessment_date?: string;
  standards_covered?: string[];
  is_draft?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssessmentItem {
  id: string;
  assessment_id: string;
  item_number: number;
  question_text: string;
  knowledge_type: string;
  difficulty_level: string;
  max_score: number;
  standard_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentResponse {
  id: string;
  student_id: string;
  assessment_id: string;
  assessment_item_id: string;
  score: number;
  error_type?: string;
  teacher_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  student_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress_percentage?: number;
  target_date?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed_at?: string;
  created_at: string;
}

export interface Communication {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  content: string;
  communication_type: 'email' | 'report' | 'note' | 'meeting';
  parent_email?: string;
  pdf_url?: string;
  email_status?: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  created_at: string;
}

// Form Data Types
export interface AssessmentFormData {
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  assessment_type: string;
  teacher_id: string;
  standards_covered?: string[];
  assessment_date?: string;
  is_draft?: boolean;
  max_score: number;
  items: AssessmentItemFormData[];
}

export interface AssessmentItemFormData {
  question_text: string;
  knowledge_type: string;
  difficulty_level: string;
  max_score: number;
  standard_reference?: string;
}

export interface StudentFormData {
  first_name: string;
  last_name: string;
  student_id?: string;
  grade_level: string;
  class_id?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  learning_goals?: string;
  special_considerations?: string;
}

export interface GoalFormData {
  title: string;
  description?: string;
  target_date?: string;
  milestones?: GoalMilestoneFormData[];
}

export interface GoalMilestoneFormData {
  title: string;
  description?: string;
  target_date?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Dashboard Data Types
export interface DashboardData {
  teacher: TeacherProfile;
  students: Student[];
  assessments: Assessment[];
  recentCommunications: Communication[];
  summary: DashboardSummary;
}

export interface DashboardSummary {
  totalStudents: number;
  totalAssessments: number;
  averageScore: number;
  studentsNeedingAttention: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'assessment' | 'communication' | 'goal' | 'student';
  title: string;
  description: string;
  timestamp: string;
  student?: Pick<Student, 'id' | 'first_name' | 'last_name'>;
}

export interface TeacherProfile {
  id: string;
  full_name: string;
  school?: string;
  grade_levels?: string[];
  subjects?: string[];
  years_experience?: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Performance and Analytics Types
export interface PerformanceMetrics {
  student_id: string;
  average_score: number;
  assessment_count: number;
  performance_level: 'Beginning' | 'Developing' | 'Proficient' | 'Advanced';
  last_assessment_date?: string;
  needs_attention: boolean;
  trend: 'improving' | 'declining' | 'stable';
}

export interface AnalyticsData {
  performanceOverTime: ChartDataPoint[];
  subjectBreakdown: SubjectPerformance[];
  skillMastery: SkillMasteryData[];
  predictions: PredictiveInsights;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  assessmentCount: number;
  studentCount: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SkillMasteryData {
  skill_id: string;
  skill_name: string;
  current_mastery_level: string;
  mastery_score: number;
  assessment_count: number;
  last_assessed_at?: string;
}

export interface PredictiveInsights {
  riskPredictions: RiskPrediction[];
  growthPredictions: GrowthPrediction[];
  recommendations: string[];
}

export interface RiskPrediction {
  student_id: string;
  student_name: string;
  risk_level: 'low' | 'medium' | 'high';
  risk_factors: string[];
  confidence: number;
}

export interface GrowthPrediction {
  student_id: string;
  student_name: string;
  predicted_growth: number;
  timeframe: string;
  confidence: number;
}

// Filter and Search Types
export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'daterange' | 'text' | 'number';
  options?: FilterOption[];
  defaultValue?: unknown;
  validation?: FilterValidation;
}

export interface FilterOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FilterValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export interface FilterState {
  [key: string]: unknown;
}

export interface SearchParams {
  query?: string;
  filters: FilterState;
  sort?: SortConfig;
  pagination?: PaginationConfig;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  limit: number;
}

// Email and Communication Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  template_type: string;
  variables?: EmailVariable[];
  is_default?: boolean;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface EmailVariable {
  key: string;
  label: string;
  description?: string;
  required?: boolean;
  default_value?: string;
}

export interface EmailData {
  to: string[];
  subject: string;
  content: string;
  template_type?: string;
  variables?: Record<string, string>;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Blob;
  content_type: string;
}

export interface ReportOptions {
  includeInsights: boolean;
  includeGoals: boolean;
  includeRecommendations: boolean;
  includeCharts: boolean;
  timeframe: 'last-week' | 'last-month' | 'last-quarter' | 'all-time';
  format: 'pdf' | 'html';
}

// Event and Real-time Types
export interface RealtimeEvent<T = Record<string, unknown>> {
  eventType: string;
  table: string;
  schema: string;
  new?: T;
  old?: T;
  errors?: string[];
}

export interface NotificationData {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  student_id?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

// Component Props Types
export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ErrorStateProps {
  error?: Error;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: React.ReactNode;
  className?: string;
}

// Hook Return Types
export interface UseAsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseFormResult<T> {
  data: T;
  setData: (data: Partial<T>) => void;
  errors: Record<keyof T, string>;
  isValid: boolean;
  isDirty: boolean;
  reset: () => void;
  submit: () => Promise<boolean>;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type SelectOption<T = string> = {
  value: T;
  label: string;
  disabled?: boolean;
  description?: string;
};

export type TableColumn<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
};

export type ModalProps<T = Record<string, unknown>> = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  data?: T;
  onSubmit?: (data: T) => void | Promise<void>;
};