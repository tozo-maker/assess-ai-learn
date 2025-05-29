
import DOMPurify from 'dompurify';

export class InputSanitizer {
  // Sanitize HTML content
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['class']
    });
  }

  // Sanitize plain text (remove HTML, trim, normalize whitespace)
  static sanitizeText(input: string): string {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Sanitize email addresses
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  // Sanitize phone numbers (remove non-numeric characters except +, -, (, ), space)
  static sanitizePhone(phone: string): string {
    return phone.replace(/[^\d+\-() ]/g, '').trim();
  }

  // Sanitize names (capitalize first letter, allow only letters, spaces, hyphens, apostrophes)
  static sanitizeName(name: string): string {
    return name
      .replace(/[^a-zA-Z\s\-']/g, '')
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Sanitize numeric input
  static sanitizeNumber(input: string, options: {
    allowDecimal?: boolean;
    allowNegative?: boolean;
    min?: number;
    max?: number;
  } = {}): number | null {
    const { allowDecimal = true, allowNegative = false, min, max } = options;
    
    // Remove non-numeric characters
    let cleaned = input.replace(/[^\d.-]/g, '');
    
    if (!allowDecimal) {
      cleaned = cleaned.replace(/\./g, '');
    }
    
    if (!allowNegative) {
      cleaned = cleaned.replace(/-/g, '');
    }
    
    const number = parseFloat(cleaned);
    
    if (isNaN(number)) return null;
    
    // Apply min/max constraints
    if (min !== undefined && number < min) return min;
    if (max !== undefined && number > max) return max;
    
    return number;
  }

  // Sanitize assessment scores
  static sanitizeScore(score: string, maxScore: number): number | null {
    const sanitized = this.sanitizeNumber(score, { 
      allowDecimal: true, 
      allowNegative: false, 
      min: 0, 
      max: maxScore 
    });
    
    return sanitized;
  }

  // Sanitize grade levels
  static sanitizeGradeLevel(grade: string): string {
    const validGrades = [
      'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', 
      '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade',
      '9th Grade', '10th Grade', '11th Grade', '12th Grade'
    ];
    
    const normalized = grade.trim();
    return validGrades.includes(normalized) ? normalized : '';
  }

  // Sanitize subject names
  static sanitizeSubject(subject: string): string {
    const validSubjects = [
      'Mathematics', 'English Language Arts', 'Science', 'Social Studies',
      'Reading', 'Writing', 'History', 'Geography', 'Biology', 'Chemistry',
      'Physics', 'Art', 'Music', 'Physical Education', 'Computer Science'
    ];
    
    const normalized = subject.trim();
    return validSubjects.includes(normalized) ? normalized : subject.replace(/[^a-zA-Z\s]/g, '').trim();
  }

  // Comprehensive form data sanitization
  static sanitizeFormData<T extends Record<string, any>>(data: T): T {
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      const value = sanitized[key];
      
      if (typeof value === 'string') {
        switch (key) {
          case 'email':
          case 'parent_email':
            sanitized[key] = this.sanitizeEmail(value);
            break;
          case 'phone':
          case 'parent_phone':
            sanitized[key] = this.sanitizePhone(value);
            break;
          case 'first_name':
          case 'last_name':
          case 'parent_name':
            sanitized[key] = this.sanitizeName(value);
            break;
          case 'grade_level':
            sanitized[key] = this.sanitizeGradeLevel(value);
            break;
          case 'subject':
            sanitized[key] = this.sanitizeSubject(value);
            break;
          default:
            // Default text sanitization
            sanitized[key] = this.sanitizeText(value);
        }
      }
    });
    
    return sanitized;
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();
  
  static checkRateLimit(
    identifier: string, 
    maxRequests: number, 
    windowMs: number
  ): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || [];
    
    // Filter out requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    
    // Check if we're within the limit
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request and update
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  static reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}
