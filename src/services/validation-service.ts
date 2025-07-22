import { z } from 'zod';

// Define validation schemas
const StudentSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  grade_level: z.enum(['kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']),
  learning_style: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
  special_considerations: z.string().max(500, 'Special considerations too long').optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

const AssessmentSchema = z.object({
  title: z.string().min(1, 'Assessment title is required').max(100, 'Title too long'),
  subject: z.string().min(1, 'Subject is required'),
  grade_level: z.string().min(1, 'Grade level is required'),
  total_points: z.number().min(1, 'Total points must be greater than 0').max(1000, 'Total points too high'),
  assessment_date: z.string().min(1, 'Assessment date is required'),
  instructions: z.string().max(1000, 'Instructions too long').optional(),
});

const StudentResponseSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
  assessment_id: z.string().uuid('Invalid assessment ID'),
  score: z.number().min(0, 'Score cannot be negative').max(1000, 'Score too high'),
  time_taken: z.number().min(1, 'Time taken must be greater than 0').optional(),
  responses: z.array(z.object({
    question_id: z.string(),
    answer: z.string(),
    points_earned: z.number().min(0),
    is_correct: z.boolean().optional(),
  })).min(1, 'At least one response is required'),
});

const GoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  target_date: z.string().min(1, 'Target date is required'),
  skill_area: z.string().min(1, 'Skill area is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  status: z.enum(['not_started', 'in_progress', 'completed', 'on_hold']).default('not_started'),
});

// Validation service class
export class ValidationService {
  private static instance: ValidationService;

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  validateStudent(data: any): { success: boolean; errors?: string[]; data?: any } {
    try {
      const validatedData = StudentSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  validateAssessment(data: any): { success: boolean; errors?: string[]; data?: any } {
    try {
      const validatedData = AssessmentSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  validateStudentResponse(data: any): { success: boolean; errors?: string[]; data?: any } {
    try {
      const validatedData = StudentResponseSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  validateGoal(data: any): { success: boolean; errors?: string[]; data?: any } {
    try {
      const validatedData = GoalSchema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  // Sanitize data for security
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate UUID format
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Validate date format and constraints
  isValidDate(dateString: string, futureOnly = false): boolean {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    if (futureOnly) {
      return date > new Date();
    }
    
    return true;
  }

  // Check for SQL injection patterns
  containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /('|(\\')|(;)|(\-\-)|(\/\*)|(\*\/)|(\|)|(\|\|)|(\&)|(\&\&)|(\+)|(\+\+))/i,
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
      /(script|javascript|vbscript|onload|onerror|onclick)/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Comprehensive data validation
  validateAndSanitize(data: any, schema: z.ZodSchema<any>): { success: boolean; errors?: string[]; data?: any } {
    try {
      // First sanitize string inputs
      const sanitizedData = this.sanitizeObjectStrings(data);
      
      // Check for SQL injection
      if (this.containsSQLInObject(sanitizedData)) {
        return { success: false, errors: ['Invalid input detected'] };
      }
      
      // Validate with schema
      const validatedData = schema.parse(sanitizedData);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  private sanitizeObjectStrings(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeInput(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObjectStrings(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObjectStrings(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  private containsSQLInObject(obj: any): boolean {
    if (typeof obj === 'string') {
      return this.containsSQLInjection(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.some(item => this.containsSQLInObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => this.containsSQLInObject(value));
    }
    
    return false;
  }
}

export const validationService = ValidationService.getInstance();
export { StudentSchema, AssessmentSchema, StudentResponseSchema, GoalSchema };