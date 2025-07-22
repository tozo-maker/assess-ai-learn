
import React, { createContext, useContext, useState } from 'react';
import { enhancedValidationService } from '@/services/enhanced-validation-service';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationContextType {
  errors: ValidationError[];
  validateField: (field: string, value: any, rules: any) => boolean;
  validateForm: (data: any, schema: any) => boolean;
  clearErrors: (field?: string) => void;
  hasErrors: boolean;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export const useValidation = () => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
};

interface ValidationProviderProps {
  children: React.ReactNode;
}

export const ValidationProvider: React.FC<ValidationProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateField = (field: string, value: any, rules: any): boolean => {
    try {
      const error = enhancedValidationService.validateField(field, value, 'student');
      const isValid = !error;
      
      if (isValid) {
        // Remove any existing errors for this field
        setErrors(prev => prev.filter(err => err.field !== field));
        return true;
      } else {
        // Add error for this field
        const errorMessage = `${field} validation failed`;
        setErrors(prev => [
          ...prev.filter(err => err.field !== field),
          { field, message: errorMessage }
        ]);
        return false;
      }
    } catch (error) {
      setErrors(prev => [
        ...prev.filter(err => err.field !== field),
        { field, message: (error as Error).message }
      ]);
      return false;
    }
  };

  const validateForm = (data: any, schema: any): boolean => {
    try {
      const result = enhancedValidationService.validateObject(data, 'student');
      const isValid = result.isValid;
      if (isValid) {
        setErrors([]);
      }
      return isValid;
    } catch (error) {
      setErrors([{ field: 'form', message: (error as Error).message }]);
      return false;
    }
  };

  const clearErrors = (field?: string) => {
    if (field) {
      setErrors(prev => prev.filter(err => err.field !== field));
    } else {
      setErrors([]);
    }
  };

  const hasErrors = errors.length > 0;

  return (
    <ValidationContext.Provider value={{
      errors,
      validateField,
      validateForm,
      clearErrors,
      hasErrors
    }}>
      {children}
    </ValidationContext.Provider>
  );
};
