
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { emailService } from '@/services/email-service';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  parent_email?: string;
}

interface BulkEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
}

const BulkEmailDialog: React.FC<BulkEmailDialogProps> = ({
  open,
  onOpenChange,
  students
}) => {
  const { toast } = useToast();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [emailData, setEmailData] = useState({
    subject: '',
    template_type: 'bulk_announcement' as const,
    content: ''
  });

  const sendBulkEmailMutation = useMutation({
    mutationFn: emailService.sendBulkEmails,
    onSuccess: (result) => {
      toast({
        title: 'Bulk emails sent successfully',
        description: `Sent to ${result.total_sent} recipients. ${result.total_failed} failed.`
      });
      onOpenChange(false);
      setEmailData({ subject: '', template_type: 'bulk_announcement', content: '' });
      setSelectedStudents([]);
    },
    onError: (error) => {
      toast({
        title: 'Error sending bulk emails',
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

  const handleSendEmails = () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'No students selected',
        description: 'Please select at least one student.',
        variant: 'destructive'
      });
      return;
    }

    if (!emailData.subject.trim() || !emailData.content.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in both subject and content.',
        variant: 'destructive'
      });
      return;
    }

    sendBulkEmailMutation.mutate({
      student_ids: selectedStudents,
      subject: emailData.subject,
      template_type: emailData.template_type,
      template_data: {
        announcement: emailData.content
      }
    });
  };

  const studentsWithEmails = students.filter(student => student.parent_email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Send Bulk Email to Parents
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Email Type</Label>
            <Select 
              value={emailData.template_type}
              onValueChange={(value: any) => setEmailData(prev => ({ ...prev, template_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulk_announcement">Class Announcement</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject" className="text-sm font-medium mb-2 block">Subject</Label>
            <Input
              id="subject"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter email subject..."
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="text-sm font-medium mb-2 block">Message Content</Label>
            <Textarea
              id="content"
              value={emailData.content}
              onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your message..."
              rows={6}
            />
          </div>

          {/* Student Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Select Students ({selectedStudents.length} of {studentsWithEmails.length} selected)
            </Label>
            
            <div className="flex gap-2 mb-3">
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setSelectedStudents(studentsWithEmails.map(s => s.id))}
              >
                Select All
              </Button>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setSelectedStudents([])}
              >
                Clear All
              </Button>
            </div>

            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
              {studentsWithEmails.length === 0 ? (
                <p className="text-gray-500 text-sm">No students with parent email addresses found.</p>
              ) : (
                studentsWithEmails.map(student => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) => 
                        handleStudentSelection(student.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={student.id}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {student.first_name} {student.last_name} ({student.parent_email})
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmails}
              disabled={sendBulkEmailMutation.isPending || selectedStudents.length === 0}
            >
              <Mail className="h-4 w-4 mr-2" />
              {sendBulkEmailMutation.isPending ? 'Sending...' : `Send to ${selectedStudents.length} Parents`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEmailDialog;
