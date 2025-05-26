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
import { Badge } from '@/components/ui/badge';

import { 
  User, 
  Edit, 
  Trash2, 
  FileText, 
  Brain, 
  Target,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';
import { studentFormSchema, StudentFormValues } from '@/lib/validations/student';
import { gradeLevelOptions, PerformanceLevel } from '@/types/student';
import { supabase } from '@/integrations/supabase/client';

const StudentProfile = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Get the student ID from params and validate it
  const studentId = params.id;
  
  console.log('StudentProfile: params:', params);
  console.log('StudentProfile: studentId:', studentId);
  
  if (!studentId) {
    console.error('StudentProfile: No student ID found in URL params');
    navigate('/app/students');
    return null;
  }

  // Fetch student data
  const {
    data: student,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => {
      console.log('StudentProfile: Fetching student with ID:', studentId);
      return studentService.getStudentById(studentId);
    },
    enabled: !!studentId,
  });

  // Fetch student assessments with responses
  const {
    data: studentAssessments,
    isLoading: assessmentsLoading,
  } = useQuery({
    queryKey: ['student-assessments', studentId],
    queryFn: async () => {
      console.log('Fetching assessments for student:', studentId);
      
      // Get all student responses first
      const { data: responses, error: responsesError } = await supabase
        .from('student_responses')
        .select(`
          *,
          assessments!inner(
            id,
            title,
            subject,
            assessment_type,
            max_score,
            assessment_date,
            grade_level
          ),
          assessment_items!inner(
            question_text,
            max_score
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (responsesError) {
        console.error('Error fetching student responses:', responsesError);
        throw responsesError;
      }

      // Group responses by assessment
      const assessmentMap = new Map();
      responses?.forEach(response => {
        const assessmentId = response.assessment_id;
        if (!assessmentMap.has(assessmentId)) {
          assessmentMap.set(assessmentId, {
            assessment: response.assessments,
            responses: [],
            totalScore: 0,
            maxScore: 0
          });
        }
        
        const assessmentData = assessmentMap.get(assessmentId);
        assessmentData.responses.push(response);
        assessmentData.totalScore += Number(response.score || 0);
        assessmentData.maxScore += Number(response.assessment_items.max_score || 0);
      });

      return Array.from(assessmentMap.values()).map(data => ({
        ...data.assessment,
        responses: data.responses,
        totalScore: data.totalScore,
        maxScore: data.maxScore,
        percentage: data.maxScore > 0 ? Math.round((data.totalScore / data.maxScore) * 100) : 0
      }));
    },
    enabled: !!studentId,
  });

  // Fetch student AI insights
  const {
    data: studentInsights,
    isLoading: insightsLoading,
  } = useQuery({
    queryKey: ['student-insights', studentId],
    queryFn: async () => {
      console.log('Fetching AI insights for student:', studentId);
      
      const { data: analysisData, error } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          assessments!inner(title, subject, assessment_date)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analysis data:', error);
        throw error;
      }

      console.log('Fetched analysis data:', analysisData?.length || 0, 'records');
      return analysisData || [];
    },
    enabled: !!studentId,
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: () => studentService.deleteStudent(studentId),
    onSuccess: () => {
      toast({
        title: 'Student deleted',
        description: 'The student has been removed successfully.',
      });
      navigate('/app/students');
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
      studentService.updateStudent(studentId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
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
    if (!student?.performance) {
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
        backLink="/app/students"
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
    console.error('StudentProfile: Error loading student:', error);
    return (
      <PageShell
        title="Error"
        description="There was a problem loading the student"
        icon={<AlertCircle className="h-6 w-6 text-red-600" />}
        backLink="/app/students"
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load student data</h3>
            <p className="text-gray-500 mb-4">
              There was an error retrieving the student information. Please try again.
            </p>
            <div className="space-x-2">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              <Button variant="outline" onClick={() => navigate('/app/students')}>Return to Students</Button>
            </div>
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
        backLink="/app/students"
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Student not found</h3>
            <p className="text-gray-500 mb-4">
              The requested student doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/app/students')}>Return to Students</Button>
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
      backLink="/app/students"
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
                    {studentAssessments?.length || 0}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-500">Average Score</div>
                  <div className="text-lg font-medium">
                    {studentAssessments?.length 
                      ? `${Math.round(studentAssessments.reduce((acc, a) => acc + a.percentage, 0) / studentAssessments.length)}%`
                      : 'N/A'}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-500">Performance</div>
                  <div className={`text-lg font-medium flex items-center gap-1 ${
                    getPerformanceProperty<string | null>('performance_level', null) === 'Above Average' ? 'text-green-600' :
                    getPerformanceProperty<string | null>('performance_level', null) === 'Below Average' ? 'text-red-600' :
                    getPerformanceProperty<string | null>('performance_level', null) === 'Average' ? 'text-yellow-600' :
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

          {/* Assessments Tab - Now with real data */}
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Student Assessments</CardTitle>
                <CardDescription>View all assessments taken by this student</CardDescription>
              </CardHeader>
              <CardContent>
                {assessmentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading assessments...</p>
                  </div>
                ) : studentAssessments && studentAssessments.length > 0 ? (
                  <div className="space-y-4">
                    {studentAssessments.map((assessment, index) => (
                      <Card key={assessment.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{assessment.title}</h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                <span>{assessment.subject}</span>
                                <span>•</span>
                                <span>{assessment.assessment_type}</span>
                                {assessment.assessment_date && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(assessment.assessment_date).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {assessment.percentage}%
                              </div>
                              <div className="text-sm text-gray-500">
                                {assessment.totalScore}/{assessment.maxScore} points
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant={
                              assessment.percentage >= 85 ? 'default' :
                              assessment.percentage >= 70 ? 'secondary' : 'destructive'
                            }>
                              {assessment.percentage >= 85 ? 'Excellent' :
                               assessment.percentage >= 70 ? 'Good' : 'Needs Improvement'}
                            </Badge>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => navigate(`/app/assessments/${assessment.id}`)}>
                                <FileText className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              <Button size="sm" onClick={() => navigate(`/app/assessments/${assessment.id}/analysis`)}>
                                <BarChart3 className="h-4 w-4 mr-1" />
                                View Analysis
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No assessments yet</h3>
                    <p className="text-gray-500 mb-4">This student hasn't taken any assessments yet.</p>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/app/assessments')}>
                      View All Assessments
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab - Now with real AI data */}
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
                <CardDescription>AI-generated insights based on assessment data</CardDescription>
              </CardHeader>
              <CardContent>
                {insightsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading insights...</p>
                  </div>
                ) : studentInsights && studentInsights.length > 0 ? (
                  <div className="space-y-6">
                    {/* Latest Overall Summary */}
                    {studentInsights[0]?.overall_summary && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-blue-900 flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Latest Assessment Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-blue-800">{studentInsights[0].overall_summary}</p>
                          <div className="text-sm text-blue-600 mt-2">
                            Based on: {studentInsights[0].assessments?.title} ({studentInsights[0].assessments?.subject})
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Strengths */}
                    {studentInsights.some(insight => insight.strengths?.length > 0) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-green-700 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {Array.from(new Set(
                              studentInsights.flatMap(insight => insight.strengths || [])
                            )).map((strength, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-green-800">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Growth Areas */}
                    {studentInsights.some(insight => insight.growth_areas?.length > 0) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-orange-700 flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Areas for Growth
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {Array.from(new Set(
                              studentInsights.flatMap(insight => insight.growth_areas || [])
                            )).map((area, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <span className="text-orange-800">{area}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recommendations */}
                    {studentInsights.some(insight => insight.recommendations?.length > 0) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-purple-700 flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Array.from(new Set(
                              studentInsights.flatMap(insight => insight.recommendations || [])
                            )).map((recommendation, index) => (
                              <div key={index} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                                <p className="text-purple-800">{recommendation}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Assessment History */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Assessment Analysis History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {studentInsights.map((insight, index) => (
                            <div key={insight.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{insight.assessments?.title}</h4>
                                <span className="text-sm text-gray-500">
                                  {new Date(insight.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                Subject: {insight.assessments?.subject}
                              </div>
                              {insight.patterns_observed?.length > 0 && (
                                <div className="text-sm">
                                  <strong>Patterns:</strong> {insight.patterns_observed.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No insights available</h3>
                    <p className="text-gray-500 mb-4">
                      Insights will be generated after the student completes assessments and AI analysis is performed.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/app/assessments')}>
                      View Assessments
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
};

export default StudentProfile;
