
import React from 'react';
import {
  DSPageContainer,
  DSSection,
  DSSpacer,
  DSPageTitle,
  DSBodyText,
  DSFlexContainer
} from '@/components/ui/design-system';
import { DSButton } from '@/components/ui/design-system';

interface FormStep {
  id: string;
  title: string;
  completed?: boolean;
  current?: boolean;
}

interface FormPageLayoutProps {
  title: string;
  description?: string;
  steps?: FormStep[];
  currentStep?: number;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onCancel?: () => void;
  className?: string;
}

export const FormPageLayout: React.FC<FormPageLayoutProps> = ({
  title,
  description,
  steps,
  currentStep,
  children,
  actions,
  onCancel,
  className = ''
}) => {
  return (
    <DSSection className={className}>
      <DSPageContainer>
        <div className="max-w-2xl mx-auto">
          {/* Form Header */}
          <div className="text-center mb-8">
            <DSPageTitle>{title}</DSPageTitle>
            {description && (
              <DSBodyText className="mt-2 text-gray-600">
                {description}
              </DSBodyText>
            )}
          </div>

          {/* Progress Indicator */}
          {steps && steps.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${step.completed 
                          ? 'bg-[#10b981] text-white' 
                          : step.current 
                            ? 'bg-[#2563eb] text-white'
                            : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <span className={`
                        ml-2 text-sm font-medium
                        ${step.current ? 'text-gray-900' : 'text-gray-500'}
                      `}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        h-px w-12 mx-4
                        ${index < (currentStep || 0) ? 'bg-[#10b981]' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DSSpacer size="xl" />

          {/* Form Content */}
          <div className="space-y-8">
            {children}
          </div>

          <DSSpacer size="xl" />

          {/* Form Actions */}
          <DSFlexContainer justify="between" className="pt-6 border-t border-gray-200">
            {onCancel && (
              <DSButton variant="secondary" onClick={onCancel}>
                Cancel
              </DSButton>
            )}
            <div className="flex-1" />
            {actions && (
              <DSFlexContainer gap="md">
                {actions}
              </DSFlexContainer>
            )}
          </DSFlexContainer>
        </div>
      </DSPageContainer>
    </DSSection>
  );
};

export default FormPageLayout;
