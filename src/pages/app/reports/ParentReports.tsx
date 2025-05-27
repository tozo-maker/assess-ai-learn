import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { Mail, FileText, Send, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import ProgressReportViewer from '@/components/communications/ProgressReportViewer';
import { studentService } from '@/services/student-service';
import { communicationsService } from '@/services/communications-service';
import { CommunicationFormData } from '@/types/communications';
import BulkEmailDialog from '@/components/communications/BulkEmailDialog';
import EmailAutomationSettings from '@/components/communications/EmailAutomationSettings';
import { useAutomatedEmails } from '@/hooks/useAutomatedEmails';

const ParentReports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['communications'],
    queryFn: communicationsService.getCommunications
  });

  const generateReportMutation = useMutation({
    mutationFn: communicationsService.generateProgressReport,
    onSuccess: (data) => {
      setReportData(data);
      setShowReportDialog(true);
    },
    onError: (error) => {
      toast({
        title: 'Error generating report',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const generatePDFMutation = useMutation({
    mutationFn: communicationsService.generateProgressReportPDF,
    onSuccess: (pdfUrl) => {
      window.open(pdfUrl, '_blank');
      toast({
        title: 'PDF Generated',
        description: 'The progress report PDF has been generated and will open in a new tab.'
      });
    }
  });

  const createCommunicationMutation = useMutation({
    mutationFn: communicationsService.createCommunication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      setShowCommunicationDialog(false);
      toast({
        title: 'Communication created',
        description: 'Parent communication has been saved successfully.'
      });
    }
  });

  const { sendAchievementNotification, sendConcernAlert, scheduleWeeklyEmails } = useAutomatedEmails();

  const handleGenerateReport = () => {
    if (!selectedStudent) {
      toast({
        title: 'No student selected',
        description: 'Please select a student first.',
        variant: 'destructive'
      });
      return;
    }
    generateReportMutation.mutate(selectedStudent);
  };

  const handleGeneratePDF = () => {
    if (!selectedStudent) {
      toast({
        title: 'No student selected',
        description: 'Please select a student first.',
        variant: 'destructive'
      });
      return;
    }
    generatePDFMutation.mutate(selectedStudent);
  };

  const handleCreateCommunication = (data: CommunicationFormData) => {
    createCommunicationMutation.mutate(data);
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  // Transform students data for BulkEmailDialog compatibility
  const studentsForBulkEmail = students.map(student => ({
    id: student.id,
    first_name: student.first_name,
    last_name: student.last_name,
    parent_email: student.parent_email || ''
  }));

  return (
    <PageShell 
      title="Parent Communication" 
      description="Share insights and progress with parents"
      icon={<Mail className="h-6 w-6 text-blue-600" />}
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Communications</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communications.length}</div>
              <p className="text-xs text-muted-foreground">This academic year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {communications.filter(c => c.communication_type === 'progress_report').length}
              </div>
              <p className="text-xs text-muted-foreground">Progress reports sent</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Progress Reports</CardTitle>
            <p className="text-sm text-gray-600">
              Create comprehensive progress reports to share with parents
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Select Student</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} - Grade {student.grade_level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={!selectedStudent || generateReportMutation.isPending}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {generateReportMutation.isPending ? 'Generating...' : 'Preview Report'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGeneratePDF}
                    disabled={!selectedStudent || generatePDFMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generatePDFMutation.isPending ? 'Generating PDF...' : 'Generate PDF'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Communication History</CardTitle>
              <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    New Communication
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Parent Communication</DialogTitle>
                  </DialogHeader>
                  <CommunicationForm
                    students={students}
                    onSubmit={handleCreateCommunication}
                    isLoading={createCommunicationMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {communications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No communications yet. Create your first parent communication to get started.
                </p>
              ) : (
                communications.map((comm) => (
                  <div key={comm.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{comm.subject}</div>
                      <div className="text-sm text-gray-600">
                        {comm.communication_type.replace('_', ' ')} • {new Date(comm.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {comm.pdf_url && (
                        <Button size="sm" variant="outline" onClick={() => window.open(comm.pdf_url, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {!comm.sent_at && (
                        <Button size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Progress Report Preview</DialogTitle>
            </DialogHeader>
            {reportData && <ProgressReportViewer reportData={reportData} />}
          </DialogContent>
        </Dialog>

        {/* Add Email Automation Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Email Automation</CardTitle>
            <p className="text-sm text-gray-600">
              Set up automated progress updates, achievement notifications, and concern alerts
            </p>
          </CardHeader>
          <CardContent>
            <EmailAutomationSettings teacherId="current-teacher-id" />
          </CardContent>
        </Card>

        {/* Quick Actions for Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-gray-600">
              Test automated email features
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  if (selectedStudent) {
                    sendAchievementNotification({
                      studentId: selectedStudent,
                      achievement: {
                        type: 'high_score',
                        title: 'Excellent Math Assessment',
                        description: 'Scored 95% on latest math assessment',
                        score: 95,
                        next_steps: ['Continue practicing advanced problems', 'Consider enrichment activities']
                      }
                    });
                  }
                }}
                disabled={!selectedStudent}
              >
                Send Test Achievement
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  if (selectedStudent) {
                    sendConcernAlert({
                      studentId: selectedStudent,
                      concern: {
                        type: 'low_performance',
                        title: 'Reading Comprehension Support Needed',
                        description: 'Recent assessments show difficulty with reading comprehension',
                        suggested_actions: [
                          'Schedule parent-teacher conference',
                          'Consider additional reading practice at home',
                          'Explore tutoring options'
                        ],
                        urgency: 'medium'
                      }
                    });
                  }
                }}
                disabled={!selectedStudent}
              >
                Send Test Concern
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => scheduleWeeklyEmails('current-teacher-id')}
              >
                Schedule Weekly Emails
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Bulk Email Card */}
        <Card>
          <CardHeader>
            <CardTitle>Class Communications</CardTitle>
            <p className="text-sm text-gray-600">
              Send announcements and updates to multiple parents at once
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowBulkEmailDialog(true)}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Bulk Email to Parents
            </Button>
          </CardContent>
        </Card>

        {/* Add Bulk Email Dialog */}
        <BulkEmailDialog
          open={showBulkEmailDialog}
          onOpenChange={setShowBulkEmailDialog}
          students={studentsForBulkEmail}
        />
      </div>
    </PageShell>
  );
};

// Communication Form Component
const CommunicationForm = ({ students, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    communication_type: 'general',
    subject: '',
    content: '',
    parent_email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Student</label>
        <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select student" />
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
        <label className="text-sm font-medium mb-2 block">Type</label>
        <Select value={formData.communication_type} onValueChange={(value) => setFormData({...formData, communication_type: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="progress_report">Progress Report</SelectItem>
            <SelectItem value="assessment_summary">Assessment Summary</SelectItem>
            <SelectItem value="goal_update">Goal Update</SelectItem>
            <SelectItem value="general">General Communication</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Subject</label>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          placeholder="Enter subject"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Content</label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          placeholder="Write your message to parents..."
          rows={4}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Parent Email (Optional)</label>
        <Input
          type="email"
          value={formData.parent_email}
          onChange={(e) => setFormData({...formData, parent_email: e.target.value})}
          placeholder="parent@email.com"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Communication'}
      </Button>
    </form>
  );
};

export default ParentReports;
