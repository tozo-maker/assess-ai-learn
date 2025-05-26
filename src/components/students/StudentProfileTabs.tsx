
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  BookOpenCheck, 
  ListChecks, 
  User
} from 'lucide-react';
import { StudentWithPerformance } from '@/types/student';
import PerformanceSummaryCard from './PerformanceSummaryCard';
import StudentActionsCard from './StudentActionsCard';
import AssessmentsTabContent from '@/components/communications/AssessmentsTabContent';
import InsightsTabContent from '@/components/communications/InsightsTabContent';
import GoalsTabContent from '@/components/communications/GoalsTabContent';

interface StudentProfileTabsProps {
  student: StudentWithPerformance | null;
  studentId: string;
  performanceData: {
    averageScore: number;
    assessmentsCompleted: number;
    needsAttention: boolean;
  };
  studentAssessmentsData: any;
  assessmentsLoading: boolean;
  studentGoals: any[];
  goalsLoading: boolean;
  onEditClick: () => void;
  onDelete: () => void;
  onViewAssessments: () => void;
  onRefreshInsights: () => void;
}

const StudentProfileTabs: React.FC<StudentProfileTabsProps> = ({
  student,
  studentId,
  performanceData,
  studentAssessmentsData,
  assessmentsLoading,
  studentGoals,
  goalsLoading,
  onEditClick,
  onDelete,
  onViewAssessments,
  onRefreshInsights
}) => {
  return (
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
        <PerformanceSummaryCard performanceData={performanceData} />
        <StudentActionsCard onEditClick={onEditClick} onDelete={onDelete} />
      </TabsContent>

      {/* Assessments Tab */}
      <TabsContent value="assessments">
        <Card>
          <CardHeader>
            <CardTitle>Assessments Overview</CardTitle>
            <CardDescription>Assessment performance and history for {student?.first_name} {student?.last_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <AssessmentsTabContent 
              assessments={studentAssessmentsData?.assessments || []}
              isLoading={assessmentsLoading}
              studentId={studentId || ''}
              studentName={student ? `${student.first_name} ${student.last_name}` : ''}
            />
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
              onViewAssessments={onViewAssessments}
              studentId={studentId}
              assessments={studentAssessmentsData?.assessments || []}
              onInsightsUpdated={onRefreshInsights}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Goals Tab */}
      <TabsContent value="goals">
        <Card>
          <CardHeader>
            <CardTitle>Learning Goals Management</CardTitle>
            <CardDescription>Create, track, and manage learning objectives for {student?.first_name} {student?.last_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalsTabContent 
              goals={studentGoals} 
              studentId={studentId}
              studentName={student ? `${student.first_name} ${student.last_name}` : ''}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default StudentProfileTabs;
