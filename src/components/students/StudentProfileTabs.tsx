
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Target, Brain, MessageSquare } from 'lucide-react';
import StudentAssessmentsTab from './StudentAssessmentsTab';
import StudentGoalsTab from './StudentGoalsTab';
import StudentInsightsTab from './StudentInsightsTab';
import StudentCommunicationTab from './StudentCommunicationTab';

interface StudentProfileTabsProps {
  studentId: string;
}

const StudentProfileTabs: React.FC<StudentProfileTabsProps> = ({ studentId }) => {
  return (
    <Tabs defaultValue="assessments" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="assessments" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Assessments
        </TabsTrigger>
        <TabsTrigger value="goals" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Goals
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Insights
        </TabsTrigger>
        <TabsTrigger value="communication" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Communication
        </TabsTrigger>
      </TabsList>

      <TabsContent value="assessments">
        <StudentAssessmentsTab studentId={studentId} />
      </TabsContent>

      <TabsContent value="goals">
        <StudentGoalsTab studentId={studentId} />
      </TabsContent>

      <TabsContent value="insights">
        <StudentInsightsTab studentId={studentId} />
      </TabsContent>

      <TabsContent value="communication">
        <StudentCommunicationTab studentId={studentId} />
      </TabsContent>
    </Tabs>
  );
};

export default StudentProfileTabs;
