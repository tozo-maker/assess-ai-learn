/**
 * Console cleanup service - systematically removes console statements
 * This service helps identify and replace console.log statements with proper logging
 */

import { unifiedErrorSystem } from './unified-error-system';

// Global console override for production
if (process.env.NODE_ENV === 'production') {
  // Override console methods in production
  const originalConsole = { ...console };
  
  console.log = (...args: any[]) => {
    unifiedErrorSystem.debug('Console.log intercepted', { args: args.map(String) });
  };
  
  console.warn = (...args: any[]) => {
    unifiedErrorSystem.warn('Console.warn intercepted', { args: args.map(String) });
  };
  
  console.error = (...args: any[]) => {
    if (args[0] instanceof Error) {
      unifiedErrorSystem.error('Console.error intercepted', {
        error: args[0],
        context: { additionalArgs: args.slice(1).map(String) }
      });
    } else {
      unifiedErrorSystem.error('Console.error intercepted', {
        context: { args: args.map(String) }
      });
    }
  };
  
  console.info = (...args: any[]) => {
    unifiedErrorSystem.info('Console.info intercepted', { args: args.map(String) });
  };
}

/**
 * Migration helper functions for replacing console statements
 */
export const ConsoleCleanup = {
  replaceLogs: (message: string, data?: any) => {
    unifiedErrorSystem.debug(message, data);
  },

  /**
   * Replace console.error with structured error logging
   */
  replaceErrors: (message: string, error?: Error, context?: any) => {
    unifiedErrorSystem.error(message, { error, context });
  },

  /**
   * Replace console.warn with structured warning logging
   */
  replaceWarnings: (message: string, context?: any) => {
    unifiedErrorSystem.warn(message, context);
  },

  /**
   * Replace console.info with structured info logging
   */
  replaceInfo: (message: string, context?: any) => {
    unifiedErrorSystem.info(message, context);
  }
};

/**
 * List of console statements found in the codebase that need replacement
 * This serves as a migration checklist
 */
export const CONSOLE_STATEMENTS_TO_REPLACE = [
  // Assessment components
  'src/components/assessments/AssessmentList.tsx:107',
  'src/components/assessments/AssessmentList.tsx:127',
  'src/components/assessments/AssessmentResponseManagement.tsx:83',
  'src/components/assessments/AssessmentSubmissionWorkflow.tsx:49',
  'src/components/assessments/AssessmentSubmissionWorkflow.tsx:85',
  'src/components/assessments/AssessmentWizard.tsx:163',
  'src/components/assessments/AssessmentWizard.tsx:221',
  'src/components/assessments/EnhancedStudentResponseForm.tsx:96',
  'src/components/assessments/EnhancedStudentResponseForm.tsx:136',
  'src/components/assessments/EnhancedStudentResponseForm.tsx:146',
  'src/components/assessments/StudentResponseForm.tsx:149',
  'src/components/assessments/StudentResponseForm.tsx:161',
  
  // Dashboard components
  'src/components/dashboard/DashboardEmptyState.tsx:18',
  'src/components/dashboard/DashboardStateHandler.tsx:24',
  'src/components/dashboard/DashboardStateHandler.tsx:34',
  'src/components/dashboard/DashboardStateHandler.tsx:40',
  'src/components/dashboard/DashboardStateHandler.tsx:55',
  'src/components/dashboard/DashboardStateHandler.tsx:60',
  
  // Other components
  'src/components/communications/ProgressReportGenerator.tsx:80',
  'src/components/communications/ProgressReportGenerator.tsx:87',
  'src/components/communications/ProgressReportGenerator.tsx:93',
  'src/components/communications/ProgressReportGenerator.tsx:105',
  'src/components/communications/ProgressReportGenerator.tsx:109',
  'src/components/communications/ProgressReportGenerator.tsx:117',
  'src/components/communications/ProgressReportGenerator.tsx:135',
  'src/components/communications/ProgressReportGenerator.tsx:142',
  'src/components/communications/ProgressReportGenerator.tsx:164',
  
  // Services and utilities
  'src/services/dashboard-service.ts:*',
  'src/services/supabase-service.ts:*',
  'src/hooks/useStudents.ts:*',
  'src/hooks/useAssessments.ts:*'
];

/**
 * Utility to check if console statements have been cleaned up
 */
export const auditConsoleUsage = () => {
  if (process.env.NODE_ENV === 'development') {
    unifiedErrorSystem.info('Console cleanup audit', {
      totalStatementsFound: CONSOLE_STATEMENTS_TO_REPLACE.length,
      recommendation: 'Replace console statements with structured logging'
    });
  }
};
