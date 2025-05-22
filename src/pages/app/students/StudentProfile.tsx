import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import PageShell from '@/components/ui/page-shell';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { 
  User, 
  Edit, 
  Trash2, 
  FileText, 
  Brain, 
  Target,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { studentService } from '@/services/student-service';
import { studentFormSchema, StudentFormValues } from '@/lib/validations/student';
import { gradeLevelOptions } from '@/types/student';

const StudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  if (!id) {
    navigate('/students');
    return null;
  }

  // Fetch student data
  const {
    data: student,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id),
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: () => studentService.deleteStudent(id),
    onSuccess: () => {
      toast({
        title: 'Student deleted',
        description: 'The student has been removed successfully.',
      });
      navigate('/students');
    },
    onError: (error) => {
      console.error('Error deleting student:', error);
      toast({
        title: 'Failed to delete student',
        description: 'There was a problem deleting this student.',
        variant: 'destructive',
      });
    },
  });

  // Update student form setup
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      first_name: student?.first_name || '',
      last_name: student?.last_name || '',
      student_id: student?.student_id || '',
      grade_level: (student?.grade_level as any) || '5th',
      learning_goals: student?.learning_goals || '',
      special_considerations: student?.special_considerations || '',
    },
  });

  // Ensure form values are updated when student data is loaded
  React.useEffect(() => {
    if (student) {
      form.reset({
        first_name: student.first_name,
        last_name: student.last_name,
        student_id: student.student_id || '',
        grade_level: (student.grade_level as any),
        learning_goals: student.learning_goals || '',
        special_considerations: student.special_considerations || '',
      });
    }
  }, [student, form]);

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: (values: StudentFormValues) =>
      studentService.updateStudent(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      toast({
        title: 'Student updated',
        description: 'The student information has been updated.',
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating student:', error);
      toast({
        title: 'Failed to update student',
        description: 'There was a problem updating the student information.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: StudentFormValues) => {
    updateStudentMutation.mutate(values);
  };

  // Helper function to safely access performance properties
  const getPerformanceProperty = <T extends any>(
    property: string, 
    defaultValue: T
  ): T => {
    if (!student.performance) {
      return defaultValue;
    }
    
    // If performance is an array, we don't have proper data yet
    if (Array.isArray(student.performance)) {
      return defaultValue;
    }
    
    // Now TypeScript knows student.performance is an object
    return (student.performance as any)[property] ?? defaultValue;
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <PageShell
        title="Student Profile"
        description="Loading student information"
        icon={<User className="h-6 w-6 text-blue-600" />}
        backLink="/students"
      >
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell
        title="Error"
        description="There was a problem loading the student"
        icon={<AlertCircle className="h-6 w-6 text-red-600" />}
        backLink="/students"
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load student data</h3>
            <p className="text-gray-500 mb-4">
              There was an error retrieving the student information. Please try again.
            </p>
            <Button onClick={() => navigate('/students')}>Return to Students</Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (!student) {
    return (
      <PageShell
        title="Student Not Found"
        description="This student doesn't exist or you don't have access"
        icon={<User className="h-6 w-6 text-gray-600" />}
        backLink="/students"
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Student not found</h3>
            <p className="text-gray-500 mb-4">
              The requested student doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/students')}>Return to Students</Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const fullName = `${student.first_name} ${student.last_name}`;
  const initials = student.first_name[0] + student.last_name[0];
  
  const actions = (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Edit Student</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name*</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="learning_goals"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Learning Goals (Optional)</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="special_considerations"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Special Considerations (Optional)</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateStudentMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateStudentMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Delete Student</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {fullName}'s records, including all
              assessments and performance data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStudentMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteStudentMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  return (
    <PageShell
      title={fullName}
      description={`${student.grade_level} Grade Student Profile`}
      icon={<User className="h-6 w-6 text-blue-600" />}
      backLink="/students"
      actions={actions}
    >
      <div className="space-y-6">
        {/* Student Information Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Student Basic Info */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-blue-600">
                    {initials}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-y-1 gap-x-3">
                    <span>{student.grade_level} Grade</span>
                    {student.student_id && (
                      <>
                        <span className="hidden sm:block">•</span>
                        <span>ID: {student.student_id}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Key Metrics */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-500">Assessments</div>
                  <div className="text-lg font-medium">
                    {getPerformanceProperty('assessment_count', 0)}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-500">Average Score</div>
                  <div className="text-lg font-medium">
                    {getPerformanceProperty('average_score', null)
                      ? `${getPerformanceProperty('average_score', 0)}%`
                      : 'N/A'}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-500">Performance</div>
                  <div className={`text-lg font-medium flex items-center gap-1 ${
                    getPerformanceProperty('performance_level', '') === 'Above Average' ? 'text-green-600' :
                    getPerformanceProperty('performance_level', '') === 'Below Average' ? 'text-red-600' :
                    getPerformanceProperty('performance_level', '') === 'Average' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {getPerformanceProperty('performance_level', 'Not assessed')}
                    {getPerformanceProperty('needs_attention', false) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Student Details, Assessments, and Insights */}
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Assessments</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Student Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.learning_goals ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{student.learning_goals}</p>
                  ) : (
                    <p className="text-gray-500 italic">No learning goals specified.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Special Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.special_considerations ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{student.special_considerations}</p>
                  ) : (
                    <p className="text-gray-500 italic">No special considerations specified.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    Required Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-gray-400 text-sm font-medium">No required actions</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Added to System</p>
                    <p>{new Date(student.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p>{new Date(student.updated_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assessments Tab (Placeholder) */}
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Student Assessments</CardTitle>
                <CardDescription>View all assessments taken by this student</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No assessments yet</h3>
                <p className="text-gray-500 mb-4">This student hasn't taken any assessments yet.</p>
                <Button className="bg-blue-600 hover:bg-blue-700">Add Assessment</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab (Placeholder) */}
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
                <CardDescription>AI-generated insights based on assessment data</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Brain className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No insights available</h3>
                <p className="text-gray-500 mb-4">
                  Insights will be generated after the student completes assessments.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
};

export default StudentProfile;
