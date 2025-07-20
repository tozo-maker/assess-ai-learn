import React, { useState } from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Send, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Edit
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EmailCenter: React.FC = () => {
  const { toast } = useToast();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Fetch students for email recipient selection
  const { data: students } = useQuery({
    queryKey: ['students-for-email'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, parent_email')
        .not('parent_email', 'is', null);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch email templates
  const { data: templates } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent communications
  const { data: communications } = useQuery({
    queryKey: ['recent-communications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parent_communications')
        .select(`
          *,
          student:students(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const handleSendEmail = async () => {
    if (!selectedStudents.length || !subject || !message) {
      toast({
        title: "Missing Information",
        description: "Please select recipients, subject, and message content",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create communication records for each selected student
      const communicationPromises = selectedStudents.map(async (studentId) => {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('parent_communications')
          .insert({
            student_id: studentId,
            teacher_id: user.user.id,
            communication_type: 'email',
            subject,
            content: message,
            email_status: 'sent'
          });
        
        if (error) throw error;
      });

      await Promise.all(communicationPromises);

      toast({
        title: "Emails Sent",
        description: `Successfully sent emails to ${selectedStudents.length} recipients`
      });

      // Reset form
      setSelectedStudents([]);
      setSubject('');
      setMessage('');
      setSelectedTemplate('');

    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send emails. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const actions = (
    <Mail className="h-5 w-5 text-primary" />
  );

  return (
    <StandardPageLayout 
      title="Email Center"
      description="Send emails to parents and manage communications"
      actions={actions}
      breadcrumbs={[
        { label: 'Communications', href: '/app/communications' },
        { label: 'Email Center' }
      ]}
    >
      <div className="space-y-6">
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">Compose Email</TabsTrigger>
            <TabsTrigger value="history">Communication History</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Compose Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Use Template (Optional)</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Recipient Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipients</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {students?.map((student) => (
                      <label key={student.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {student.first_name} {student.last_name}
                          <span className="text-muted-foreground ml-1">
                            ({student.parent_email})
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {selectedStudents.length > 0 && (
                    <Badge variant="secondary">
                      {selectedStudents.length} recipients selected
                    </Badge>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject..."
                  />
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Compose your message..."
                    rows={8}
                  />
                </div>

                {/* Send Button */}
                <Button 
                  onClick={handleSendEmail}
                  disabled={!selectedStudents.length || !subject || !message}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Communication History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communications?.map((comm) => (
                    <div key={comm.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(comm.email_status || 'sent')}
                          <span className="font-medium">{comm.subject}</span>
                          <Badge variant="outline" className="text-xs">
                            {comm.communication_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          To: {comm.student?.first_name} {comm.student?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(comm.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {(!communications || communications.length === 0) && (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Communications Yet</h3>
                      <p className="text-muted-foreground">
                        Your email history will appear here once you start sending messages.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Email Templates
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates?.map((template) => (
                    <div key={template.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.subject}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {template.template_type}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {(!templates || templates.length === 0) && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
                      <p className="text-muted-foreground">
                        Create email templates to streamline your communications.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StandardPageLayout>
  );
};

export default EmailCenter;