
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DSFormField, DSInput, DSTextarea, DSContentGrid } from '@/components/ui/design-system';
import { gradeLevelOptions } from '@/types/student';
import { assessmentTypeOptions } from '@/types/assessment';

interface BasicInfoFormProps {
  form: UseFormReturn<any>;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ form }) => {
  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <DSFormField label="Assessment Title" required>
            <DSInput 
              placeholder="Enter assessment title" 
              {...field} 
              error={!!form.formState.errors.title}
              helpText={form.formState.errors.title?.message as string}
            />
          </DSFormField>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <DSFormField label="Description">
            <DSTextarea 
              placeholder="Enter description" 
              {...field} 
              helpText="Optional description of the assessment"
            />
          </DSFormField>
        )}
      />
      
      <DSContentGrid cols={2}>
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <DSFormField label="Subject" required>
              <DSInput 
                placeholder="Enter subject (e.g., Math, Reading)" 
                {...field} 
                error={!!form.formState.errors.subject}
                helpText={form.formState.errors.subject?.message as string}
              />
            </DSFormField>
          )}
        />
        
        <FormField
          control={form.control}
          name="grade_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Grade Level <span className="text-[#ef4444]">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {gradeLevelOptions.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </DSContentGrid>
      
      <DSContentGrid cols={2}>
        <FormField
          control={form.control}
          name="assessment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Assessment Type <span className="text-[#ef4444]">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select assessment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assessmentTypeOptions.map((type) => (
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
          name="assessment_date"
          render={({ field }) => (
            <DSFormField label="Assessment Date">
              <DSInput 
                type="date" 
                {...field} 
                helpText="When will this assessment be given"
              />
            </DSFormField>
          )}
        />
      </DSContentGrid>
    </div>
  );
};

export default BasicInfoForm;
