/**
 * Comprehensive input validation service
 * Provides client-side validation with sanitization
 */

import { z } from 'zod';
import { productionLogger } from './production-logger';

// Common validation schemas
export const ValidationSchemas = {
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  
  gradeLevel: z.enum(['elementary', 'middle', 'high'], {
    errorMap: () => ({ message: 'Invalid grade level' })
  }),
  
  subject: z.enum(['math', 'science', 'english', 'history', 'other'], {
    errorMap: () => ({ message: 'Invalid subject' })
  }),
  
  score: z.number()
    .min(0, 'Score cannot be negative')
    .max(100, 'Score cannot exceed 100'),
  
  phoneNumber: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  
  text: z.string()
    .max(1000, 'Text too long')
    .optional(),
  
  uuid: z.string().uuid('Invalid ID format'),
  
  positiveInteger: z.number().int().positive('Must be a positive integer'),
  
  percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100')
};

// Student validation schema
export const StudentSchema = z.object({
  first_name: ValidationSchemas.name,
  last_name: ValidationSchemas.name,
  grade_level: ValidationSchemas.gradeLevel,
  student_id: z.string().optional(),
  parent_name: ValidationSchemas.name.optional(),
  parent_email: ValidationSchemas.email.optional(),
  parent_phone: ValidationSchemas.phoneNumber,
  special_considerations: ValidationSchemas.text,
  learning_goals: ValidationSchemas.text,
  class_id: ValidationSchemas.uuid.optional()
});

// Assessment validation schema
export const AssessmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: ValidationSchemas.text,
  subject: ValidationSchemas.subject,
  grade_level: ValidationSchemas.gradeLevel,
  assessment_type: z.enum(['quiz', 'test', 'assignment', 'project', 'other']),
  max_score: ValidationSchemas.positiveInteger,
  assessment_date: z.string().optional(),
  standards_covered: z.array(z.string()).optional()
});

// Goal validation schema
export const GoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: ValidationSchemas.text,
  target_date: z.string().optional(),
  student_id: ValidationSchemas.uuid
});

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize HTML to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize text input
   */
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input.trim().slice(0, 1000); // Limit length
  }

  /**
   * Sanitize email
   */
  static sanitizeEmail(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input.toLowerCase().trim();
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: any): number | null {
    const num = Number(input);
    return isNaN(num) ? null : num;
  }

  /**
   * Remove potentially dangerous characters
   */
  static removeDangerousChars(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input.replace(/[<>'"&]/g, '');
  }
}

/**
 * Validation service with logging
 */
export class ValidationService {
  /**
   * Validate data against schema with logging
   */
  static validate<T>(
    data: unknown,
    schema: z.ZodSchema<T>,
    context: string
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = schema.safeParse(data);
      
      if (result.success) {
        productionLogger.debug(`Validation successful: ${context}`, {
          context,
          validation: 'success'
        });
        return { success: true, data: result.data };
      } else {
        const errors = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        productionLogger.warn(`Validation failed: ${context}`, {
          context,
          validation: 'failed',
          errors
        });
        
        return { success: false, errors };
      }
    } catch (error) {
      productionLogger.error(`Validation error: ${context}`, error as Error);
      return { 
        success: false, 
        errors: ['Validation failed due to internal error'] 
      };
    }
  }

  /**
   * Validate and sanitize student data
   */
  static validateStudent(data: unknown) {
    return this.validate(data, StudentSchema, 'student_validation');
  }

  /**
   * Validate and sanitize assessment data
   */
  static validateAssessment(data: unknown) {
    return this.validate(data, AssessmentSchema, 'assessment_validation');
  }

  /**
   * Validate and sanitize goal data
   */
  static validateGoal(data: unknown) {
    return this.validate(data, GoalSchema, 'goal_validation');
  }

  /**
   * Sanitize form data before validation
   */
  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = InputSanitizer.sanitizeText(value);
      } else if (typeof value === 'number') {
        sanitized[key] = InputSanitizer.sanitizeNumber(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}