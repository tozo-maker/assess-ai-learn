
export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  grade_level: string;
  learning_goals?: string;
  special_considerations?: string;
  teacher_id: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentPerformance {
  id: string;
  student_id: string;
  assessment_count: number;
  average_score?: number;
  last_assessment_date?: string;
  performance_level?: string;
  needs_attention: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentWithPerformance extends Student {
  performance?: StudentPerformance;
}

export type GradeLevel = 
  | "K" 
  | "1st" 
  | "2nd" 
  | "3rd" 
  | "4th" 
  | "5th" 
  | "6th" 
  | "7th" 
  | "8th" 
  | "9th" 
  | "10th" 
  | "11th" 
  | "12th";

export const gradeLevelOptions: GradeLevel[] = [
  "K", "1st", "2nd", "3rd", "4th", "5th", "6th", 
  "7th", "8th", "9th", "10th", "11th", "12th"
];

export type PerformanceLevel = 
  | "Above Average" 
  | "Average" 
  | "Below Average";

export const performanceLevelOptions: PerformanceLevel[] = [
  "Above Average", 
  "Average", 
  "Below Average"
];
