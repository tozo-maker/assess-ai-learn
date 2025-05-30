
import { supabase } from '@/integrations/supabase/client';

export interface ImportValidationResult {
  valid: number;
  warnings: number;
  errors: number;
  issues: string[];
  students: EnhancedStudentData[];
}

export interface EnhancedStudentData {
  [key: string]: string;
  preview_status?: 'valid' | 'warning' | 'error';
  preview_issues?: string[];
}

export interface ImportProgress {
  current: number;
  total: number;
  status: 'processing' | 'completed' | 'error';
  message: string;
}

class EnhancedImportService {
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateRequired(value: string, fieldName: string): string[] {
    const issues: string[] = [];
    if (!value || value.trim() === '') {
      issues.push(`${fieldName} is required`);
    }
    return issues;
  }

  private validateOptional(value: string, fieldName: string, type: 'email' | 'phone' | 'text'): string[] {
    const issues: string[] = [];
    
    if (value && value.trim() !== '') {
      switch (type) {
        case 'email':
          if (!this.validateEmail(value)) {
            issues.push(`Invalid email format: ${value}`);
          }
          break;
        case 'phone':
          const phoneRegex = /^[\d\s\-\(\)\+\.]{10,}$/;
          if (!phoneRegex.test(value)) {
            issues.push(`Invalid phone format: ${value}`);
          }
          break;
        case 'text':
          if (value.length > 500) {
            issues.push(`${fieldName} too long (max 500 characters)`);
          }
          break;
      }
    }
    
    return issues;
  }

  async validateImportData(
    students: any[], 
    mapping: Record<string, string>
  ): Promise<ImportValidationResult> {
    const result: ImportValidationResult = {
      valid: 0,
      warnings: 0,
      errors: 0,
      issues: [],
      students: []
    };

    // Get existing students for duplicate checking
    let existingStudents: any[] = [];
    try {
      const { data } = await supabase
        .from('students')
        .select('first_name, last_name, student_id, parent_email');
      existingStudents = data || [];
    } catch (error) {
      console.error('Error fetching existing students:', error);
    }

    students.forEach((student, index) => {
      const rowNumber = index + 2; // CSV row number (accounting for header)
      const issues: string[] = [];
      let status: 'valid' | 'warning' | 'error' = 'valid';

      // Map student data according to column mapping
      const mappedStudent: EnhancedStudentData = {};
      Object.entries(mapping).forEach(([fieldKey, csvHeader]) => {
        if (csvHeader !== 'skip') {
          mappedStudent[fieldKey] = student[csvHeader] || '';
        }
      });

      // Validate required fields
      const firstNameIssues = this.validateRequired(mappedStudent.first_name, 'First Name');
      const lastNameIssues = this.validateRequired(mappedStudent.last_name, 'Last Name');
      issues.push(...firstNameIssues, ...lastNameIssues);

      // Validate optional fields
      if (mappedStudent.parent_email) {
        issues.push(...this.validateOptional(mappedStudent.parent_email, 'Parent Email', 'email'));
      }

      if (mappedStudent.parent_phone) {
        issues.push(...this.validateOptional(mappedStudent.parent_phone, 'Parent Phone', 'phone'));
      }

      if (mappedStudent.learning_goals) {
        issues.push(...this.validateOptional(mappedStudent.learning_goals, 'Learning Goals', 'text'));
      }

      if (mappedStudent.special_considerations) {
        issues.push(...this.validateOptional(mappedStudent.special_considerations, 'Special Considerations', 'text'));
      }

      // Check for duplicates
      const isDuplicate = existingStudents.some(existing => 
        (existing.first_name?.toLowerCase() === mappedStudent.first_name?.toLowerCase() &&
         existing.last_name?.toLowerCase() === mappedStudent.last_name?.toLowerCase()) ||
        (mappedStudent.student_id && existing.student_id === mappedStudent.student_id) ||
        (mappedStudent.parent_email && existing.parent_email === mappedStudent.parent_email)
      );

      if (isDuplicate) {
        issues.push('Potential duplicate detected');
        status = 'warning';
      }

      // Determine final status
      if (issues.some(issue => 
        issue.includes('required') || 
        issue.includes('Invalid email') ||
        issue.includes('Invalid phone')
      )) {
        status = 'error';
        result.errors++;
      } else if (issues.length > 0) {
        status = 'warning';
        result.warnings++;
      } else {
        result.valid++;
      }

      // Add row-specific issues to global issues list
      if (issues.length > 0) {
        result.issues.push(`Row ${rowNumber}: ${issues.join(', ')}`);
      }

      // Add validation metadata to student
      mappedStudent.preview_status = status;
      mappedStudent.preview_issues = issues;
      
      result.students.push(mappedStudent);
    });

    return result;
  }

  async performBulkImport(
    validatedStudents: EnhancedStudentData[],
    options: {
      duplicateHandling: 'skip' | 'update' | 'create_new';
      batchSize?: number;
      onProgress?: (progress: ImportProgress) => void;
    }
  ): Promise<{
    success: number;
    updated: number;
    skipped: number;
    errors: string[];
  }> {
    const { duplicateHandling, batchSize = 50, onProgress } = options;
    const results = {
      success: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Filter out error records
    const validStudents = validatedStudents.filter(s => s.preview_status !== 'error');
    
    // Get existing students if handling duplicates
    let existingStudents: any[] = [];
    if (duplicateHandling !== 'create_new') {
      const { data } = await supabase.from('students').select('*');
      existingStudents = data || [];
    }

    // Process in batches
    const totalBatches = Math.ceil(validStudents.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batch = validStudents.slice(
        batchIndex * batchSize, 
        (batchIndex + 1) * batchSize
      );

      onProgress?.({
        current: batchIndex * batchSize,
        total: validStudents.length,
        status: 'processing',
        message: `Processing batch ${batchIndex + 1} of ${totalBatches}`
      });

      const batchOperations = batch.map(async (studentData, studentIndex) => {
        const globalIndex = batchIndex * batchSize + studentIndex;
        
        try {
          // Check for existing student
          const existingStudent = existingStudents.find(existing => 
            (existing.first_name?.toLowerCase() === studentData.first_name?.toLowerCase() &&
             existing.last_name?.toLowerCase() === studentData.last_name?.toLowerCase()) ||
            (studentData.student_id && existing.student_id === studentData.student_id)
          );

          if (existingStudent && duplicateHandling === 'skip') {
            results.skipped++;
            return;
          }

          // Prepare clean student object
          const cleanStudent = {
            first_name: studentData.first_name || '',
            last_name: studentData.last_name || '',
            student_id: studentData.student_id || null,
            grade_level: studentData.grade_level || '1st',
            learning_goals: studentData.learning_goals || null,
            special_considerations: studentData.special_considerations || null,
            parent_name: studentData.parent_name || null,
            parent_email: studentData.parent_email || null,
            parent_phone: studentData.parent_phone || null,
            teacher_id: user.id
          };

          if (existingStudent && duplicateHandling === 'update') {
            const { error } = await supabase
              .from('students')
              .update(cleanStudent)
              .eq('id', existingStudent.id);

            if (error) throw error;
            results.updated++;
          } else {
            const { error } = await supabase
              .from('students')
              .insert([cleanStudent]);

            if (error) throw error;
            results.success++;
          }
        } catch (error) {
          results.errors.push(`Row ${globalIndex + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      // Execute batch operations
      await Promise.allSettled(batchOperations);

      // Small delay between batches to prevent overwhelming the database
      if (batchIndex < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    onProgress?.({
      current: validStudents.length,
      total: validStudents.length,
      status: 'completed',
      message: 'Import completed successfully'
    });

    return results;
  }

  // Enhanced CSV parsing with better error handling
  parseEnhancedCSV(csvText: string): { headers: string[]; data: any[]; errors: string[] } {
    const errors: string[] = [];
    const lines = csvText.trim().split('\n');
    
    if (lines.length === 0) {
      errors.push('CSV file is empty');
      return { headers: [], data: [], errors };
    }

    // Parse headers with validation
    const headers = this.parseCSVLine(lines[0]);
    if (headers.length === 0) {
      errors.push('No headers found in CSV file');
      return { headers: [], data: [], errors };
    }

    // Check for duplicate headers
    const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
    if (duplicateHeaders.length > 0) {
      errors.push(`Duplicate headers found: ${duplicateHeaders.join(', ')}`);
    }

    const data: any[] = [];
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue; // Skip empty lines

      const values = this.parseCSVLine(line);
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Expected ${headers.length} columns, found ${values.length}`);
        continue;
      }

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return { headers, data, errors };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(val => val.replace(/"/g, ''));
  }
}

export const enhancedImportService = new EnhancedImportService();
