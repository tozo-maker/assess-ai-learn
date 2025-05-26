
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftCircle, Edit } from 'lucide-react';
import * as z from "zod";

import { PageShell } from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
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

  if (!student) {
    return (
      <PageShell 
        title="Loading..."
        description="Loading student profile..."
        actions={actions}
        link="/app/students"
        linkText="Back to Students"
      >
        <div>Loading student data...</div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title={`${student.first_name} ${student.last_name}`}
      description="View and manage student information, assessments, and insights"
      actions={actions}
      link="/app/students"
      linkText="Back to Students"
    >
      <div className="space-y-6">
        {/* Student Info Card */}
        <StudentInfoCard student={student} />

        {/* Tabs for Student Details, Assessments, Insights, and Goals */}
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
      </div>

      {/* Edit Student Dialog */}
      <EditStudentDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        student={student}
        onSubmit={onSubmit}
      />
    </PageShell>
  );
};

export default StudentProfile;
