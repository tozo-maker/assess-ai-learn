
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, TestTube, Mail } from 'lucide-react';
import { emailService } from '@/services/email-service';

const EmailSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    senderName: 'LearnSpark AI',
    defaultSubjectPrefix: '[LearnSpark]',
    autoProgressReports: false,
    achievementNotifications: true,
    concernAlerts: true,
    weeklyDigest: false,
    digestDay: 'friday',
    digestTime: '15:00'
  });
  const [emailSignature, setEmailSignature] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const { toast } = useToast();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // In a real app, this would save to the backend
    toast({
      title: 'Settings saved',
      description: 'Email settings have been updated successfully'
    });
  };

  const testEmailDelivery = async () => {
    setIsTestingEmail(true);
    try {
      await emailService.testEmailDelivery();
      toast({
        title: 'Email test successful',
        description: 'Test email sent successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Email test failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sender Name</label>
            <Input
              value={settings.senderName}
              onChange={(e) => handleSettingChange('senderName', e.target.value)}
              placeholder="Your name or school name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Subject Prefix</label>
            <Input
              value={settings.defaultSubjectPrefix}
              onChange={(e) => handleSettingChange('defaultSubjectPrefix', e.target.value)}
              placeholder="[LearnSpark]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Signature</label>
            <Textarea
              value={emailSignature}
              onChange={(e) => setEmailSignature(e.target.value)}
              placeholder="Your email signature..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Automation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Automatic Progress Reports</h4>
              <p className="text-sm text-gray-600">Send weekly progress reports automatically</p>
            </div>
            <Switch
              checked={settings.autoProgressReports}
              onCheckedChange={(checked) => handleSettingChange('autoProgressReports', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Achievement Notifications</h4>
              <p className="text-sm text-gray-600">Notify parents when students achieve goals</p>
            </div>
            <Switch
              checked={settings.achievementNotifications}
              onCheckedChange={(checked) => handleSettingChange('achievementNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Concern Alerts</h4>
              <p className="text-sm text-gray-600">Send alerts when students need attention</p>
            </div>
            <Switch
              checked={settings.concernAlerts}
              onCheckedChange={(checked) => handleSettingChange('concernAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Weekly Digest</h4>
              <p className="text-sm text-gray-600">Combine multiple notifications into weekly digest</p>
            </div>
            <Switch
              checked={settings.weeklyDigest}
              onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
            />
          </div>

          {settings.weeklyDigest && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium mb-2">Digest Day</label>
                <Select 
                  value={settings.digestDay} 
                  onValueChange={(value) => handleSettingChange('digestDay', value)}
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
              <div>
                <label className="block text-sm font-medium mb-2">Send Time</label>
                <Input
                  type="time"
                  value={settings.digestTime}
                  onChange={(e) => handleSettingChange('digestTime', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={testEmailDelivery}
            disabled={isTestingEmail}
            className="w-full sm:w-auto"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTestingEmail ? 'Testing...' : 'Test Email Delivery'}
          </Button>

          <Button onClick={saveSettings} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSettings;
