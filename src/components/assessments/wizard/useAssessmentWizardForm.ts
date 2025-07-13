/**
 * Assessment Wizard Form Hook
 * Manages form state, validation, and data manipulation
 */

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { unifiedErrorSystem } from '@/services/unified-error-system';
import type { AssessmentFormData, AssessmentItemFormData } from '@/types/comprehensive';

// Validation schemas
const basicInfoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  subject: z.string().min(1, 'Subject is required'),
  grade_level: z.string().min(1, 'Grade level is required'),
  assessment_type: z.string().min(1, 'Assessment type is required'),
  standards_covered: z.array(z.string()).optional(),
  assessment_date: z.string().optional(),
  is_draft: z.boolean().optional(),
});

const itemSchema = z.object({
  question_text: z.string().min(1, 'Question text is required'),
  knowledge_type: z.string().min(1, 'Knowledge type is required'),
  difficulty_level: z.string().min(1, 'Difficulty level is required'),
  max_score: z.number().min(0.1, 'Score must be greater than 0').max(100, 'Score cannot exceed 100'),
  standard_reference: z.string().optional(),
});

const itemsSchema = z.object({
  items: z.array(itemSchema).min(1, 'At least one question is required'),
});

const scoringSchema = z.object({
  max_score: z.number().min(1, 'Total score must be at least 1'),
});

type ValidationErrors = Record<string, string>;
type WizardStep = 'basic-info' | 'items' | 'scoring' | 'review';

export function useAssessmentWizardForm(initialData?: Partial<AssessmentFormData>) {
  const [formData, setFormData] = useState<AssessmentFormData>(() => ({
    title: '',
    description: '',
    subject: '',
    grade_level: '',
    assessment_type: 'quiz',
    teacher_id: 'current-user-id', // Would be populated with actual user ID
    standards_covered: [],
    assessment_date: new Date().toISOString().split('T')[0],
    is_draft: false,
    max_score: 100,
    items: [
      {
        question_text: '',
        knowledge_type: 'conceptual',
        difficulty_level: 'medium',
        max_score: 10,
        standard_reference: '',
      },
    ],
    ...initialData,
  }));

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // Calculate total score from items
  const calculatedMaxScore = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + (item.max_score || 0), 0);
  }, [formData.items]);

  // Update max_score when items change
  useMemo(() => {
    if (calculatedMaxScore !== formData.max_score) {
      setFormData(prev => ({ ...prev, max_score: calculatedMaxScore }));
    }
  }, [calculatedMaxScore, formData.max_score]);

  // Validation functions
  const validateStep = useCallback((step: WizardStep): boolean => {
    try {
      switch (step) {
        case 'basic-info':
          basicInfoSchema.parse(formData);
          return true;
        case 'items':
          itemsSchema.parse({ items: formData.items });
          return true;
        case 'scoring':
          scoringSchema.parse({ max_score: formData.max_score });
          return true;
        case 'review':
          return true;
        default:
          return false;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const stepErrors: ValidationErrors = {};
        error.errors.forEach(err => {
          const field = err.path.join('.');
          stepErrors[field] = err.message;
        });
        setErrors(prev => ({ ...prev, ...stepErrors }));
      }
      return false;
    }
  }, [formData]);

  const isValid = useMemo(() => {
    return validateStep('basic-info') && 
           validateStep('items') && 
           validateStep('scoring');
  }, [validateStep]);

  // Field update handlers
  const updateField = useCallback(<K extends keyof AssessmentFormData>(
    field: K,
    value: AssessmentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear field error when updated
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }

    unifiedErrorSystem.debug('Assessment form field updated', {
      component: 'AssessmentWizardForm',
      field: String(field),
      hasValue: !!value
    });
  }, [errors]);

  const updateItem = useCallback((
    index: number,
    field: keyof AssessmentItemFormData,
    value: AssessmentItemFormData[keyof AssessmentItemFormData]
  ) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
    setIsDirty(true);

    // Clear item error when updated
    const errorKey = `items.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const { [errorKey]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [errors]);

  const addItem = useCallback(() => {
    const newItem: AssessmentItemFormData = {
      question_text: '',
      knowledge_type: 'conceptual',
      difficulty_level: 'medium',
      max_score: 10,
      standard_reference: '',
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setIsDirty(true);

    unifiedErrorSystem.debug('Assessment item added', {
      component: 'AssessmentWizardForm',
      totalItems: formData.items.length + 1
    });
  }, [formData.items.length]);

  const removeItem = useCallback((index: number) => {
    if (formData.items.length <= 1) {
      unifiedErrorSystem.warn('Cannot remove last assessment item', {
        component: 'AssessmentWizardForm',
        attemptedIndex: index
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    setIsDirty(true);

    // Clear errors for removed item
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`items.${index}.`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });

    unifiedErrorSystem.debug('Assessment item removed', {
      component: 'AssessmentWizardForm',
      removedIndex: index,
      remainingItems: formData.items.length - 1
    });
  }, [formData.items.length]);

  const reset = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      grade_level: '',
      assessment_type: 'quiz',
      teacher_id: 'current-user-id',
      standards_covered: [],
      assessment_date: new Date().toISOString().split('T')[0],
      is_draft: false,
      max_score: 100,
      items: [
        {
          question_text: '',
          knowledge_type: 'conceptual',
          difficulty_level: 'medium',
          max_score: 10,
          standard_reference: '',
        },
      ],
    });
    setErrors({});
    setIsDirty(false);
  }, []);

  return {
    formData,
    errors,
    isValid,
    isDirty,
    calculatedMaxScore,
    updateField,
    updateItem,
    addItem,
    removeItem,
    validateStep,
    reset
  };
}