
export type KnowledgeType = 'conceptual' | 'procedural' | 'factual';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type AssessmentType = 'quiz' | 'test' | 'project' | 'homework' | 'formative' | 'summative';
export type ErrorType = 'conceptual' | 'procedural' | 'factual' | 'none';

export const knowledgeTypeOptions: KnowledgeType[] = ['conceptual', 'procedural', 'factual'];
export const difficultyLevelOptions: DifficultyLevel[] = ['easy', 'medium', 'hard'];
export const assessmentTypeOptions: AssessmentType[] = ['quiz', 'test', 'project', 'homework', 'formative', 'summative'];
export const errorTypeOptions: ErrorType[] = ['conceptual', 'procedural', 'factual', 'none'];

export interface Assessment {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  assessment_type: AssessmentType;
  standards_covered?: string[];
  max_score: number;
  created_at: string;
  updated_at: string;
  assessment_date?: string;
  is_draft?: boolean;
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

export interface AssessmentAnalysis {
  id: string;
  assessment_id: string;
  student_id: string;
  strengths: string[];
  growth_areas: string[];
  patterns_observed: string[];
  recommendations: string[];
  overall_summary?: string;
  analysis_json?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AssessmentFormData {
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  assessment_type: AssessmentType;
  standards_covered?: string[];
  max_score: number;
  assessment_date?: string;
  is_draft?: boolean;
}

export interface AssessmentItemFormData {
  question_text: string;
  item_number: number;
  knowledge_type: KnowledgeType;
  difficulty_level: DifficultyLevel;
  standard_reference?: string;
  max_score: number;
}

export interface StudentResponseFormData {
  student_id: string;
  assessment_id: string;
  assessment_item_id: string;
  score: number;
  error_type?: ErrorType;
  teacher_notes?: string;
}
