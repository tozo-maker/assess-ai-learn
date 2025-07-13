/**
 * Placeholder components for remaining wizard steps
 * To be implemented in subsequent phases
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import type { AssessmentFormData, AssessmentItemFormData } from '@/types/comprehensive';

// Assessment Items Step
interface AssessmentItemsStepProps {
  items: AssessmentItemFormData[];
  errors: Record<string, string>;
  onUpdateItem: (index: number, field: keyof AssessmentItemFormData, value: any) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const AssessmentItemsStep: React.FC<AssessmentItemsStepProps> = ({
  items,
  onNext,
  onPrevious
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Assessment Items</h2>
    <p>Items: {items.length}</p>
    <div className="flex justify-between">
      <Button type="button" variant="outline" onClick={onPrevious}>
        Previous
      </Button>
      <Button type="button" onClick={onNext}>
        Next: Scoring
      </Button>
    </div>
  </div>
);

// Assessment Scoring Step
interface AssessmentScoringStepProps {
  data: AssessmentFormData;
  items: AssessmentItemFormData[];
  errors: Record<string, string>;
  onChange: <K extends keyof AssessmentFormData>(field: K, value: AssessmentFormData[K]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const AssessmentScoringStep: React.FC<AssessmentScoringStepProps> = ({
  data,
  onNext,
  onPrevious
}) => (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold">Scoring Setup</h2>
    <p>Total Score: {data.max_score}</p>
    <div className="flex justify-between">
      <Button type="button" variant="outline" onClick={onPrevious}>
        Previous
      </Button>
      <Button type="button" onClick={onNext}>
        Next: Review
      </Button>
    </div>
  </div>
);

//  Review Step
interface AssessmentReviewStepProps {
  data: AssessmentFormData;
  onSubmit: () => Promise<void>;
  onPrevious: () => void;
  onCancel: () => void;
  isValid: boolean;
}

export const AssessmentReviewStep: React.FC<AssessmentReviewStepProps> = ({
  data,
  onSubmit,
  onPrevious,
  onCancel,
  isValid
}) => {
  const handleSubmit = async () => {
    await onSubmit();
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review & Create</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium">{data.title}</h3>
        <p className="text-sm text-gray-600">{data.subject} - Grade {data.grade_level}</p>
        <p className="text-sm text-gray-600">{data.items.length} questions, {data.max_score} points</p>
      </div>
      <div className="flex justify-between">
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <Button type="button" onClick={handleSubmit} disabled={!isValid}>
          Create Assessment
        </Button>
      </div>
    </div>
  );
};