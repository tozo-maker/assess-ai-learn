
export interface Teacher {
  id: string;
  full_name: string;
  firstName?: string;
  school?: string;
  grade_levels?: string[];
  subjects?: string[];
  years_experience?: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  totalAssessments: number;
  studentsNeedingAttention: number;
  averagePerformance: number;
  aiInsights: number;
  recentAssessments: number;
  todaysInsights: number;
}

export interface ContextualInfo {
  totalStudents: number;
  activeAssessments: number;
  upcomingDeadlines: number;
  recentInsights: number;
}

export interface DashboardData {
  teacher: Teacher;
  metrics: DashboardMetrics;
}

export interface StatisticsTrend {
  value: number;
  label: string;
  direction: 'up' | 'down' | 'neutral';
  isPositive?: boolean;
}

export interface StatisticsProgress {
  value: number;
  max: number;
  label: string;
}

export interface StatisticsCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: StatisticsTrend;
  progress?: StatisticsProgress;
  priority?: 'high' | 'medium' | 'low' | 'none';
}
