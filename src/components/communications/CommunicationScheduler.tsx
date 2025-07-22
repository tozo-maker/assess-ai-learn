
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Mail, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduledCommunication {
  id: string;
  name: string;
  template_id: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  trigger: 'date' | 'score_drop' | 'milestone' | 'custom';
  conditions: Record<string, any>;
  recipients: string[];
  next_send: string;
  is_active: boolean;
}

interface CommunicationSchedulerProps {
  onSchedule: (schedule: Omit<ScheduledCommunication, 'id'>) => void;
  templates: Array<{ id: string; name: string; template_type: string }>;
  students: Array<{ id: string; first_name: string; last_name: string }>;
}

const CommunicationScheduler: React.FC<CommunicationSchedulerProps> = ({
  onSchedule,
  templates,
  students
}) => {
  const [scheduleData, setScheduleData] = useState({
    name: '',
    template_id: '',
    frequency: 'weekly' as const,
    trigger: 'date' as const,
    conditions: {},
    recipients: [] as string[],
    next_send: '',
    is_active: true
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!scheduleData.name || !scheduleData.template_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    onSchedule(scheduleData);
    
    // Reset form
    setScheduleData({
      name: '',
      template_id: '',
      frequency: 'weekly',
      trigger: 'date',
      conditions: {},
      recipients: [],
      next_send: '',
      is_active: true
    });

    toast({
      title: 'Schedule Created',
      description: 'Communication schedule has been set up successfully'
    });
  };

  const addRecipient = (studentId: string) => {
    if (!scheduleData.recipients.includes(studentId)) {
      setScheduleData(prev => ({
        ...prev,
        recipients: [...prev.recipients, studentId]
      }));
    }
  };

  const removeRecipient = (studentId: string) => {
    setScheduleData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(id => id !== studentId)
    }));
  };

  const selectedStudents = students.filter(s => 
    scheduleData.recipients.includes(s.id)
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Schedule Communication</h2>
        <p className="text-gray-600">
          Set up automated email communications based on triggers and schedules
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              value={scheduleData.name}
              onChange={(e) => setScheduleData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Weekly Progress Reports"
            />
          </div>

          <div>
            <Label htmlFor="template">Email Template</Label>
            <Select 
              value={scheduleData.template_id}
              onValueChange={(value) => setScheduleData(prev => ({ ...prev, template_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={scheduleData.frequency}
                onValueChange={(value: any) => setScheduleData(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trigger">Trigger</Label>
              <Select 
                value={scheduleData.trigger}
                onValueChange={(value: any) => setScheduleData(prev => ({ ...prev, trigger: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date/Time</SelectItem>
                  <SelectItem value="score_drop">Score Drop</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="custom">Custom Condition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {scheduleData.trigger === 'date' && (
            <div>
              <Label htmlFor="next_send">First Send Date</Label>
              <Input
                id="next_send"
                type="datetime-local"
                value={scheduleData.next_send}
                onChange={(e) => setScheduleData(prev => ({ ...prev, next_send: e.target.value }))}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={scheduleData.is_active}
              onCheckedChange={(checked) => setScheduleData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Recipients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Add Students</Label>
            <Select onValueChange={addRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select students to add" />
              </SelectTrigger>
              <SelectContent>
                {students
                  .filter(s => !scheduleData.recipients.includes(s.id))
                  .map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudents.length > 0 && (
            <div>
              <Label>Selected Recipients ({selectedStudents.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedStudents.map((student) => (
                  <Badge 
                    key={student.id} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {student.first_name} {student.last_name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      onClick={() => removeRecipient(student.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSubmit}>
          <Plus className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </div>
    </div>
  );
};

export default CommunicationScheduler;
