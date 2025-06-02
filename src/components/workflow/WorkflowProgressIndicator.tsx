
import React from 'react';
import { Check, Circle, AlertCircle } from 'lucide-react';
import {
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  designSystem
} from '@/components/ui/design-system';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  optional?: boolean;
}

interface WorkflowProgressIndicatorProps {
  steps: WorkflowStep[];
  currentStepId?: string;
  orientation?: 'horizontal' | 'vertical';
  showDescriptions?: boolean;
  className?: string;
}

const WorkflowProgressIndicator: React.FC<WorkflowProgressIndicatorProps> = ({
  steps,
  currentStepId,
  orientation = 'horizontal',
  showDescriptions = false,
  className
}) => {
  const getStepIcon = (step: WorkflowStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <Check className="h-4 w-4 text-white" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-white" />;
      case 'current':
        return <span className="text-white font-semibold text-sm">{index + 1}</span>;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepStyles = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return `${designSystem.colors.success.bg} border-green-500`;
      case 'error':
        return `${designSystem.colors.danger.bg} border-red-500`;
      case 'current':
        return `${designSystem.colors.primary.bg} border-blue-500`;
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getConnectorStyles = (step: WorkflowStep, nextStep?: WorkflowStep) => {
    if (step.status === 'completed') {
      return 'bg-green-500';
    }
    if (step.status === 'current' && nextStep) {
      return 'bg-gradient-to-r from-blue-500 to-gray-300';
    }
    return 'bg-gray-300';
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <DSFlexContainer align="start" gap="md">
              {/* Step indicator */}
              <div className="relative flex-shrink-0">
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                  getStepStyles(step),
                  designSystem.transitions.normal
                )}>
                  {getStepIcon(step, index)}
                </div>
                
                {/* Vertical connector */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8",
                    getConnectorStyles(step, steps[index + 1])
                  )} />
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1 pb-8">
                <DSBodyText className={cn(
                  "font-medium",
                  step.status === 'current' ? designSystem.colors.primary.text : 'text-gray-900'
                )}>
                  {step.title}
                  {step.optional && (
                    <span className="text-gray-500 text-sm ml-2">(Optional)</span>
                  )}
                </DSBodyText>
                {showDescriptions && step.description && (
                  <DSHelpText className="mt-1">
                    {step.description}
                  </DSHelpText>
                )}
              </div>
            </DSFlexContainer>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={cn("w-full", className)}>
      <DSFlexContainer align="center" className="relative">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2",
                getStepStyles(step),
                designSystem.transitions.normal
              )}>
                {getStepIcon(step, index)}
              </div>
              <div className="text-center max-w-24">
                <DSBodyText className={cn(
                  "text-sm font-medium",
                  step.status === 'current' ? designSystem.colors.primary.text : 'text-gray-900'
                )}>
                  {step.title}
                </DSBodyText>
                {step.optional && (
                  <DSHelpText className="text-xs">
                    (Optional)
                  </DSHelpText>
                )}
              </div>
            </div>
            
            {/* Horizontal connector */}
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 mb-6",
                getConnectorStyles(step, steps[index + 1])
              )} />
            )}
          </React.Fragment>
        ))}
      </DSFlexContainer>
      
      {/* Step descriptions below in horizontal mode */}
      {showDescriptions && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => (
            step.description && (
              <div key={`desc-${step.id}`} className="text-center">
                <DSHelpText>
                  {step.description}
                </DSHelpText>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowProgressIndicator;
