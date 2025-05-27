
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Send, Users } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { emailService, EmailOptions, BulkEmailOptions } from '@/services/email-service';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmailSendButtonProps {
  type: 'single' | 'bulk';
  studentIds?: string[];
  recipientEmail?: string;
  studentName?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const EmailSendButton: React.FC<EmailSendButtonProps> = ({
  type,
  studentIds = [],
  recipientEmail,
  studentName,
  variant = "outline",
  size = "sm"
}) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [templateType, setTemplateType] = useState<'progress_report' | 'achievement' | 'concern_alert' | 'custom'>('custom');
  const { toast } = useToast();

  const emailMutation = useMutation({
    mutationFn: async (emailData: EmailOptions | BulkEmailOptions) => {
      if (type === 'bulk') {
        return emailService.sendBulkEmails(emailData as BulkEmailOptions);
      } else {
        return emailService.sendEmail(emailData as EmailOptions);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Email Sent',
        description: `Email${type === 'bulk' ? 's' : ''} sent successfully!`
      });
      setOpen(false);
      setSubject('');
      setMessage('');
    },
    onError: (error) => {
      toast({
        title: 'Email Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSend = () => {
    if (!subject || !message) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both subject and message',
        variant: 'destructive'
      });
      return;
    }

    if (type === 'bulk') {
      emailMutation.mutate({
        student_ids: studentIds,
        subject,
        template_type: templateType,
        template_data: {
          message,
          custom_content: message
        }
      });
    } else {
      if (!recipientEmail) {
        toast({
          title: 'No Email Address',
          description: 'No parent email address available',
          variant: 'destructive'
        });
        return;
      }

      emailMutation.mutate({
        recipients: [recipientEmail],
        subject,
        template_type: templateType,
        template_data: {
          message,
          custom_content: message,
          student_name: studentName
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          {type === 'bulk' ? <Users className="h-4 w-4 mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
          {type === 'bulk' ? 'Send to Class' : 'Send Email'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'bulk' ? `Send Email to ${studentIds.length} Students` : `Send Email to ${studentName || 'Parent'}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="template-type">Email Template</Label>
            <Select value={templateType} onValueChange={(value: any) => setTemplateType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress_report">Progress Report</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="concern_alert">Concern Alert</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={emailMutation.isPending}>
              {emailMutation.isPending ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSendButton;
