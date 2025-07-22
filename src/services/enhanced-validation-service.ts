
import { validationService } from './validation-service';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

class EnhancedValidationService {
  private static instance: EnhancedValidationService;

  static getInstance(): EnhancedValidationService {
    if (!EnhancedValidationService.instance) {
      EnhancedValidationService.instance = new EnhancedValidationService();
    }
    return EnhancedValidationService.instance;
  }

  // Student form validation schema
  getStudentFormSchema(): ValidationSchema {
    return {
      first_name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s'-]+$/
      },
      last_name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s'-]+$/
      },
      grade_level: {
        required: true,
        custom: (value) => {
          const validGrades = ['kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
          return validGrades.includes(value) || 'Please select a valid grade level';
        }
      },
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        custom: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Please enter a valid email address'
      },
      parent_email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        custom: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Please enter a valid parent email address'
      }
    };
  }

  // Assessment form validation schema
  getAssessmentFormSchema(): ValidationSchema {
    return {
      title: {
        required: true,
        minLength: 3,
        maxLength: 100
      },
      subject: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      grade_level: {
        required: true
      },
      total_points: {
        required: true,
        custom: (value) => {
          const num = parseInt(value);
          return (num > 0 && num <= 1000) || 'Total points must be between 1 and 1000';
        }
      }
    };
  }

  // Goal form validation schema
  getGoalFormSchema(): ValidationSchema {
    return {
      title: {
        required: true,
        minLength: 5,
        maxLength: 100
      },
      description: {
        maxLength: 500
      },
      target_date: {
        required: true,
        custom: (value) => {
          const date = new Date(value);
          const now = new Date();
          return date > now || 'Target date must be in the future';
        }
      }
    };
  }

  validateField(field: string, value: any, schemaType: 'student' | 'assessment' | 'goal'): string | null {
    let schema: ValidationSchema;
    
    switch (schemaType) {
      case 'student':
        schema = this.getStudentFormSchema();
        break;
      case 'assessment':
        schema = this.getAssessmentFormSchema();
        break;
      case 'goal':
        schema = this.getGoalFormSchema();
        break;
      default:
        return 'Invalid schema type';
    }

    const rules = schema[field];
    if (!rules) return null;

    // Required validation
    if (rules.required && (value === undefined || value === null || value === '')) {
      return `${field.replace('_', ' ')} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return null;

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return `${field.replace('_', ' ')} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${field.replace('_', ' ')} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${field.replace('_', ' ')} format is invalid`;
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value);
      if (typeof customResult === 'string') {
        return customResult;
      } else if (!customResult) {
        return `${field.replace('_', ' ')} is invalid`;
      }
    }

    return null;
  }

  validateObject(data: any, schemaType: 'student' | 'assessment' | 'goal'): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    let isValid = true;

    let schema: ValidationSchema;
    
    switch (schemaType) {
      case 'student':
        schema = this.getStudentFormSchema();
        break;
      case 'assessment':
        schema = this.getAssessmentFormSchema();
        break;
      case 'goal':
        schema = this.getGoalFormSchema();
        break;
      default:
        return { isValid: false, errors: { form: 'Invalid schema type' } };
    }

    for (const field of Object.keys(schema)) {
      const error = this.validateField(field, data[field], schemaType);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  validateForm(data: any, schemaType: 'student' | 'assessment' | 'goal'): { isValid: boolean; errors: Record<string, string> } {
    let schema: ValidationSchema;
    
    switch (schemaType) {
      case 'student':
        schema = this.getStudentFormSchema();
        break;
      case 'assessment':
        schema = this.getAssessmentFormSchema();
        break;
      case 'goal':
        schema = this.getGoalFormSchema();
        break;
      default:
        return { isValid: false, errors: { form: 'Invalid schema type' } };
    }

    const errors: Record<string, string> = {};
    let isValid = true;

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // Required validation
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field.replace('_', ' ')} is required`;
        isValid = false;
        continue;
      }

      // Skip other validations if field is empty and not required
      if (!value && !rules.required) continue;

      // Length validations
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field.replace('_', ' ')} must be at least ${rules.minLength} characters`;
        isValid = false;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field.replace('_', ' ')} must be no more than ${rules.maxLength} characters`;
        isValid = false;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = `${field.replace('_', ' ')} format is invalid`;
        isValid = false;
      }

      // Custom validation
      if (rules.custom) {
        const customResult = rules.custom(value);
        if (typeof customResult === 'string') {
          errors[field] = customResult;
          isValid = false;
        } else if (!customResult) {
          errors[field] = `${field.replace('_', ' ')} is invalid`;
          isValid = false;
        }
      }
    }

    return { isValid, errors };
  }
}

export const enhancedValidationService = EnhancedValidationService.getInstance();
