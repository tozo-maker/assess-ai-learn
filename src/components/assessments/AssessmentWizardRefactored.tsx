/**
 * Refactored Assessment Wizard - Main Component
 * Broken down into smaller, focused components with proper TypeScript
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedFormHandlers, usePerformanceMonitor } from '@/hooks/useOptimizedComponents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DSCard, DSCardContent } from '@/components/ui/design-system';
import UnifiedErrorBoundary from '@/components/common/UnifiedErrorBoundary';

// Sub-components
import AssessmentWizardNavigation from './wizard/AssessmentWizardNavigation';
import AssessmentBasicInfoStep from './wizard/AssessmentBasicInfoStep';
import { AssessmentItemsStep, AssessmentScoringStep, AssessmentReviewStep } from './wizard/AssessmentSteps';
import AssessmentSubmissionWorkflow from './AssessmentSubmissionWorkflow';

// Hooks and services
import { useAssessmentWizardForm } from './wizard/useAssessmentWizardForm';
import { assessmentService } from '@/services/assessment-service';
import type { AssessmentFormData, Student } from '@/types/comprehensive';

export interface AssessmentWizardProps {
  initialData?: Partial<AssessmentFormData>;
  onComplete?: (assessmentId: string) => void;
  onCancel?: () => void;
}

const WIZARD_STEPS = [
  { id: 'basic-info', label: 'Basic Info', required: true },
  { id: 'items', label: 'Questions', required: true },
  { id: 'scoring', label: 'Scoring', required: true },
  { id: 'review', label: 'Review', required: false }
] as const;

type WizardStepId = typeof WIZARD_STEPS[number]['id'];

const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  initialData,
  onComplete,
  onCancel
}) => {
  usePerformanceMonitor('AssessmentWizard');
  
  const [currentStep, setCurrentStep] = useState<WizardStepId>('basic-info');
  const [showSubmissionWorkflow, setShowSubmissionWorkflow] = useState(false);
  const [createdAssessmentId, setCreatedAssessmentId] = useState<string | null>(null);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form management with validation
  const {
    formData,
    errors,
    isValid,
    isDirty,
    updateField,
    updateItem,
    addItem,
    removeItem,
    validateStep,
    reset
  } = useAssessmentWizardForm(initialData);

  // Memoized step validation
  const stepValidation = useMemo(() => ({
    'basic-info': validateStep('basic-info'),
    'items': validateStep('items'),
    'scoring': validateStep('scoring'),
    'review': true
  }), [validateStep]);

  // Navigation handlers
  const handleStepChange = useCallback((stepId: WizardStepId) => {
    const currentStepIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    const targetStepIndex = WIZARD_STEPS.findIndex(step => step.id === stepId);
    
    // Allow navigation to previous steps or if current step is valid
    if (targetStepIndex <= currentStepIndex || stepValidation[currentStep]) {
      setCurrentStep(stepId);
    } else {
      toast({
        title: "Please complete current step",
        description: "Complete the current step before proceeding.",
        variant: "destructive"
      });
    }
  }, [currentStep, stepValidation, toast]);

  const handleNext = useCallback(() => {
    const currentIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      const nextStep = WIZARD_STEPS[currentIndex + 1];
      handleStepChange(nextStep.id);
    }
  }, [currentStep, handleStepChange]);

  const handlePrevious = useCallback(() => {
    const currentIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = WIZARD_STEPS[currentIndex - 1];
      setCurrentStep(prevStep.id);
    }
  }, [currentStep]);

  // Form submission
  const handleSubmit = useCallback(async () => {
    try {
      const assessment = await assessmentService.createAssessment(formData as any); // Type assertion for now
      setCreatedAssessmentId(assessment.id);
      setShowSubmissionWorkflow(true);
      
      toast({
        title: "Assessment created successfully!",
        description: "You can now add student responses.",
      });
      
      onComplete?.(assessment.id);
    } catch (error) {
      throw error; // Let error boundary handle this
    }
  }, [formData, toast, onComplete]);

  const { submitHandler } = useOptimizedFormHandlers(handleSubmit);

  // Cancel handler
  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('Are you sure you want to cancel? All changes will be lost.');
      if (!confirmed) return;
    }
    
    reset();
    onCancel?.();
  }, [isDirty, reset, onCancel, navigate]);

  // Show submission workflow after assessment creation
  if (showSubmissionWorkflow && createdAssessmentId) {
    return (
      <AssessmentSubmissionWorkflow
        assessmentId={createdAssessmentId}
        assessmentTitle={formData.title}
        students={availableStudents}
        onComplete={() => navigate('/app/assessments')}
      />
    );
  }

  return (
    <UnifiedErrorBoundary
      componentName="AssessmentWizard"
      severity="MEDIUM"
      allowRetry={true}
      allowReset={true}
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Assessment</h1>
            <p className="text-gray-600">Step-by-step assessment creation wizard</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Progress Navigation */}
        <AssessmentWizardNavigation
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          stepValidation={stepValidation}
          onStepChange={handleStepChange}
        />

        {/* Wizard Content */}
        <DSCard>
          <DSCardContent className="p-6">
            <Tabs value={currentStep} onValueChange={handleStepChange}>
              <TabsList className="hidden" /> {/* Navigation handled above */}
              
              <TabsContent value="basic-info">
                <AssessmentBasicInfoStep
                  data={formData}
                  errors={errors}
                  onChange={updateField}
                  onNext={handleNext}
                />
              </TabsContent>

              <TabsContent value="items">
                <AssessmentItemsStep
                  items={formData.items}
                  errors={errors}
                  onUpdateItem={updateItem}
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              </TabsContent>

              <TabsContent value="scoring">
                <AssessmentScoringStep
                  data={formData}
                  items={formData.items}
                  errors={errors}
                  onChange={updateField}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              </TabsContent>

              <TabsContent value="review">
                <AssessmentReviewStep
                  data={formData}
                  onSubmit={async () => await submitHandler({})}
                  onPrevious={handlePrevious}
                  onCancel={handleCancel}
                  isValid={isValid}
                />
              </TabsContent>
            </Tabs>
          </DSCardContent>
        </DSCard>
      </div>
    </UnifiedErrorBoundary>
  );
};

export default React.memo(AssessmentWizard);