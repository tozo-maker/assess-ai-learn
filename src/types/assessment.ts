export type GradeLevel = 'K' | '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th' | '7th' | '8th' | '9th' | '10th' | '11th' | '12th';
export type AssessmentType = 'quiz' | 'test' | 'project' | 'homework' | 'classwork' | 'other';
export type KnowledgeType = 'factual' | 'conceptual' | 'procedural' | 'metacognitive';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ErrorType = 'conceptual' | 'procedural' | 'factual' | 'none';

export const knowledgeTypeOptions: KnowledgeType[] = ['factual', 'conceptual', 'procedural', 'metacognitive'];
export const difficultyLevelOptions: DifficultyLevel[] = ['easy', 'medium', 'hard'];
export const assessmentTypeOptions: AssessmentType[] = ['quiz', 'test', 'project', 'homework', 'classwork', 'other'];
export const errorTypeOptions: ErrorType[] = ['conceptual', 'procedural', 'factual', 'none'];

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  subject: string;
  grade_level: GradeLevel;
  assessment_type: AssessmentType;
  standards_covered?: string[];
  max_score: number;
  assessment_date?: string;
  is_draft?: boolean;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentFormData {
  title: string;
  description?: string;
  subject: string;
  grade_level: GradeLevel;
  assessment_type: AssessmentType;
  standards_covered?: string[];
  max_score: number;
  assessment_date?: string;
  is_draft?: boolean;
  teacher_id: string; // Make this required instead of optional
}

export interface AssessmentItem {
  id: string;
  assessment_id: string;
  question_text: string;
  item_number: number;
  knowledge_type: KnowledgeType;
  difficulty_level: DifficultyLevel;
  standard_reference?: string;
  max_score: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentItemFormData {
  question_text: string;
  item_number: number;
  knowledge_type: KnowledgeType;
  difficulty_level: DifficultyLevel;
  standard_reference?: string;
  max_score: number;
}

export interface StudentResponse {
  id: string;
  student_id: string;
  assessment_id: string;
  assessment_item_id: string;
  score: number;
  error_type?: ErrorType;
  teacher_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentResponseFormData {
  student_id: string;
  assessment_id: string;
  assessment_item_id: string;
  score: number;
  error_type?: ErrorType;
  teacher_notes?: string;
}

export interface AssessmentAnalysis {
  id: string;
  assessment_id: string;
  student_id: string;
  strengths: string[];
  growth_areas: string[];
  patterns_observed: string[];
  recommendations: string[];
  overall_summary?: string;
  analysis_json?: any;
  created_at: string;
  updated_at: string;
}

// AI Model options for assessment analysis
export type AIModelType = 'openai' | 'anthropic';
export const aiModelOptions: AIModelType[] = ['openai', 'anthropic'];
