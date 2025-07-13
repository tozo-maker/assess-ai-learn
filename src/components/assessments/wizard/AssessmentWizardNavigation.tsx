/**
 * Assessment Wizard Navigation Component
 * Shows progress through wizard steps with validation status
 */

import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStep {
  id: string;
  label: string;
  required: boolean;
}

interface AssessmentWizardNavigationProps {
  steps: readonly WizardStep[];
  currentStep: string;
  stepValidation: Record<string, boolean>;
  onStepChange: (stepId: string) => void;
}

const AssessmentWizardNavigation: React.FC<AssessmentWizardNavigationProps> = ({
  steps,
  currentStep,
  stepValidation,
  onStepChange
}) => {
  const getStepStatus = (stepId: string, index: number) => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const isCompleted = stepValidation[stepId] && index < currentIndex;
    const isCurrent = stepId === currentStep;
    const isValid = stepValidation[stepId];
    
    if (isCompleted) return 'completed';
    if (isCurrent && isValid) return 'current-valid';
    if (isCurrent && !isValid) return 'current-invalid';
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'current-valid':
        return <Circle className="h-5 w-5 text-blue-600 fill-blue-100" />;
      case 'current-invalid':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const canNavigateToStep = (stepId: string, index: number) => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    // Can navigate to previous steps or if all previous steps are valid
    return index <= currentIndex || steps.slice(0, index).every(step => stepValidation[step.id]);
  };

  return (
    <nav className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const canNavigate = canNavigateToStep(step.id, index);
          
          return (
            <li key={step.id} className="flex items-center">
              <button
                onClick={() => canNavigate && onStepChange(step.id)}
                disabled={!canNavigate}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                  canNavigate ? "hover:bg-gray-50 cursor-pointer" : "cursor-not-allowed",
                  status === 'current-valid' && "bg-blue-50 border border-blue-200",
                  status === 'current-invalid' && "bg-red-50 border border-red-200",
                  status === 'completed' && "bg-green-50"
                )}
              >
                {getStepIcon(status)}
                <div className="text-left">
                  <div className={cn(
                    "text-sm font-medium",
                    status === 'completed' && "text-green-700",
                    status === 'current-valid' && "text-blue-700",
                    status === 'current-invalid' && "text-red-700",
                    status === 'pending' && "text-gray-500"
                  )}>
                    {step.label}
                  </div>
                  {step.required && (
                    <div className="text-xs text-gray-500">Required</div>
                  )}
                </div>
              </button>
              
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-200 mx-2" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default React.memo(AssessmentWizardNavigation);