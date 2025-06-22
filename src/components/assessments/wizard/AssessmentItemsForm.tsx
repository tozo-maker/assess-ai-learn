
import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DSCard, DSCardContent, DSButton, DSFlexContainer, DSFormField, DSTextarea, DSInput, DSContentGrid } from '@/components/ui/design-system';
import { knowledgeTypeOptions, difficultyLevelOptions } from '@/types/assessment';

interface AssessmentItemsFormProps {
  form: UseFormReturn<any>;
}

const AssessmentItemsForm: React.FC<AssessmentItemsFormProps> = ({ form }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  return (
    <div className="space-y-8">
      {fields.map((field, index) => (
        <DSCard key={field.id}>
          <DSCardContent>
            <DSFlexContainer justify="between" align="center" className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Item #{index + 1}</h3>
              {fields.length > 1 && (
                <DSButton 
                  type="button" 
                  variant="danger" 
                  size="sm" 
                  onClick={() => remove(index)}
                >
                  Remove
                </DSButton>
              )}
            </DSFlexContainer>
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name={`items.${index}.question_text`}
                render={({ field }) => (
                  <DSFormField label="Question/Task" required>
                    <DSTextarea 
                      placeholder="Enter question or task description" 
                      {...field} 
                      error={!!form.formState.errors.items?.[index]?.question_text}
                      helpText={form.formState.errors.items?.[index]?.question_text?.message}
                    />
                  </DSFormField>
                )}
              />
              
              <DSContentGrid cols={3}>
                <FormField
                  control={form.control}
                  name={`items.${index}.knowledge_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Knowledge Type <span className="text-[#ef4444]">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {knowledgeTypeOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`items.${index}.difficulty_level`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Difficulty <span className="text-[#ef4444]">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyLevelOptions.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`items.${index}.max_score`}
                  render={({ field }) => (
                    <DSFormField label="Points Worth" required>
                      <DSInput 
                        type="number" 
                        min="0" 
                        step="0.5" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        error={!!form.formState.errors.items?.[index]?.max_score}
                        helpText={form.formState.errors.items?.[index]?.max_score?.message}
                      />
                    </DSFormField>
                  )}
                />
              </DSContentGrid>
              
              <FormField
                control={form.control}
                name={`items.${index}.standard_reference`}
                render={({ field }) => (
                  <DSFormField label="Standard Reference">
                    <DSInput 
                      placeholder="e.g., CCSS.MATH.CONTENT.3.OA.A.1" 
                      {...field} 
                      helpText="Optional curriculum standard reference"
                    />
                  </DSFormField>
                )}
              />
            </div>
          </DSCardContent>
        </DSCard>
      ))}
      
      <DSButton
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => append({
          question_text: '',
          knowledge_type: 'conceptual',
          difficulty_level: 'medium',
          max_score: 10,
          standard_reference: '',
        })}
      >
        + Add Another Item
      </DSButton>
    </div>
  );
};

export default AssessmentItemsForm;
