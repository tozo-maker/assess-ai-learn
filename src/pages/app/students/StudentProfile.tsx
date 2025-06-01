import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Edit, User, Brain, BookOpenCheck, ListChecks } from 'lucide-react';
import * as z from "zod";

// Design System Components
import {
  DSPageContainer,
  DSSection,
  DSPageTitle,
  DSBodyText,
  DSFlexContainer,
  DSButton,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSSpacer
} from '@/components/ui/design-system';

// Original Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';
import { goalsService } from '@/services/goals-service';
import { useToast } from '@/hooks/use-toast';
import { normalizeStudentPerformance } from '@/types/student';

// Import the new components
import StudentInfoCard from '@/components/students/StudentInfoCard';
import StudentProfileTabs from '@/components/students/StudentProfileTabs';
import EditStudentDialog from '@/components/students/EditStudentDialog';

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
});

interface PerformanceData {
  averageScore: number;
  assessmentsCompleted: number;
  needsAttention: boolean;
}

interface AssessmentResponse {
  score: number;
}

interface AssessmentWithData {
  id: string;
  title: string;
  subject: string;
  assessment_date?: string;
  max_score: number;
  totalScore: number;
  responses: AssessmentResponse[];
}

interface StudentInsight {
  id: string;
  overall_summary?: string;
  strengths: string[];
  growth_areas: string[];
  recommendations: string[];
  patterns_observed: string[];
  created_at: string;
  assessments: {
    id: string;
    title: string;
    subject: string;
    assessment_date?: string;
  };
}

interface StudentAssessmentsData {
  assessments: AssessmentWithData[];
  insights: StudentInsight[];
}

const StudentProfile: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const studentId = params.id;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
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
      return studentService.getStudentById(studentId!);
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
    queryFn: () => goalsService.getStudentGoals(studentId!),
    enabled: !!studentId,
  });

  // Fetch all assessments for the insights
  const { data: allAssessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentService.getAssessments(),
  });

  // Fetch student assessments and insights with improved error handling
  const { 
    data: studentAssessmentsData, 
    isLoading: assessmentsLoading, 
    refetch: refetchAssessments 
  } = useQuery<StudentAssessmentsData>({
    queryKey: ['student-assessments', studentId],
    queryFn: async (): Promise<StudentAssessmentsData> => {
      if (!allAssessments || !studentId) return { assessments: [], insights: [] };
      
      const assessmentsWithResponses: AssessmentWithData[] = [];
      const insights: StudentInsight[] = [];
      
      for (const assessment of allAssessments) {
        try {
          const responses = await assessmentService.getStudentResponses(assessment.id, studentId);
          
          if (responses.length > 0) {
            const totalScore = responses.reduce((sum: number, r: AssessmentResponse) => sum + r.score, 0);
            const assessmentWithData: AssessmentWithData = {
              id: assessment.id,
              title: assessment.title,
              subject: assessment.subject,
              assessment_date: assessment.assessment_date,
              max_score: assessment.max_score,
              totalScore,
              responses,
            };
            
            assessmentsWithResponses.push(assessmentWithData);
            
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
                  assessments: {
                    id: assessment.id,
                    title: assessment.title,
                    subject: assessment.subject,
                    assessment_date: assessment.assessment_date
                  }
                });
              }
            } catch (error) {
              // No analysis found - this is expected for some assessments
            }
          }
        } catch (error) {
          // Error fetching data for assessment - continue with next assessment
        }
      }
      
      return { assessments: assessmentsWithResponses, insights };
    },
    enabled: !!allAssessments && !!studentId,
  });

  useEffect(() => {
    if (student && student.performance && !Array.isArray(student.performance)) {
      setPerformanceData({
        averageScore: student.performance.average_score || 0,
        assessmentsCompleted: student.performance.assessment_count || 0,
        needsAttention: student.performance.needs_attention || false,
      });
    }
  }, [student]);

  const handleRefreshInsights = (): void => {
    // Refetch the student assessments data to get updated insights
    refetchAssessments();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>): Promise<void> => {
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
      toast({
        title: "Error",
        description: "Failed to update student profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (): Promise<void> => {
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
      navigate("/app/students"); // Redirect to students list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!student) {
    return (
      <DSSection>
        <DSPageContainer>
          <DSFlexContainer justify="between" align="center" className="mb-8">
            <div>
              <DSPageTitle>Loading...</DSPageTitle>
              <DSBodyText className="text-gray-600">
                Loading student profile...
              </DSBodyText>
            </div>
            <DSButton 
              variant="secondary" 
              onClick={() => navigate("/app/students")}
            >
              Back to Students
            </DSButton>
          </DSFlexContainer>
          <div>Loading student data...</div>
        </DSPageContainer>
      </DSSection>
    );
  }

  return (
    <DSSection>
      <DSPageContainer>
        {/* Profile Header */}
        <DSFlexContainer justify="between" align="center" className="mb-8">
          <DSFlexContainer align="center" gap="lg">
            {/* Large Avatar */}
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {student.first_name[0]}{student.last_name[0]}
              </span>
            </div>
            <div>
              <DSPageTitle className="mb-1">
                {student.first_name} {student.last_name}
              </DSPageTitle>
              <DSBodyText className="text-gray-600">
                {student.grade_level} Grade • Student ID: {student.student_id || 'Not provided'}
              </DSBodyText>
            </div>
          </DSFlexContainer>
          
          {/* Action Toolbar */}
          <DSFlexContainer gap="sm">
            <DSButton 
              variant="secondary" 
              onClick={() => navigate("/app/students")}
            >
              Back to Students
            </DSButton>
            <DSButton 
              variant="primary" 
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Student
            </DSButton>
          </DSFlexContainer>
        </DSFlexContainer>

        <DSSpacer size="lg" />

        {/* Student Info Card */}
        <StudentInfoCard student={student} />

        <DSSpacer size="xl" />

        {/* Tab Navigation */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-lg p-1">
            <TabsTrigger 
              value="details" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <User className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="assessments"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <ListChecks className="h-4 w-4" />
              Assessments
            </TabsTrigger>
            <TabsTrigger 
              value="insights"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <Brain className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger 
              value="goals"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <BookOpenCheck className="h-4 w-4" />
              Goals
            </TabsTrigger>
          </TabsList>

          <DSSpacer size="lg" />

          {/* Tab Content with consistent card styling */}
          <StudentProfileTabs
            student={student}
            studentId={studentId || ''}
            performanceData={performanceData}
            studentAssessmentsData={studentAssessmentsData}
            assessmentsLoading={assessmentsLoading}
            studentGoals={studentGoals}
            goalsLoading={goalsLoading}
            onEditClick={() => setIsEditDialogOpen(true)}
            onDelete={handleDelete}
            onViewAssessments={() => navigate(`/app/students/${studentId}/assessments`)}
            onRefreshInsights={handleRefreshInsights}
          />
        </Tabs>

        {/* Edit Student Dialog */}
        <EditStudentDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          student={student}
          onSubmit={onSubmit}
        />
      </DSPageContainer>
    </DSSection>
  );
};

export default StudentProfile;
