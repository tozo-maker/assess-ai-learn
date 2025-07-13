
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Target, Brain, MessageSquare } from 'lucide-react';
import StudentAssessmentsTab from './StudentAssessmentsTab';
import StudentGoalsTab from './StudentGoalsTab';
import StudentInsightsTab from './StudentInsightsTab';
import StudentCommunicationTab from './StudentCommunicationTab';
import StudentTabErrorBoundary from '@/components/common/StudentTabErrorBoundary';

interface StudentProfileTabsProps {
  studentId: string;
}

const StudentProfileTabs: React.FC<StudentProfileTabsProps> = ({ studentId }) => {
  if (!studentId) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Student ID is required to load tabs</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="assessments" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 h-auto p-1">
        <TabsTrigger value="assessments" className="flex items-center gap-2 text-xs sm:text-sm px-2 py-3">
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Assessments</span>
          <span className="sm:hidden">Tests</span>
        </TabsTrigger>
        <TabsTrigger value="goals" className="flex items-center gap-2 text-xs sm:text-sm px-2 py-3">
          <Target className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Goals</span>
          <span className="sm:hidden">Goals</span>
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center gap-2 text-xs sm:text-sm px-2 py-3">
          <Brain className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Insights</span>
          <span className="sm:hidden">AI</span>
        </TabsTrigger>
        <TabsTrigger value="communication" className="flex items-center gap-2 text-xs sm:text-sm px-2 py-3">
          <MessageSquare className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Communication</span>
          <span className="sm:hidden">Talk</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="assessments" className="mt-6">
        <StudentTabErrorBoundary tabName="Assessments">
          <StudentAssessmentsTab studentId={studentId} />
        </StudentTabErrorBoundary>
      </TabsContent>

      <TabsContent value="goals" className="mt-6">
        <StudentTabErrorBoundary tabName="Goals">
          <StudentGoalsTab studentId={studentId} />
        </StudentTabErrorBoundary>
      </TabsContent>

      <TabsContent value="insights" className="mt-6">
        <StudentTabErrorBoundary tabName="Insights">
          <StudentInsightsTab studentId={studentId} />
        </StudentTabErrorBoundary>
      </TabsContent>

      <TabsContent value="communication" className="mt-6">
        <StudentTabErrorBoundary tabName="Communication">
          <StudentCommunicationTab studentId={studentId} />
        </StudentTabErrorBoundary>
      </TabsContent>
    </Tabs>
  );
};

export default StudentProfileTabs;
