/**
 * Data integrity and audit service
 * Provides data validation, consistency checks, and audit trails
 */

import { productionLogger } from './production-logger';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  correctedData?: any;
}

export interface ConsistencyCheckResult {
  table: string;
  inconsistencies: Array<{
    recordId: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    suggestedFix?: string;
  }>;
}

class DataIntegrityService {
  private auditLog: AuditLogEntry[] = [];
  private validationRules = new Map<string, (data: any) => DataValidationResult>();

  constructor() {
    this.setupValidationRules();
  }

  /**
   * Setup data validation rules for different entities
   */
  private setupValidationRules(): void {
    // Student validation rules
    this.validationRules.set('student', (data: any): DataValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!data.first_name || data.first_name.trim().length === 0) {
        errors.push('First name is required');
      }
      if (!data.last_name || data.last_name.trim().length === 0) {
        errors.push('Last name is required');
      }
      if (!data.grade_level) {
        errors.push('Grade level is required');
      }
      if (!data.teacher_id) {
        errors.push('Teacher ID is required');
      }

      // Check email format if provided
      if (data.parent_email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.parent_email)) {
        errors.push('Invalid parent email format');
      }

      // Check phone format if provided
      if (data.parent_phone && !/^[+]?[1-9][\d]{0,15}$/.test(data.parent_phone)) {
        warnings.push('Parent phone number format may be invalid');
      }

      // Check for potential duplicates
      if (data.first_name && data.last_name && data.grade_level) {
        warnings.push('Check for potential duplicate student records');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    });

    // Assessment validation rules
    this.validationRules.set('assessment', (data: any): DataValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!data.title || data.title.trim().length === 0) {
        errors.push('Assessment title is required');
      }
      if (!data.subject) {
        errors.push('Subject is required');
      }
      if (!data.grade_level) {
        errors.push('Grade level is required');
      }
      if (!data.max_score || data.max_score <= 0) {
        errors.push('Max score must be greater than 0');
      }
      if (!data.teacher_id) {
        errors.push('Teacher ID is required');
      }

      // Check assessment date
      if (data.assessment_date) {
        const assessmentDate = new Date(data.assessment_date);
        const today = new Date();
        if (assessmentDate > today) {
          warnings.push('Assessment date is in the future');
        }
        if (assessmentDate < new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)) {
          warnings.push('Assessment date is more than a year ago');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    });

    // Goal validation rules
    this.validationRules.set('goal', (data: any): DataValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!data.title || data.title.trim().length === 0) {
        errors.push('Goal title is required');
      }
      if (!data.student_id) {
        errors.push('Student ID is required');
      }
      if (!data.teacher_id) {
        errors.push('Teacher ID is required');
      }

      // Check target date
      if (data.target_date) {
        const targetDate = new Date(data.target_date);
        const today = new Date();
        if (targetDate < today) {
          warnings.push('Target date is in the past');
        }
        if (targetDate > new Date(today.getTime() + 2 * 365 * 24 * 60 * 60 * 1000)) {
          warnings.push('Target date is more than 2 years in the future');
        }
      }

      // Check progress percentage
      if (data.progress_percentage !== undefined) {
        if (data.progress_percentage < 0 || data.progress_percentage > 100) {
          errors.push('Progress percentage must be between 0 and 100');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    });
  }

  /**
   * Validate data using predefined rules
   */
  validateData(entityType: string, data: any): DataValidationResult {
    const validator = this.validationRules.get(entityType);
    
    if (!validator) {
      productionLogger.warn(`No validation rules found for entity type: ${entityType}`);
      return {
        isValid: true,
        errors: [],
        warnings: [`No validation rules defined for ${entityType}`]
      };
    }

    try {
      const result = validator(data);
      
      if (!result.isValid) {
        productionLogger.warn(`Data validation failed for ${entityType}`, {
          entityType,
          errors: result.errors,
          warnings: result.warnings
        });
      }

      return result;
    } catch (error) {
      productionLogger.error(`Validation error for ${entityType}`, error as Error);
      return {
        isValid: false,
        errors: ['Validation process failed'],
        warnings: []
      };
    }
  }

  /**
   * Log data changes for audit trail
   */
  logDataChange(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    oldData?: any,
    newData?: any,
    metadata?: Record<string, any>
  ): void {
    const changes: Record<string, { old: any; new: any }> = {};

    if (oldData && newData) {
      // Track field-level changes
      const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
      
      allKeys.forEach(key => {
        if (oldData[key] !== newData[key]) {
          changes[key] = {
            old: oldData[key],
            new: newData[key]
          };
        }
      });
    }

    const auditEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId,
      action,
      resource,
      resourceId,
      changes,
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...metadata
      }
    };

    this.auditLog.push(auditEntry);

    // Log the audit entry
    productionLogger.info(`Audit: ${action} ${resource}`, {
      audit: true,
      userId,
      action,
      resource,
      resourceId,
      changesCount: Object.keys(changes).length
    });

    // Keep only last 1000 entries in memory
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }

    // Persist critical changes to database
    if (['create', 'update', 'delete'].includes(action.toLowerCase())) {
      this.persistAuditEntry(auditEntry);
    }
  }

  /**
   * Persist audit entry to database
   */
  private async persistAuditEntry(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from('system_performance_logs')
        .insert({
          endpoint: `audit/${entry.resource}`,
          method: entry.action.toUpperCase(),
          status_code: 200,
          response_time_ms: 0,
          error_message: `Audit: ${entry.action} ${entry.resource} ${entry.resourceId}\\nChanges: ${JSON.stringify(entry.changes, null, 2)}`,
          user_id: entry.userId
        });

      if (error) {
        productionLogger.error('Failed to persist audit entry', error);
      }
    } catch (error) {
      productionLogger.error('Error persisting audit entry', error as Error);
    }
  }

  /**
   * Run data consistency checks
   */
  async runConsistencyChecks(): Promise<ConsistencyCheckResult[]> {
    const results: ConsistencyCheckResult[] = [];

    try {
      // Check for orphaned student records
      const orphanedStudents = await this.checkOrphanedStudents();
      if (orphanedStudents.inconsistencies.length > 0) {
        results.push(orphanedStudents);
      }

      // Check for duplicate student records
      const duplicateStudents = await this.checkDuplicateStudents();
      if (duplicateStudents.inconsistencies.length > 0) {
        results.push(duplicateStudents);
      }

      // Check for invalid assessment scores
      const invalidScores = await this.checkInvalidAssessmentScores();
      if (invalidScores.inconsistencies.length > 0) {
        results.push(invalidScores);
      }

      // Check for goals without students
      const orphanedGoals = await this.checkOrphanedGoals();
      if (orphanedGoals.inconsistencies.length > 0) {
        results.push(orphanedGoals);
      }

      productionLogger.info('Data consistency checks completed', {
        totalChecks: 4,
        issuesFound: results.reduce((sum, r) => sum + r.inconsistencies.length, 0)
      });

    } catch (error) {
      productionLogger.error('Error running consistency checks', error as Error);
    }

    return results;
  }

  /**
   * Check for orphaned student records (students without valid teacher)
   */
  private async checkOrphanedStudents(): Promise<ConsistencyCheckResult> {
    // This would typically check against the auth.users table or teacher_profiles
    // For now, we'll return a placeholder
    return {
      table: 'students',
      inconsistencies: []
    };
  }

  /**
   * Check for duplicate student records
   */
  private async checkDuplicateStudents(): Promise<ConsistencyCheckResult> {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, grade_level, teacher_id');

      if (error) throw error;

      const inconsistencies: ConsistencyCheckResult['inconsistencies'] = [];
      const seen = new Map<string, string>();

      students?.forEach(student => {
        const key = `${student.first_name}_${student.last_name}_${student.grade_level}_${student.teacher_id}`;
        if (seen.has(key)) {
          inconsistencies.push({
            recordId: student.id,
            issue: `Potential duplicate of student ID: ${seen.get(key)}`,
            severity: 'medium',
            suggestedFix: 'Review and merge duplicate records'
          });
        } else {
          seen.set(key, student.id);
        }
      });

      return {
        table: 'students',
        inconsistencies
      };
    } catch (error) {
      productionLogger.error('Error checking duplicate students', error as Error);
      return { table: 'students', inconsistencies: [] };
    }
  }

  /**
   * Check for invalid assessment scores
   */
  private async checkInvalidAssessmentScores(): Promise<ConsistencyCheckResult> {
    try {
      const { data: responses, error } = await supabase
        .from('student_responses')
        .select(`
          id, 
          score, 
          assessment_id,
          assessments(max_score)
        `);

      if (error) throw error;

      const inconsistencies: ConsistencyCheckResult['inconsistencies'] = [];

      responses?.forEach(response => {
        const maxScore = (response.assessments as any)?.max_score;
        if (maxScore && response.score > maxScore) {
          inconsistencies.push({
            recordId: response.id,
            issue: `Score ${response.score} exceeds max score ${maxScore}`,
            severity: 'high',
            suggestedFix: `Cap score at ${maxScore} or update assessment max score`
          });
        }
        if (response.score < 0) {
          inconsistencies.push({
            recordId: response.id,
            issue: `Negative score: ${response.score}`,
            severity: 'high',
            suggestedFix: 'Set score to 0 or correct data entry'
          });
        }
      });

      return {
        table: 'student_responses',
        inconsistencies
      };
    } catch (error) {
      productionLogger.error('Error checking invalid assessment scores', error as Error);
      return { table: 'student_responses', inconsistencies: [] };
    }
  }

  /**
   * Check for orphaned goals
   */
  private async checkOrphanedGoals(): Promise<ConsistencyCheckResult> {
    try {
      const { data: goals, error } = await supabase
        .from('goals')
        .select(`
          id, 
          student_id,
          students(id)
        `);

      if (error) throw error;

      const inconsistencies: ConsistencyCheckResult['inconsistencies'] = [];

      goals?.forEach(goal => {
        if (!goal.students) {
          inconsistencies.push({
            recordId: goal.id,
            issue: `Goal references non-existent student: ${goal.student_id}`,
            severity: 'medium',
            suggestedFix: 'Delete orphaned goal or link to valid student'
          });
        }
      });

      return {
        table: 'goals',
        inconsistencies
      };
    } catch (error) {
      productionLogger.error('Error checking orphaned goals', error as Error);
      return { table: 'goals', inconsistencies: [] };
    }
  }

  /**
   * Get audit log entries
   */
  getAuditLog(filters?: {
    userId?: string;
    resource?: string;
    action?: string;
    fromDate?: string;
    toDate?: string;
  }): AuditLogEntry[] {
    let filtered = this.auditLog;

    if (filters) {
      filtered = filtered.filter(entry => {
        if (filters.userId && entry.userId !== filters.userId) return false;
        if (filters.resource && entry.resource !== filters.resource) return false;
        if (filters.action && entry.action !== filters.action) return false;
        if (filters.fromDate && entry.timestamp < filters.fromDate) return false;
        if (filters.toDate && entry.timestamp > filters.toDate) return false;
        return true;
      });
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Export audit data
   */
  exportAuditData(format: 'json' | 'csv' = 'json'): string {
    const data = this.getAuditLog();
    
    if (format === 'csv') {
      const headers = ['timestamp', 'userId', 'action', 'resource', 'resourceId', 'changes'];
      const rows = data.map(entry => [
        entry.timestamp,
        entry.userId,
        entry.action,
        entry.resource,
        entry.resourceId,
        JSON.stringify(entry.changes)
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(data, null, 2);
  }
}

export const dataIntegrityService = new DataIntegrityService();
