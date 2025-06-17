
import { StudentWithPerformance } from '@/types/student';

export interface PerformanceData {
  level: string | null;
  score: number | null;
  needsAttention: boolean;
  assessmentCount: number;
  lastAssessment: string | null;
}

export interface PerformanceConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  ringColor: string;
  status: string;
}

export const getPerformanceData = (student: StudentWithPerformance): PerformanceData => {
  if (!student.performance || Array.isArray(student.performance)) {
    return {
      level: null,
      score: null,
      needsAttention: false,
      assessmentCount: 0,
      lastAssessment: null
    };
  }
  return {
    level: student.performance.performance_level,
    score: student.performance.average_score,
    needsAttention: student.performance.needs_attention,
    assessmentCount: student.performance.assessment_count,
    lastAssessment: student.performance.last_assessment_date
  };
};

export const getPerformanceConfig = (performance: PerformanceData): PerformanceConfig => {
  if (performance.needsAttention) {
    return {
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-l-red-500',
      textColor: 'text-red-600',
      ringColor: 'ring-red-200',
      status: 'Critical'
    };
  }
  
  if (!performance.score) {
    return {
      color: 'bg-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-l-gray-400',
      textColor: 'text-gray-600',
      ringColor: 'ring-gray-200',
      status: 'Not Assessed'
    };
  }

  if (performance.score >= 85) {
    return {
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-l-green-500',
      textColor: 'text-green-600',
      ringColor: 'ring-green-200',
      status: 'Excellent'
    };
  }
  
  if (performance.score >= 70) {
    return {
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-l-blue-500',
      textColor: 'text-blue-600',
      ringColor: 'ring-blue-200',
      status: 'Good'
    };
  }
  
  if (performance.score >= 60) {
    return {
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-l-yellow-500',
      textColor: 'text-yellow-600',
      ringColor: 'ring-yellow-200',
      status: 'Fair'
    };
  }
  
  return {
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-l-orange-500',
    textColor: 'text-orange-600',
    ringColor: 'ring-orange-200',
    status: 'Needs Help'
  };
};
