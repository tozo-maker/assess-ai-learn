
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BookOpen, 
  Brain, 
  Target, 
  TrendingUp,
  Calendar,
  Award,
  AlertCircle
} from 'lucide-react';
import { assessmentService } from '@/services/assessment-service';
import UniversalLoadingState from '@/components/common/UniversalLoadingState';
import EnhancedEmptyState from '@/components/common/EnhancedEmptyState';
import { useNavigate } from 'react-router-dom';

interface StudentProfileTabsProps {
  studentId: string;
}

const StudentProfileTabs: React.FC<StudentProfileTabsProps> = ({ studentId }) => {
  const [activeTab, setActiveTab] = useState('assessments');
  const navigate = useNavigate();

  const { data: studentResponses, isLoading: responsesLoading } = useQuery({
    queryKey: ['student-responses', studentId],
    queryFn: () => assessmentService.getStudentResponsesByStudent(studentId),
  });

  const handleCreateGoal = () => {
    navigate('/app/students/goals', { state: { studentId } });
  };

  const handleCreateAssessment = () => {
    navigate('/app/assessments/add', { state: { preselectedStudent: studentId } });
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (responsesLoading) {
    return <UniversalLoadingState type="table" message="Loading student data..." />;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="assessments" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Assessments</span>
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">Insights</span>
        </TabsTrigger>
        <TabsTrigger value="goals" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <span className="hidden sm:inline">Goals</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="assessments" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Assessment History
              </CardTitle>
              <Button onClick={handleCreateAssessment} size="sm">
                Add Assessment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!studentResponses || studentResponses.length === 0 ? (
              <EnhancedEmptyState
                icon={BookOpen}
                title="No assessments found"
                description="This student hasn't taken any assessments yet. Create an assessment to start tracking their progress."
                actionLabel="Create Assessment"
                onAction={handleCreateAssessment}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentResponses.map((response) => {
                    const assessment = response.assessment;
                    const percentage = assessment ? 
                      Math.round((response.score / assessment.max_score) * 100) : 0;
                    
                    return (
                      <TableRow key={response.id}>
                        <TableCell className="font-medium">
                          {assessment?.title || 'Unknown Assessment'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {assessment?.subject || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={assessment ? getScoreColor(response.score, assessment.max_score) : ''}>
                            {response.score}/{assessment?.max_score || 100} ({percentage}%)
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(response.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Completed</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="insights" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedEmptyState
              icon={Brain}
              title="AI insights coming soon"
              description="Advanced performance insights and recommendations will be available once we have more assessment data for this student."
              actionLabel="Add Assessment"
              onAction={handleCreateAssessment}
              secondaryActionLabel="View All Insights"
              onSecondaryAction={() => navigate('/app/insights/individual')}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="goals" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Goals
              </CardTitle>
              <Button onClick={handleCreateGoal} size="sm">
                Create Goal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <EnhancedEmptyState
              icon={Target}
              title="No learning goals set"
              description="Set personalized learning goals to track this student's progress and achievements over time."
              actionLabel="Create First Goal"
              onAction={handleCreateGoal}
              secondaryActionLabel="Browse Goal Templates"
              onSecondaryAction={() => navigate('/app/goals')}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default StudentProfileTabs;
