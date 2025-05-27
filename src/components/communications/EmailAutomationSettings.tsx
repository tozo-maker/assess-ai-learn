
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Settings, Clock, Mail, AlertTriangle } from 'lucide-react';
import { automatedEmailService, AutomationSettings } from '@/services/automated-email-service';

interface EmailAutomationSettingsProps {
  teacherId: string;
}

const EmailAutomationSettings: React.FC<EmailAutomationSettingsProps> = ({ teacherId }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AutomationSettings>({
    weekly_progress: false,
    achievement_notifications: true,
    concern_alerts: true,
    send_day: 'friday',
    send_time: '15:00',
    quiet_hours_start: '20:00',
    quiet_hours_end: '08:00',
    digest_mode: false,
    teacher_id: teacherId
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [teacherId]);

  const loadSettings = async () => {
    try {
      const data = await automatedEmailService.getAutomationSettings(teacherId);
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
      toast({
        title: 'Error loading settings',
        description: 'Failed to load email automation settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await automatedEmailService.updateAutomationSettings(settings);
      toast({
        title: 'Settings saved',
        description: 'Email automation settings have been updated successfully'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error saving settings',
        description: 'Failed to update email automation settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestWeeklyEmails = async () => {
    try {
      await automatedEmailService.scheduleWeeklyProgressEmails(teacherId);
      toast({
        title: 'Test emails scheduled',
        description: 'Weekly progress emails have been scheduled for testing'
      });
    } catch (error) {
      toast({
        title: 'Error scheduling test emails',
        description: 'Failed to schedule test emails',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Loading automation settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Automated Email Types</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weekly-progress">Weekly Progress Updates</Label>
                <p className="text-sm text-gray-600">
                  Send weekly summaries of student progress to parents
                </p>
              </div>
              <Switch
                id="weekly-progress"
                checked={settings.weekly_progress}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, weekly_progress: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="achievements">Achievement Notifications</Label>
                <p className="text-sm text-gray-600">
                  Instant alerts for goals, high scores, and skill mastery
                </p>
              </div>
              <Switch
                id="achievements"
                checked={settings.achievement_notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, achievement_notifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="concerns">Concern Alerts</Label>
                <p className="text-sm text-gray-600">
                  Notifications for low performance and issues
                </p>
              </div>
              <Switch
                id="concerns"
                checked={settings.concern_alerts}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, concern_alerts: checked }))
                }
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduling
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="send-day">Weekly Email Day</Label>
                <Select 
                  value={settings.send_day} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, send_day: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="send-time">Send Time</Label>
                <Input
                  id="send-time"
                  type="time"
                  value={settings.send_time}
                  onChange={(e) => setSettings(prev => ({ ...prev, send_time: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quiet Hours</h3>
            <p className="text-sm text-gray-600">
              Emails won't be sent during these hours and will be scheduled for later
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Start Time</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={settings.quiet_hours_start}
                  onChange={(e) => setSettings(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiet-end">End Time</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={settings.quiet_hours_end}
                  onChange={(e) => setSettings(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Digest Mode */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Batching
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="digest-mode">Digest Mode</Label>
                <p className="text-sm text-gray-600">
                  Combine multiple updates into weekly digest emails
                </p>
              </div>
              <Switch
                id="digest-mode"
                checked={settings.digest_mode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, digest_mode: checked }))
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            
            {settings.weekly_progress && (
              <Button variant="outline" onClick={handleTestWeeklyEmails}>
                Test Weekly Emails
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Automation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Weekly Progress:</strong> {settings.weekly_progress ? `Every ${settings.send_day} at ${settings.send_time}` : 'Disabled'}
            </p>
            <p>
              <strong>Achievements:</strong> {settings.achievement_notifications ? 'Instant notifications' : 'Disabled'}
            </p>
            <p>
              <strong>Concerns:</strong> {settings.concern_alerts ? 'Immediate alerts (respect quiet hours)' : 'Disabled'}
            </p>
            <p>
              <strong>Quiet Hours:</strong> {settings.quiet_hours_start} - {settings.quiet_hours_end}
            </p>
            <p>
              <strong>Digest Mode:</strong> {settings.digest_mode ? 'Enabled - emails will be batched' : 'Disabled - emails sent individually'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAutomationSettings;
