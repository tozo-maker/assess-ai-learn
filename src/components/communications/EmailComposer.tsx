
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useStudents } from '@/hooks/useStudents';
import { Mail, Send, Users } from 'lucide-react';
import { emailService } from '@/services/email-service';

interface EmailComposerProps {
  preselectedStudents?: string[];
  templateType?: 'progress_report' | 'achievement' | 'concern_alert' | 'custom' | 'bulk_announcement';
}

type EmailType = 'progress_report' | 'achievement' | 'concern_alert' | 'custom' | 'bulk_announcement';

const EmailComposer: React.FC<EmailComposerProps> = ({
  preselectedStudents = [],
  templateType = 'custom'
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>(preselectedStudents);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [emailType, setEmailType] = useState<EmailType>(templateType);
  const { toast } = useToast();

  const { data: students = [], isLoading } = useStudents();

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const selectedStudentData = students.filter(s => selectedStudents.includes(s.id));
      const recipients = selectedStudentData
        .map(s => s.parent_email)
        .filter(Boolean) as string[];

      if (recipients.length === 0) {
        throw new Error('No valid parent email addresses found');
      }

      return await emailService.sendEmail({
        recipients,
        subject,
        template_type: emailType,
        template_data: {
          content,
          custom_content: content,
          students: selectedStudentData
        }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Email sent successfully',
        description: `Email sent to ${selectedStudents.length} parent(s)`
      });
      setSubject('');
      setContent('');
      setSelectedStudents([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send email',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const handleClearSelection = () => {
    setSelectedStudents([]);
  };

  const handleEmailTypeChange = (value: string) => {
    setEmailType(value as EmailType);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Type</label>
            <Select value={emailType} onValueChange={handleEmailTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Message</SelectItem>
                <SelectItem value="progress_report">Progress Report</SelectItem>
                <SelectItem value="achievement">Achievement Notification</SelectItem>
                <SelectItem value="concern_alert">Concern Alert</SelectItem>
                <SelectItem value="bulk_announcement">Bulk Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <Input
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Message Content</label>
            <Textarea
              placeholder="Enter your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      {/* Student Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Recipients ({selectedStudents.length} selected)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearSelection}>
              Clear Selection
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {students.map(student => (
              <div key={student.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                <Checkbox
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={(checked) => handleStudentSelection(student.id, checked as boolean)}
                />
                <div className="flex-1">
                  <p className="font-medium">{student.first_name} {student.last_name}</p>
                  <p className="text-sm text-gray-600">{student.parent_email || 'No email available'}</p>
                </div>
                {!student.parent_email && (
                  <Badge variant="secondary" className="text-xs">No email</Badge>
                )}
              </div>
            ))}
          </div>

          {selectedStudents.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button 
                onClick={() => sendEmailMutation.mutate()}
                disabled={!subject || !content || sendEmailMutation.isPending}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendEmailMutation.isPending ? 'Sending...' : `Send Email to ${selectedStudents.length} Parent(s)`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailComposer;
