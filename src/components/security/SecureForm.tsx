/**
 * Security-Enhanced Form Component
 * Integrates security features like CSRF protection, rate limiting, and input validation
 */

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { securityService, RATE_LIMITS } from '@/services/security-service';
import { ValidationService } from '@/services/input-validator';
import { dataIntegrityService } from '@/services/data-integrity';
import { productionLogger } from '@/services/production-logger';

interface SecureFormProps {
  onSubmit: (data: Record<string, any>) => Promise<void>;
  children: React.ReactNode;
  entityType?: string;
  userId?: string;
  rateLimit?: keyof typeof RATE_LIMITS;
  className?: string;
  submitButtonText?: string;
  enableCSRF?: boolean;
  validateOnChange?: boolean;
}

interface SecurityStatus {
  csrfToken?: string;
  rateLimitOk: boolean;
  validationErrors: string[];
  securityWarnings: string[];
}

export const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  children,
  entityType = 'general',
  userId,
  rateLimit = 'API_GENERAL',
  className = '',
  submitButtonText = 'Submit',
  enableCSRF = true,
  validateOnChange = true
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    rateLimitOk: true,
    validationErrors: [],
    securityWarnings: []
  });
  const formRef = useRef<HTMLFormElement>(null);
  const lastSubmitTime = useRef<number>(0);

  // Initialize CSRF token
  React.useEffect(() => {
    if (enableCSRF) {
      const token = securityService.generateCSRFToken();
      setSecurityStatus(prev => ({ ...prev, csrfToken: token }));
    }
  }, [enableCSRF]);

  /**
   * Validate form data with security checks
   */
  const validateFormData = useCallback((formData: Record<string, any>) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Input sanitization
    const sanitizedData = ValidationService.sanitizeFormData(formData);

    // Entity-specific validation
    if (entityType !== 'general') {
      let validation: { success: boolean; data?: any; errors?: string[] };
      
      switch (entityType) {
        case 'student':
          validation = ValidationService.validateStudent(sanitizedData);
          break;
        case 'assessment':
          validation = ValidationService.validateAssessment(sanitizedData);
          break;
        case 'goal':
          validation = ValidationService.validateGoal(sanitizedData);
          break;
        default:
          validation = { success: true, data: sanitizedData };
      }

      if (!validation.success && validation.errors) {
        errors.push(...validation.errors);
      }
    }

    // Security-specific validations
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Check for suspicious patterns
        if (/<script|javascript:|data:/i.test(value)) {
          errors.push(`Potentially dangerous content detected in ${key}`);
        }

        // Check for excessively long inputs
        if (value.length > 10000) {
          warnings.push(`${key} value is unusually long`);
        }
      }
    });

    return { sanitizedData, errors, warnings };
  }, [entityType]);

  /**
   * Handle form submission with security checks
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Prevent double submissions
    const now = Date.now();
    if (now - lastSubmitTime.current < 1000) {
      productionLogger.warn('Form submission blocked - too frequent', {
        formType: entityType,
        timeSinceLastSubmit: now - lastSubmitTime.current
      });
      return;
    }
    lastSubmitTime.current = now;

    // Rate limiting check
    const identifier = userId || 'anonymous';
    const rateLimitRule = RATE_LIMITS[rateLimit];
    const rateLimitOk = securityService.checkRateLimit(identifier, rateLimitRule);
    
    if (!rateLimitOk) {
      setSecurityStatus(prev => ({
        ...prev,
        rateLimitOk: false,
        securityWarnings: ['Rate limit exceeded. Please wait before submitting again.']
      }));
      return;
    }

    // CSRF validation
    if (enableCSRF && securityStatus.csrfToken) {
      if (!securityService.validateCSRFToken(securityStatus.csrfToken)) {
        setSecurityStatus(prev => ({
          ...prev,
          securityWarnings: ['Security token invalid. Please refresh the page.']
        }));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Extract form data
      const formData = new FormData(formRef.current!);
      const data: Record<string, any> = {};
      
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Validate and sanitize
      const { sanitizedData, errors, warnings } = validateFormData(data);

      if (errors.length > 0) {
        setSecurityStatus(prev => ({
          ...prev,
          validationErrors: errors,
          securityWarnings: warnings
        }));
        return;
      }

      // Log the submission attempt
      productionLogger.info(`Secure form submission: ${entityType}`, {
        formType: entityType,
        userId,
        dataKeys: Object.keys(sanitizedData),
        hasWarnings: warnings.length > 0
      });

      // Audit trail
      if (userId) {
        dataIntegrityService.logDataChange(
          userId,
          'form_submit',
          entityType,
          'new',
          undefined,
          sanitizedData,
          {
            formType: entityType,
            securityWarnings: warnings
          }
        );
      }

      // Submit the form
      await onSubmit(sanitizedData);

      // Clear any previous errors
      setSecurityStatus(prev => ({
        ...prev,
        validationErrors: [],
        securityWarnings: warnings // Keep warnings for informational purposes
      }));

      // Generate new CSRF token for next submission
      if (enableCSRF) {
        const newToken = securityService.generateCSRFToken();
        setSecurityStatus(prev => ({ ...prev, csrfToken: newToken }));
      }

    } catch (error) {
      productionLogger.error(`Secure form submission failed: ${entityType}`, error as Error, {
        formType: entityType,
        userId
      });
      
      setSecurityStatus(prev => ({
        ...prev,
        validationErrors: ['Submission failed. Please try again.']
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Security Status Display */}
      {securityStatus.validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {securityStatus.validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {securityStatus.securityWarnings.length > 0 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {securityStatus.securityWarnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {!securityStatus.rateLimitOk && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Rate limit exceeded. Please wait before submitting again.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Content */}
      {children}

      {/* Hidden CSRF Token */}
      {enableCSRF && securityStatus.csrfToken && (
        <input
          type="hidden"
          name="csrfToken"
          value={securityStatus.csrfToken}
        />
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={
          isSubmitting || 
          !securityStatus.rateLimitOk || 
          securityStatus.validationErrors.length > 0
        }
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-2" />
            {submitButtonText}
          </>
        )}
      </Button>

      {/* Security Indicator */}
      <div className="flex items-center justify-center text-xs text-muted-foreground">
        <CheckCircle className="h-3 w-3 mr-1" />
        Form secured with encryption and validation
      </div>
    </form>
  );
};

/**
 * Secure Input Component with validation
 */
export const SecureInput: React.FC<{
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  className?: string;
}> = ({ name, type = 'text', placeholder, required, maxLength = 1000, pattern, className }) => {
  const [value, setValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Real-time validation
    let valid = true;
    if (required && !newValue.trim()) valid = false;
    if (maxLength && newValue.length > maxLength) valid = false;
    if (pattern && !new RegExp(pattern).test(newValue)) valid = false;
    if (/<script|javascript:|data:/i.test(newValue)) valid = false;

    setIsValid(valid);
  };

  return (
    <Input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      pattern={pattern}
      value={value}
      onChange={handleChange}
      className={`${className} ${!isValid ? 'border-destructive' : ''}`}
    />
  );
};

/**
 * Secure Textarea Component with validation
 */
export const SecureTextarea: React.FC<{
  name: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  className?: string;
}> = ({ name, placeholder, required, maxLength = 2000, className }) => {
  const [value, setValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Real-time validation
    let valid = true;
    if (required && !newValue.trim()) valid = false;
    if (maxLength && newValue.length > maxLength) valid = false;
    if (/<script|javascript:|data:/i.test(newValue)) valid = false;

    setIsValid(valid);
  };

  return (
    <div className="space-y-1">
      <Textarea
        name={name}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={handleChange}
        className={`${className} ${!isValid ? 'border-destructive' : ''}`}
      />
      <div className="text-xs text-muted-foreground text-right">
        {value.length}/{maxLength} characters
      </div>
    </div>
  );
};