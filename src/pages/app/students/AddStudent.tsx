
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PageShell from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { studentFormSchema, StudentFormValues } from '@/lib/validations/student';
import { studentService } from '@/services/student-service';
import { gradeLevelOptions } from '@/types/student';
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
      
      // Ensure the required fields are present (even though form validation should catch this)
      const studentData = {
        ...values,
        first_name: values.first_name,  // Explicitly include required fields
        last_name: values.last_name,    // Explicitly include required fields
        grade_level: values.grade_level, // Explicitly include required fields
        teacher_id: user.id,
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
    <PageShell
      title="Add Student"
      description="Add a new student to your class"
      icon={<UserPlus className="h-6 w-6 text-blue-600" />}
      backLink="/students"
    >
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="grade_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
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
                      <FormItem>
                        <FormLabel>Student ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter student ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="learning_goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Goals (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter any specific learning goals"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="special_considerations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Considerations (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter any special considerations or needs"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/students')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createStudentMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createStudentMutation.isPending ? 'Adding...' : 'Add Student'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default AddStudent;
