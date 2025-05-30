
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Send, Settings, Users, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduledEmail {
  id: string;
  title: string;
  recipients: string[];
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed';
  type: 'progress_report' | 'achievement' | 'concern_alert' | 'custom';
}

interface EnhancedEmailSchedulerProps {
  studentIds?: string[];
  onScheduleEmail?: (emailData: any) => void;
}

const EnhancedEmailScheduler: React.FC<EnhancedEmailSchedulerProps> = ({
  studentIds = [],
  onScheduleEmail
}) => {
  const { toast } = useToast();
  const [scheduleData, setScheduleData] = useState({
    emailType: 'progress_report',
    subject: '',
    customMessage: '',
    scheduledDate: '',
    scheduledTime: '',
    frequency: 'once',
    autoIncludeReports: true,
    autoIncludeGoals: false,
    sendToParents: true,
    sendToCCEmails: false,
    ccEmails: ''
  });

  const [scheduledEmails] = useState<ScheduledEmail[]>([
    {
      id: '1',
      title: 'Weekly Progress Reports',
      recipients: ['parent1@email.com', 'parent2@email.com'],
      scheduledFor: '2024-01-15 09:00',
      status: 'pending',
      type: 'progress_report'
    },
    {
      id: '2',
      title: 'Achievement Notifications',
      recipients: ['parent3@email.com'],
      scheduledFor: '2024-01-14 14:30',
      status: 'sent',
      type: 'achievement'
    }
  ]);

  const handleScheduleEmail = () => {
    if (!scheduleData.subject.trim()) {
      toast({
        title: 'Subject required',
        description: 'Please enter an email subject',
        variant: 'destructive'
      });
      return;
    }

    if (!scheduleData.scheduledDate) {
      toast({
        title: 'Date required',
        description: 'Please select a scheduled date',
        variant: 'destructive'
      });
      return;
    }

    const emailData = {
      ...scheduleData,
      studentIds,
      scheduledDateTime: `${scheduleData.scheduledDate} ${scheduleData.scheduledTime || '09:00'}`
    };

    onScheduleEmail?.(emailData);

    toast({
      title: 'Email scheduled',
      description: `Email will be sent on ${scheduleData.scheduledDate} at ${scheduleData.scheduledTime || '09:00'}`
    });

    // Reset form
    setScheduleData({
      ...scheduleData,
      subject: '',
      customMessage: '',
      scheduledDate: '',
      scheduledTime: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'progress_report':
        return <Users className="h-4 w-4" />;
      case 'achievement':
        return <Send className="h-4 w-4" />;
      case 'concern_alert':
        return <Mail className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Scheduler Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailType">Email Type</Label>
              <Select 
                value={scheduleData.emailType} 
                onValueChange={(value) => setScheduleData({...scheduleData, emailType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress_report">Progress Report</SelectItem>
                  <SelectItem value="achievement">Achievement Notification</SelectItem>
                  <SelectItem value="concern_alert">Concern Alert</SelectItem>
                  <SelectItem value="custom">Custom Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={scheduleData.frequency} 
                onValueChange={(value) => setScheduleData({...scheduleData, frequency: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Send Once</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={scheduleData.subject}
              onChange={(e) => setScheduleData({...scheduleData, subject: e.target.value})}
              placeholder="Enter email subject..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={scheduleData.scheduledDate}
                onChange={(e) => setScheduleData({...scheduleData, scheduledDate: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={scheduleData.scheduledTime}
                onChange={(e) => setScheduleData({...scheduleData, scheduledTime: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage">Custom Message (Optional)</Label>
            <Textarea
              id="customMessage"
              value={scheduleData.customMessage}
              onChange={(e) => setScheduleData({...scheduleData, customMessage: e.target.value})}
              placeholder="Add a personal message..."
              rows={3}
            />
          </div>

          {/* Email Options */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium">Email Options</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoIncludeReports">Include Progress Reports</Label>
                <Switch
                  id="autoIncludeReports"
                  checked={scheduleData.autoIncludeReports}
                  onCheckedChange={(checked) => 
                    setScheduleData({...scheduleData, autoIncludeReports: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoIncludeGoals">Include Current Goals</Label>
                <Switch
                  id="autoIncludeGoals"
                  checked={scheduleData.autoIncludeGoals}
                  onCheckedChange={(checked) => 
                    setScheduleData({...scheduleData, autoIncludeGoals: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sendToParents">Send to Parents</Label>
                <Switch
                  id="sendToParents"
                  checked={scheduleData.sendToParents}
                  onCheckedChange={(checked) => 
                    setScheduleData({...scheduleData, sendToParents: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sendToCCEmails">CC Additional Emails</Label>
                <Switch
                  id="sendToCCEmails"
                  checked={scheduleData.sendToCCEmails}
                  onCheckedChange={(checked) => 
                    setScheduleData({...scheduleData, sendToCCEmails: checked})
                  }
                />
              </div>
            </div>

            {scheduleData.sendToCCEmails && (
              <div className="space-y-2">
                <Label htmlFor="ccEmails">CC Email Addresses</Label>
                <Input
                  id="ccEmails"
                  value={scheduleData.ccEmails}
                  onChange={(e) => setScheduleData({...scheduleData, ccEmails: e.target.value})}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleScheduleEmail} className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Email
            </Button>
            <Button variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Emails List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Scheduled Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledEmails.map((email) => (
              <div 
                key={email.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getTypeIcon(email.type)}
                  <div>
                    <div className="font-medium">{email.title}</div>
                    <div className="text-sm text-gray-500">
                      {email.recipients.length} recipient{email.recipients.length !== 1 ? 's' : ''} • {email.scheduledFor}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(email.status)}
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {scheduledEmails.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No scheduled emails</p>
                <p className="text-sm">Schedule your first automated email above</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedEmailScheduler;
