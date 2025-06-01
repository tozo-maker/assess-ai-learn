import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

// Design System Components
import {
  DSPageContainer,
  DSSection,
  DSPageTitle,
  DSBodyText,
  DSFlexContainer,
  DSButton,
  DSCard,
  DSCardContent,
  DSSectionHeader,
  DSSpacer,
  DSContentGrid,
  DSFormField,
  DSInput,
  DSTextarea
} from '@/components/ui/design-system';

// Original Components
import {
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';
import { studentFormSchema, StudentFormValues } from '@/lib/validations/student';
import { studentService } from '@/services/student-service';
import { gradeLevelOptions, Student } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';

const AddStudent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set up form with validation
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      student_id: '',
      grade_level: '5th',
      learning_goals: '',
      special_considerations: '',
    },
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (values: StudentFormValues) => {
      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to add a student');
      }
      
      // Create a properly typed student object
      const studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'> = {
        first_name: values.first_name,
        last_name: values.last_name,
        grade_level: values.grade_level,
        teacher_id: user.id,
        student_id: values.student_id || undefined,
        learning_goals: values.learning_goals || undefined,
        special_considerations: values.special_considerations || undefined,
      };
      
      return studentService.createStudent(studentData);
    },
    onSuccess: () => {
      toast({
        title: "Student added",
        description: "The student has been successfully added.",
      });
      navigate('/students');
    },
    onError: (error) => {
      console.error('Error adding student:', error);
      toast({
        title: "Failed to add student",
        description: "There was an error adding the student. Please try again.",
        variant: "destructive"
      });
    },
  });

  const onSubmit = (values: StudentFormValues) => {
    createStudentMutation.mutate(values);
  };

  return (
    <DSSection>
      <DSPageContainer>
        {/* Page Header */}
        <DSFlexContainer justify="between" align="center" className="mb-8">
          <div>
            <DSPageTitle className="mb-2">Add Student</DSPageTitle>
            <DSBodyText className="text-gray-600">
              Add a new student to your class
            </DSBodyText>
          </div>
          <DSButton 
            variant="secondary" 
            onClick={() => navigate('/app/students')}
          >
            Back to Students
          </DSButton>
        </DSFlexContainer>

        <DSCard>
          <DSCardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <div>
                  <DSSectionHeader className="mb-6">Basic Information</DSSectionHeader>
                  <DSContentGrid cols={2}>
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <DSFormField label="First Name" required>
                          <DSInput 
                            placeholder="Enter first name" 
                            {...field} 
                            error={!!form.formState.errors.first_name}
                            helpText={form.formState.errors.first_name?.message}
                          />
                        </DSFormField>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <DSFormField label="Last Name" required>
                          <DSInput 
                            placeholder="Enter last name" 
                            {...field} 
                            error={!!form.formState.errors.last_name}
                            helpText={form.formState.errors.last_name?.message}
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
                            Grade Level <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select grade level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {gradeLevelOptions.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {grade}
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
                      name="student_id"
                      render={({ field }) => (
                        <DSFormField label="Student ID">
                          <DSInput 
                            placeholder="Enter student ID" 
                            {...field} 
                            helpText="Optional unique identifier"
                          />
                        </DSFormField>
                      )}
                    />
                  </DSContentGrid>
                </div>

                <DSSpacer size="lg" />

                {/* Learning Information Section */}
                <div>
                  <DSSectionHeader className="mb-6">Learning Information</DSSectionHeader>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="learning_goals"
                      render={({ field }) => (
                        <DSFormField label="Learning Goals">
                          <DSTextarea 
                            placeholder="Enter any specific learning goals or objectives"
                            className="min-h-32"
                            {...field}
                            helpText="Describe what the student should focus on learning"
                          />
                        </DSFormField>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="special_considerations"
                      render={({ field }) => (
                        <DSFormField label="Special Considerations">
                          <DSTextarea 
                            placeholder="Enter any special considerations, accommodations, or notes"
                            className="min-h-32"
                            {...field}
                            helpText="Include any learning differences, accommodations, or important notes"
                          />
                        </DSFormField>
                      )}
                    />
                  </div>
                </div>

                <DSSpacer size="xl" />

                {/* Form Actions */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <DSFlexContainer gap="sm">
                    <DSButton
                      type="button"
                      variant="secondary"
                      onClick={() => navigate('/app/students')}
                    >
                      Cancel
                    </DSButton>
                    <DSButton 
                      type="submit"
                      disabled={createStudentMutation.isPending}
                      variant="primary"
                    >
                      {createStudentMutation.isPending ? 'Adding...' : 'Add Student'}
                    </DSButton>
                  </DSFlexContainer>
                </div>
              </form>
            </Form>
          </DSCardContent>
        </DSCard>
      </DSPageContainer>
    </DSSection>
  );
};

export default AddStudent;
