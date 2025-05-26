
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, 
  BookOpenCheck, 
  ListChecks, 
  User, 
  Edit, 
  Trash2,
  ArrowLeftCircle,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

import { PageShell } from '@/components/ui/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';
import { goalsService } from '@/services/goals-service';
import { useToast } from '@/hooks/use-toast';
import { normalizeStudentPerformance } from '@/types/student';
import InsightsTabContent from '@/components/communications/InsightsTabContent';

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  student_id: z.string().min(3, {
    message: "Student ID must be at least 3 characters.",
  }),
  grade_level: z.string().min(1, {
    message: "Please select a grade level.",
  }),
  parent_name: z.string().optional(),
  parent_email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  parent_phone: z.string().optional(),
})

const StudentProfile = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const studentId = params.id;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      student_id: "",
      grade_level: "",
      parent_name: "",
      parent_email: "",
      parent_phone: "",
    },
  })

  const [performanceData, setPerformanceData] = useState({
    averageScore: 0,
    assessmentsCompleted: 0,
    needsAttention: false,
  });

  // Fetch student data
  const {
    data: rawStudent,
    isLoading: studentLoading,
    error: studentError,
    refetch: refetchStudent,
  } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => {
      console.log('StudentProfile: Fetching student with ID:', studentId);
      return studentService.getStudentById(studentId);
    },
    enabled: !!studentId,
  });

  // Normalize student data
  const student = rawStudent ? normalizeStudentPerformance(rawStudent) : null;

  // Fetch student goals
  const {
    data: studentGoals = [],
    isLoading: goalsLoading,
  } = useQuery({
    queryKey: ['student-goals', studentId],
    queryFn: () => goalsService.getStudentGoals(studentId),
    enabled: !!studentId,
  });

  // Fetch all assessments for the insights
  const { data: allAssessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentService.getAssessments(),
  });

  // Fetch student assessments and insights
  const { data: studentAssessmentsData, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['student-assessments', studentId],
    queryFn: async () => {
      if (!allAssessments || !studentId) return { assessments: [], insights: [] };
      
      const assessmentsWithResponses = [];
      const insights = [];
      
      for (const assessment of allAssessments) {
        try {
          const responses = await assessmentService.getStudentResponses(assessment.id, studentId);
          if (responses.length > 0) {
            assessmentsWithResponses.push(assessment);
            
            // Try to get analysis
            try {
              const analysis = await assessmentService.getAssessmentAnalysis(assessment.id, studentId);
              if (analysis) {
                insights.push({
                  id: analysis.id,
                  overall_summary: analysis.overall_summary,
                  strengths: analysis.strengths || [],
                  growth_areas: analysis.growth_areas || [],
                  recommendations: analysis.recommendations || [],
                  patterns_observed: analysis.patterns_observed || [],
                  created_at: analysis.created_at,
                  assessments: assessment
                });
              }
            } catch (error) {
              console.log(`No analysis found for assessment ${assessment.id}`);
            }
          }
        } catch (error) {
          console.error(`Error fetching data for assessment ${assessment.id}:`, error);
        }
      }
      
      return { assessments: assessmentsWithResponses, insights };
    },
    enabled: !!allAssessments && !!studentId,
  });

  React.useEffect(() => {
    if (student && student.performance && !Array.isArray(student.performance)) {
      setPerformanceData({
        averageScore: student.performance.average_score || 0,
        assessmentsCompleted: student.performance.assessment_count || 0,
        needsAttention: student.performance.needs_attention || false,
      });

      // Set default values for the form
      form.reset({
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        email: student.email || "",
        student_id: student.student_id || "",
        grade_level: student.grade_level || "",
        parent_name: student.parent_name || "",
        parent_email: student.parent_email || "",
        parent_phone: student.parent_phone || "",
      });
    }
  }, [student, form]);

  const handleRefreshInsights = () => {
    // Refetch the student assessments data to get updated insights
    if (studentAssessmentsData) {
      // Force a refetch by invalidating the query
      window.location.reload(); // Simple approach for now
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!studentId) {
        toast({
          title: "Error",
          description: "Student ID is missing.",
          variant: "destructive",
        });
        return;
      }
      
      await studentService.updateStudent(studentId, values);
      toast({
        title: "Success",
        description: "Student profile updated successfully.",
      });
      setIsEditDialogOpen(false);
      refetchStudent(); // Refresh student data
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleDelete = async () => {
    try {
      if (!studentId) {
        toast({
          title: "Error",
          description: "Student ID is missing.",
          variant: "destructive",
        });
        return;
      }
      
      await studentService.deleteStudent(studentId);
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      navigate("/app/students"); // Redirect to students list
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  }

  const actions = (
    <>
      <Button variant="ghost" onClick={() => navigate("/app/students")}>
        <ArrowLeftCircle className="mr-2 h-4 w-4" />
        Back to Students
      </Button>
      <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Student
      </Button>
    </>
  );

  return (
    <PageShell 
      title={student ? `${student.first_name} ${student.last_name}` : 'Student Profile'}
      description="View and manage student information, assessments, and insights"
      actions={actions}
      link="/app/students"
      linkText="Back to Students"
    >
      <div className="space-y-6">
        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Student Information</CardTitle>
            <CardDescription>Details about the selected student</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${student?.email || student?.first_name}.png`} />
                <AvatarFallback>{student?.first_name[0]}{student?.last_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{student?.first_name} {student?.last_name}</h3>
                <p className="text-sm text-gray-500">Student ID: {student?.student_id}</p>
              </div>
            </div>
            <div>
              {student?.email && <p>Email: {student.email}</p>}
              <p>Grade Level: {student?.grade_level}</p>
              {student?.parent_name && <p>Parent Name: {student.parent_name}</p>}
              {student?.parent_email && <p>Parent Email: {student.parent_email}</p>}
              {student?.parent_phone && <p>Parent Phone: {student.parent_phone}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Student Details, Assessments, Insights, and Goals */}
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">
              <User className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="assessments">
              <ListChecks className="h-4 w-4 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Brain className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="goals">
              <BookOpenCheck className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>Overview of student's academic performance</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="space-y-1">
                    <p className="text-lg font-medium">Average Score</p>
                    <div className="text-2xl font-bold">{performanceData.averageScore}%</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="space-y-1">
                    <p className="text-lg font-medium">Assessments Completed</p>
                    <div className="text-2xl font-bold">{performanceData.assessmentsCompleted}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="space-y-1">
                    <p className="text-lg font-medium">Needs Attention</p>
                    <Badge variant={performanceData.needsAttention ? "destructive" : "secondary"}>
                      {performanceData.needsAttention ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Student Actions</CardTitle>
                <CardDescription>Manage student profile and data</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Student
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Student
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the student and all
                        associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>List of assessments taken by the student</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This section is under development. Coming soon!</p>
                <Button onClick={() => navigate(`/app/students/${studentId}/assessments`)}>
                  View Assessments
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI-Powered Learning Insights
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of {student?.first_name}'s learning patterns and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InsightsTabContent 
                  insights={studentAssessmentsData?.insights || []}
                  isLoading={assessmentsLoading}
                  onViewAssessments={() => navigate(`/app/students/${studentId}/assessments`)}
                  studentId={studentId}
                  assessments={studentAssessmentsData?.assessments || []}
                  onInsightsUpdated={handleRefreshInsights}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Student Goals</CardTitle>
                <CardDescription>Track and manage student learning objectives</CardDescription>
              </CardHeader>
              <CardContent>
                {goalsLoading ? (
                  <p>Loading goals...</p>
                ) : studentGoals.length > 0 ? (
                  <ul>
                    {studentGoals.map((goal) => (
                      <li key={goal.id}>{goal.description}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No goals set for this student yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Student Dialog */}
      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Student Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to the student's information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Student ID" {...field} />
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
                    <FormLabel>Grade Level</FormLabel>
                    <FormControl>
                      <Input placeholder="Grade Level" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parent_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Parent Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parent_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Parent Email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parent_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Parent Phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit">Update</Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
};

export default StudentProfile;
