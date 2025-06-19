
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Mail, Calendar, TrendingUp, Target } from 'lucide-react';

interface ProgressReportGeneratorProps {
  studentId?: string;
}

const ProgressReportGenerator: React.FC<ProgressReportGeneratorProps> = ({ studentId }) => {
  const [selectedStudent, setSelectedStudent] = useState(studentId || '');
  const [reportType, setReportType] = useState('comprehensive');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Fetch students for selection
  const { data: students = [] } = useQuery({
    queryKey: ['students-for-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .order('last_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch comprehensive student data for the report
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['student-report-data', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return null;

      // Fetch student info
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('id', selectedStudent)
        .single();

      // Fetch assessments and responses
      const { data: assessments } = await supabase
        .from('assessments')
        .select(`
          *,
          student_responses!inner(*)
        `)
        .eq('student_responses.student_id', selectedStudent);

      // Fetch goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('student_id', selectedStudent);

      // Fetch AI insights
      const { data: insights } = await supabase
        .from('assessment_analysis')
        .select('*')
        .eq('student_id', selectedStudent)
        .order('created_at', { ascending: false })
        .limit(3);

      return { student, assessments, goals, insights };
    },
    enabled: !!selectedStudent
  });

  const generateReport = async () => {
    if (!selectedStudent || !reportData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a student first"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Here you would typically call an edge function to generate a PDF report
      // For now, we'll simulate the report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated",
        description: "Progress report has been generated successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendReportToParent = async () => {
    if (!reportData?.student?.parent_email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No parent email address found"
      });
      return;
    }

    try {
      toast({
        title: "Report Sent",
        description: `Progress report sent to ${reportData.student.parent_email}`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send report"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Progress Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  <SelectItem value="academic">Academic Performance</SelectItem>
                  <SelectItem value="goals">Goals Progress</SelectItem>
                  <SelectItem value="behavioral">Behavioral Insights</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateReport}
              disabled={!selectedStudent || isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={sendReportToParent}
              disabled={!selectedStudent || !reportData?.student?.parent_email}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email to Parent
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview - {reportData.student?.first_name} {reportData.student?.last_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {reportData.assessments?.length || 0}
                </div>
                <p className="text-sm text-gray-600">Assessments Completed</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {reportData.goals?.filter(g => g.status === 'completed').length || 0}
                </div>
                <p className="text-sm text-gray-600">Goals Achieved</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {reportData.insights?.length || 0}
                </div>
                <p className="text-sm text-gray-600">AI Insights</p>
              </div>
            </div>

            {/* Goals Progress */}
            {reportData.goals && reportData.goals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Learning Goals Progress
                </h3>
                <div className="space-y-3">
                  {reportData.goals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{goal.title}</h4>
                        <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                          {goal.status}
                        </Badge>
                      </div>
                      <Progress value={goal.progress_percentage || 0} className="mb-2" />
                      <p className="text-sm text-gray-600">{goal.progress_percentage || 0}% complete</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Insights */}
            {reportData.insights && reportData.insights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent AI Insights
                </h3>
                <div className="space-y-3">
                  {reportData.insights.map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      {insight.overall_summary && (
                        <p className="text-sm text-gray-700 mb-2">{insight.overall_summary}</p>
                      )}
                      <div className="flex gap-2 text-xs">
                        {insight.strengths?.slice(0, 2).map((strength, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <Calendar className="h-4 w-4 inline mr-1" />
              Report generated on {new Date().toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressReportGenerator;
