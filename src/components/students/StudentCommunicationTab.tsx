
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Plus, Mail, Phone, Calendar } from 'lucide-react';

interface Communication {
  id: string;
  communication_type: string;
  subject: string;
  content: string;
  parent_email?: string;
  email_status?: string;
  sent_at?: string;
  created_at: string;
}

interface StudentCommunicationTabProps {
  studentId: string;
}

const StudentCommunicationTab: React.FC<StudentCommunicationTabProps> = ({ studentId }) => {
  const [showNewCommunication, setShowNewCommunication] = useState(false);
  const [formData, setFormData] = useState({
    communication_type: 'email',
    subject: '',
    content: '',
    parent_email: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch student communications
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['student-communications', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parent_communications')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Communication[];
    }
  });

  // Fetch student details for parent email
  const { data: student } = useQuery({
    queryKey: ['student-details', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('parent_email, parent_name, first_name, last_name')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Create communication mutation
  const createCommunicationMutation = useMutation({
    mutationFn: async (communicationData: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('parent_communications')
        .insert({
          student_id: studentId,
          teacher_id: user.id,
          ...communicationData,
          email_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Communication logged successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['student-communications', studentId] });
      setShowNewCommunication(false);
      setFormData({ communication_type: 'email', subject: '', content: '', parent_email: '' });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log communication"
      });
    }
  });

  const handleCreateCommunication = () => {
    if (!formData.subject || !formData.content) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in subject and content"
      });
      return;
    }

    createCommunicationMutation.mutate({
      ...formData,
      parent_email: formData.parent_email || student?.parent_email || ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading communications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with New Communication Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Parent Communications
          </h3>
          <p className="text-gray-600">Track communications with parents and guardians</p>
        </div>
        
        <Dialog open={showNewCommunication} onOpenChange={setShowNewCommunication}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Log Communication
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Parent Communication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Communication Type</Label>
                <Select value={formData.communication_type} onValueChange={(value) => setFormData({ ...formData, communication_type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="meeting">In-Person Meeting</SelectItem>
                    <SelectItem value="note">Note Home</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email || student?.parent_email || ''}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  placeholder="parent@email.com"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter subject"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter communication content..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateCommunication}
                  disabled={createCommunicationMutation.isPending}
                  className="flex-1"
                >
                  {createCommunicationMutation.isPending ? 'Logging...' : 'Log Communication'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewCommunication(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Parent Contact Info */}
      {student && (student.parent_email || student.parent_name) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parent/Guardian Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {student.parent_name && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Name:</span>
                  <span>{student.parent_name}</span>
                </div>
              )}
              {student.parent_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{student.parent_email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communications List */}
      {communications.length > 0 ? (
        <div className="grid gap-4">
          {communications.map((communication) => (
            <Card key={communication.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{communication.subject}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(communication.created_at).toLocaleDateString()}
                      </span>
                      <span className="capitalize">{communication.communication_type}</span>
                      {communication.parent_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {communication.parent_email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {communication.email_status && (
                      <Badge className={getStatusColor(communication.email_status)} variant="secondary">
                        {communication.email_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{communication.content}</p>
                {communication.sent_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    Sent: {new Date(communication.sent_at).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Communications Yet</h3>
            <p className="text-gray-600 mb-4">
              No parent communications have been logged for this student.
            </p>
            <Button onClick={() => setShowNewCommunication(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Log First Communication
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentCommunicationTab;
