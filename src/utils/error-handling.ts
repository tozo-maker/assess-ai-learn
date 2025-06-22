
import { useToast } from '@/hooks/use-toast';

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}

export class AssessmentError extends Error implements AppError {
  code: string;
  statusCode: number;
  context?: Record<string, any>;

  constructor(message: string, code: string = 'ASSESSMENT_ERROR', statusCode: number = 500, context?: Record<string, any>) {
    super(message);
    this.name = 'AssessmentError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
  }
}

export class AnalysisError extends Error implements AppError {
  code: string;
  statusCode: number;
  context?: Record<string, any>;

  constructor(message: string, code: string = 'ANALYSIS_ERROR', statusCode: number = 500, context?: Record<string, any>) {
    super(message);
    this.name = 'AnalysisError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
  }
}

export const handleError = (error: unknown, context?: string): AppError => {
  console.error(`Error in ${context || 'unknown context'}:`, error);
  
  if (error instanceof AssessmentError || error instanceof AnalysisError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500, { originalError: error.name });
  }
  
  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500);
};

export const useErrorHandler = () => {
  const { toast } = useToast();
  
  const showError = (error: AppError | Error, fallbackMessage?: string) => {
    const message = error.message || fallbackMessage || 'An unexpected error occurred';
    
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  };
  
  const showSuccess = (message: string, description?: string) => {
    toast({
      title: message,
      description,
    });
  };
  
  return { showError, showSuccess, handleError };
};

export const withErrorHandling = async <T>(
  asyncFn: () => Promise<T>,
  context?: string
): Promise<T> => {
  try {
    return await asyncFn();
  } catch (error) {
    throw handleError(error, context);
  }
};
