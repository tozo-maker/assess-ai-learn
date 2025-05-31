
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-heading-md">{title}</h3>
        {description && (
          <p className="text-help mt-1">{description}</p>
        )}
      </div>
      <div className="content-spacing-sm">
        {children}
      </div>
    </div>
  );
};

interface StandardFormLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const StandardFormLayout: React.FC<StandardFormLayoutProps> = ({
  title,
  description,
  children,
  actions,
  onSubmit,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-heading-lg">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="content-spacing">
            {children}
          </div>
          
          {actions && (
            <>
              <Separator />
              <div className="flex justify-end gap-3">
                {actions}
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

interface MultiStepFormLayoutProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  children: React.ReactNode;
  actions: React.ReactNode;
  className?: string;
}

export const MultiStepFormLayout: React.FC<MultiStepFormLayoutProps> = ({
  title,
  currentStep,
  totalSteps,
  stepTitles,
  children,
  actions,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-heading-lg">{title}</CardTitle>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-6">
          {stepTitles.map((stepTitle, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                ${index + 1 <= currentStep 
                  ? 'bg-semantic-primary border-semantic-primary text-white'
                  : 'border-gray-300 text-gray-500'
                }
              `}>
                {index + 1}
              </div>
              <span className={`ml-2 text-body-md ${
                index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {stepTitle}
              </span>
              {index < totalSteps - 1 && (
                <div className={`
                  w-16 h-0.5 mx-4
                  ${index + 1 < currentStep ? 'bg-semantic-primary' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="content-spacing mb-6">
          {children}
        </div>
        
        <Separator />
        
        <div className="flex justify-between pt-6">
          {actions}
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardFormLayout;
