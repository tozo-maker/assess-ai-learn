import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Send, 
  Plus, 
  Settings, 
  Mail, 
  MessageSquare, 
  Bell, 
  Users, 
  FileText,
  Zap,
  BarChart3,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  enhancedCommunicationsService, 
  EmailTemplate, 
  AutomationRule, 
  NotificationPreference 
} from '@/services/enhanced-communications';
import { format } from 'date-fns';

export const EnhancedCommunicationCenter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [notifications, setNotifications] = useState<NotificationPreference[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
    name: '',
    type: 'general',
    subject: '',
    content: '',
    variables: [],
    isDefault: false
  });

  const [newAutomation, setNewAutomation] = useState<Partial<AutomationRule>>({
    name: '',
    trigger: 'grade_drop',
    conditions: {},
    templateId: '',
    isActive: true
  });

  useEffect(() => {
    if (user?.id) {
      loadData();
      initializeRealtimeUpdates();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, automationsData, analyticsData] = await Promise.all([
        enhancedCommunicationsService.getEmailTemplates(user!.id),
        enhancedCommunicationsService.getEmailAutomations(user!.id),
        enhancedCommunicationsService.getCommunicationAnalytics(user!.id)
      ]);

      setTemplates(templatesData);
      setAutomations(automationsData);
      setAnalytics(analyticsData);

      const notificationPrefs = await enhancedCommunicationsService.getNotificationPreferences(user!.id);
      setNotifications(notificationPrefs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load communication data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeRealtimeUpdates = async () => {
    try {
      await enhancedCommunicationsService.initializeRealtimeNotifications(user!.id);
      
      // Listen for communication updates
      document.addEventListener('communication-updated', handleCommunicationUpdate);
      document.addEventListener('new-notification', handleNewNotification);

      return () => {
        document.removeEventListener('communication-updated', handleCommunicationUpdate);
        document.removeEventListener('new-notification', handleNewNotification);
      };
    } catch (error) {
      console.error('Failed to initialize realtime updates:', error);
    }
  };

  const handleCommunicationUpdate = (event: any) => {
    const communication = event.detail;
    toast({
      title: "Communication Updated",
      description: `Email ${communication.email_status} for ${communication.subject}`,
    });
  };

  const handleNewNotification = (event: any) => {
    const notification = event.detail;
    toast({
      title: notification.title,
      description: notification.message,
    });
  };

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const template = await enhancedCommunicationsService.createEmailTemplate(
        user!.id,
        newTemplate as Omit<EmailTemplate, 'id'>
      );
      
      setTemplates(prev => [...prev, template]);
      setNewTemplate({
        name: '',
        type: 'general',
        subject: '',
        content: '',
        variables: [],
        isDefault: false
      });

      toast({
        title: "Success",
        description: "Email template created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create email template",
        variant: "destructive"
      });
    }
  };

  const createAutomation = async () => {
    if (!newAutomation.name || !newAutomation.templateId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const automation = await enhancedCommunicationsService.createEmailAutomation(
        user!.id,
        newAutomation as Omit<AutomationRule, 'id'>
      );
      
      setAutomations(prev => [...prev, automation]);
      setNewAutomation({
        name: '',
        trigger: 'grade_drop',
        conditions: {},
        templateId: '',
        isActive: true
      });

      toast({
        title: "Success",
        description: "Email automation created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create email automation",
        variant: "destructive"
      });
    }
  };

  const updateNotificationPreferences = async (updates: Partial<NotificationPreference>) => {
    try {
      // Convert partial update to full notification preferences array
      const updatedPrefs = notifications.map(pref => 
        pref.id === updates.id ? { ...pref, ...updates } : pref
      );
      await enhancedCommunicationsService.updateNotificationPreferences(user!.id, updatedPrefs);
      setNotifications(updatedPrefs);
      
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Communication Center</h2>
          <p className="text-muted-foreground">Manage templates, automations, and notifications</p>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Communications</p>
                <p className="text-2xl font-bold">{analytics?.totalCommunications || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{analytics?.responseRate?.toFixed(1) || 0}%</p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Automations</p>
                <p className="text-2xl font-bold">{automations.filter(a => a.isActive).length}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Templates</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template Name</Label>
                      <Input
                        value={newTemplate.name || ''}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Progress Report Template"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newTemplate.type}
                        onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="progress_report">Progress Report</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="achievement">Achievement</SelectItem>
                          <SelectItem value="concern">Concern</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input
                      value={newTemplate.subject || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="{{student_name}} Progress Update"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Content</Label>
                    <Textarea
                      value={newTemplate.content || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Dear {{parent_name}},&#10;&#10;I wanted to update you on {{student_name}}'s progress..."
                      rows={8}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newTemplate.isDefault || false}
                      onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, isDefault: checked }))}
                    />
                    <Label>Set as default template</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={createTemplate}>Create Template</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.isDefault ? "default" : "secondary"}>
                        {template.type.replace('_', ' ')}
                      </Badge>
                      {template.isDefault && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.content}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {template.variables.map((variable, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Automations</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Automation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Automation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Automation Name</Label>
                    <Input
                      value={newAutomation.name || ''}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Grade Drop Alert"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Trigger</Label>
                      <Select
                        value={newAutomation.trigger}
                        onValueChange={(value) => setNewAutomation(prev => ({ ...prev, trigger: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grade_drop">Grade Drop</SelectItem>
                          <SelectItem value="achievement">Achievement</SelectItem>
                          <SelectItem value="absence">Absence</SelectItem>
                          <SelectItem value="improvement">Improvement</SelectItem>
                          <SelectItem value="schedule">Schedule</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select
                        value={newAutomation.templateId}
                        onValueChange={(value) => setNewAutomation(prev => ({ ...prev, templateId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
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
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newAutomation.isActive || false}
                      onCheckedChange={(checked) => setNewAutomation(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label>Enable automation</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={createAutomation}>Create Automation</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {automations.map((automation) => (
              <Card key={automation.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{automation.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Triggers on: {automation.trigger.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={automation.isActive ? "default" : "secondary"}>
                        {automation.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {automation.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {automation.lastTriggered ? (
                        <span>Last triggered: {format(new Date(automation.lastTriggered), 'MMM dd, yyyy')}</span>
                      ) : (
                        <span>Never triggered</span>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {notifications.length > 0 ? (
                <>
                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Methods</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={notifications[0]?.emailEnabled || false}
                          onCheckedChange={(checked) => updateNotificationPreferences({ 
                            id: notifications[0]?.id || '',
                            emailEnabled: checked 
                          })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                        </div>
                        <Switch
                          checked={notifications[0]?.pushEnabled || false}
                          onCheckedChange={(checked) => updateNotificationPreferences({ 
                            id: notifications[0]?.id || '',
                            pushEnabled: checked 
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Frequency</h4>
                    <Select
                      value={notifications[0]?.frequency || 'immediate'}
                      onValueChange={(value) => updateNotificationPreferences({ 
                        id: notifications[0]?.id || '',
                        frequency: value as any 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Quiet Hours</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={notifications[0]?.quietHours?.start || '22:00'}
                          onChange={(e) => updateNotificationPreferences({
                            id: notifications[0]?.id || '',
                            quietHours: { 
                              ...notifications[0]?.quietHours, 
                              start: e.target.value 
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={notifications[0]?.quietHours?.end || '08:00'}
                          onChange={(e) => updateNotificationPreferences({
                            id: notifications[0]?.id || '',
                            quietHours: { 
                              ...notifications[0]?.quietHours, 
                              end: e.target.value 
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notification preferences configured</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.byType && Object.entries(analytics.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Parents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.mostActiveParents?.map((parent: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="truncate">{parent.email}</span>
                      <Badge variant="outline">{parent.count} messages</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};