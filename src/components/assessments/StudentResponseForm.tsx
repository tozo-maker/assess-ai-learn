
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { errorTypeOptions, ErrorType } from '@/types/assessment';
import { useToast } from '@/hooks/use-toast';
import { assessmentService } from '@/services/assessment-service';
import { studentService } from '@/services/student-service';
import { Student } from '@/types/student';
import { Separator } from '@/components/ui/separator';

// Schema for a single assessment response
const responseItemSchema = z.object({
  assessment_item_id: z.string(),
  score: z.number().min(0, "Score cannot be negative"),
  error_type: z.enum(['conceptual', 'procedural', 'factual', 'none']).optional(),
  teacher_notes: z.string().optional(),
});

// Schema for the entire form
const responseFormSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  responses: z.array(responseItemSchema),
  triggerAnalysis: z.boolean().default(true),
});

type ResponseFormValues = z.infer<typeof responseFormSchema>;

interface StudentResponseFormProps {
  assessmentId: string;
}

const StudentResponseForm: React.FC<StudentResponseFormProps> = ({ assessmentId }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fetch assessment details
  const { data: assessment, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => assessmentService.getAssessmentById(assessmentId),
  });

  // Fetch assessment items
  const { data: assessmentItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['assessmentItems', assessmentId],
    queryFn: () => assessmentService.getAssessmentItems(assessmentId),
    enabled: !!assessmentId,
  });

  // Fetch students for the teacher
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  // Setup form with default values
  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      student_id: '',
      responses: [],
      triggerAnalysis: true,
    },
  });

  // Update form when assessment items load
  useEffect(() => {
    if (assessmentItems) {
      form.setValue('responses', assessmentItems.map(item => ({
        assessment_item_id: item.id,
        score: 0,
        error_type: 'none' as ErrorType,
        teacher_notes: '',
      })));
    }
  }, [assessmentItems, form]);

  // Update selected student when form value changes
  useEffect(() => {
    const studentId = form.watch('student_id');
    if (studentId && students) {
      const student = students.find(s => s.id === studentId);
      setSelectedStudent(student || null);
    } else {
      setSelectedStudent(null);
    }
  }, [form.watch('student_id'), students]);

  // Form submission handler
  const onSubmit = async (data: ResponseFormValues) => {
    try {
      if (!assessment) {
        throw new Error("Assessment data not available");
      }

      // Format responses for the API
      const formattedResponses = data.responses.map(response => ({
        student_id: data.student_id,
        assessment_id: assessmentId,
        assessment_item_id: response.assessment_item_id,
        score: Number(response.score),
        error_type: response.error_type,
        teacher_notes: response.teacher_notes,
      }));

      // Submit responses
      await assessmentService.submitStudentResponses(formattedResponses);

      toast({
        title: "Responses submitted",
        description: "Student responses have been recorded successfully",
      });

      // Trigger AI analysis if selected
      if (data.triggerAnalysis) {
        try {
          await assessmentService.triggerAnalysis(assessmentId, data.student_id);
          toast({
            title: "Analysis initiated",
            description: "AI analysis has been queued and will be available shortly",
          });
        } catch (analysisError) {
          console.error("Error triggering analysis:", analysisError);
          toast({
            title: "Analysis error",
            description: "Failed to trigger analysis, but responses were saved",
            variant: "destructive",
          });
        }
      }

      // Navigate to analysis page
      navigate(`/app/assessments/${assessmentId}/analysis?student=${data.student_id}`);
    } catch (error) {
      console.error("Error submitting responses:", error);
      toast({
        title: "Error",
        description: "Failed to submit responses. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingAssessment || isLoadingItems || isLoadingStudents) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!assessment || !assessmentItems) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">Assessment not found</h2>
        <p className="mt-2">The requested assessment could not be loaded.</p>
        <Button onClick={() => navigate('/app/assessments')} className="mt-4">Back to Assessments</Button>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Record Student Responses</CardTitle>
        <div className="text-sm text-gray-500">
          Assessment: {assessment.title} | Grade: {assessment.grade_level} | Subject: {assessment.subject}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students?.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedStudent && (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    {selectedStudent.first_name.charAt(0)}{selectedStudent.last_name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{selectedStudent.first_name} {selectedStudent.last_name}</div>
                    <div className="text-sm text-gray-500">Grade: {selectedStudent.grade_level}</div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-6">
              <h3 className="font-semibold">Assessment Items ({assessmentItems.length})</h3>
              
              {assessmentItems.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="mb-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium">Item #{item.item_number}</h4>
                      <span className="text-sm text-gray-500">
                        Max score: {item.max_score} | Type: {item.knowledge_type} | Difficulty: {item.difficulty_level}
                      </span>
                    </div>
                    <p className="mt-1">{item.question_text}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`responses.${index}.score`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Score</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max={item.max_score} 
                              step="0.5"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                            />
                          </FormControl>
                          <div className="text-xs text-gray-500">
                            Out of {item.max_score} possible points
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`responses.${index}.error_type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Error Type (if any)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || 'none'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select error type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {errorTypeOptions.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type === 'none' ? 'No Error' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`responses.${index}.teacher_notes`}
                    render={({ field }) => (
                      <FormItem className="mt-3">
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any observations about the student's response" 
                            className="h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}
            </div>

            <FormField
              control={form.control}
              name="triggerAnalysis"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Generate AI Analysis</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Automatically analyze performance patterns and generate insights
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/app/assessments')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!form.watch('student_id')}
              >
                Submit Responses
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StudentResponseForm;
