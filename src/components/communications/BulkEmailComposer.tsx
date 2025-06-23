
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Send, Users, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { emailService } from '@/services/email-service';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  parent_email?: string;
  grade_level: string;
}

interface BulkEmailComposerProps {
  students: Student[];
}

const BulkEmailComposer: React.FC<BulkEmailComposerProps> = ({ students }) => {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [templateType, setTemplateType] = useState<'progress_report' | 'achievement' | 'concern_alert' | 'custom' | 'bulk_announcement'>('bulk_announcement');
  const { toast } = useToast();

  const bulkEmailMutation = useMutation({
    mutationFn: async () => {
      const selectedStudentData = students.filter(s => selectedStudents.has(s.id));
      const recipients = selectedStudentData
        .filter(s => s.parent_email)
        .map(s => s.parent_email!);

      if (recipients.length === 0) {
        throw new Error('No valid email addresses found for selected students');
      }

      return emailService.sendEmail({
        recipients,
        subject,
        template_type: templateType,
        template_data: {
          content: message,
          custom_content: message,
          student_count: selectedStudents.size
        }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Bulk Email Sent',
        description: `Email sent to ${selectedStudents.size} families successfully`
      });
      setSelectedStudents(new Set());
      setSubject('');
      setMessage('');
    },
    onError: (error) => {
      toast({
        title: 'Error Sending Email',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    const studentsWithEmail = students.filter(s => s.parent_email);
    setSelectedStudents(new Set(studentsWithEmail.map(s => s.id)));
  };

  const handleClearAll = () => {
    setSelectedStudents(new Set());
  };

  const studentsWithEmail = students.filter(s => s.parent_email);
  const selectedStudentData = students.filter(s => selectedStudents.has(s.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Email Composer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">Select Students</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All ({studentsWithEmail.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
              {studentsWithEmail.map((student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={student.id}
                    checked={selectedStudents.has(student.id)}
                    onCheckedChange={(checked) => handleStudentToggle(student.id, checked as boolean)}
                  />
                  <Label htmlFor={student.id} className="text-sm cursor-pointer">
                    {student.first_name} {student.last_name}
                    <span className="text-gray-500 ml-1">({student.grade_level})</span>
                  </Label>
                </div>
              ))}
            </div>

            {selectedStudents.size > 0 && (
              <div className="mt-4">
                <Label className="text-sm text-gray-600">Selected ({selectedStudents.size}):</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedStudentData.slice(0, 5).map((student) => (
                    <Badge key={student.id} variant="secondary" className="flex items-center gap-1">
                      {student.first_name} {student.last_name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleStudentToggle(student.id, false)}
                      />
                    </Badge>
                  ))}
                  {selectedStudents.size > 5 && (
                    <Badge variant="outline">+{selectedStudents.size - 5} more</Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Email Template Selection */}
          <div>
            <Label htmlFor="template-type">Email Template</Label>
            <Select value={templateType} onValueChange={(value: any) => setTemplateType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulk_announcement">Class Announcement</SelectItem>
                <SelectItem value="progress_report">Progress Update</SelectItem>
                <SelectItem value="achievement">Achievement Recognition</SelectItem>
                <SelectItem value="concern_alert">Attention Needed</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject Line */}
          <div>
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>

          {/* Message Content */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message to parents/guardians"
              rows={6}
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <Button 
              onClick={() => bulkEmailMutation.mutate()}
              disabled={selectedStudents.size === 0 || !subject || !message || bulkEmailMutation.isPending}
              className="min-w-32"
            >
              {bulkEmailMutation.isPending ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {selectedStudents.size} families
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkEmailComposer;
