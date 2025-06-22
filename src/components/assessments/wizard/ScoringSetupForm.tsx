
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { DSCard, DSCardContent, DSCardHeader, DSCardTitle, DSFormField, DSInput, DSFlexContainer } from '@/components/ui/design-system';

interface ScoringSetupFormProps {
  form: UseFormReturn<any>;
}

const ScoringSetupForm: React.FC<ScoringSetupFormProps> = ({ form }) => {
  const items = form.watch('items');

  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="max_score"
        render={({ field }) => (
          <DSFormField label="Maximum Assessment Score" required>
            <DSInput 
              type="number" 
              min="1" 
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value))}
              error={!!form.formState.errors.max_score}
              helpText={form.formState.errors.max_score?.message as string || "Total points possible for this assessment"}
            />
          </DSFormField>
        )}
      />
      
      <DSCard className="bg-gray-50">
        <DSCardHeader>
          <DSCardTitle>Item Point Summary</DSCardTitle>
        </DSCardHeader>
        <DSCardContent>
          <div className="space-y-2">
            {items.map((item: any, index: number) => (
              <DSFlexContainer key={index} justify="between">
                <span className="text-sm text-gray-600">Item #{index + 1}:</span>
                <span className="text-sm font-medium">{item.max_score} points</span>
              </DSFlexContainer>
            ))}
          </div>
          <Separator className="my-4" />
          <DSFlexContainer justify="between">
            <span className="font-medium">Total Item Points:</span>
            <span className="font-bold text-lg">
              {items.reduce((sum: number, item: any) => sum + Number(item.max_score), 0)}
            </span>
          </DSFlexContainer>
        </DSCardContent>
      </DSCard>
    </div>
  );
};

export default ScoringSetupForm;
