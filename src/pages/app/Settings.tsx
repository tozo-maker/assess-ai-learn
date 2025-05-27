
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Lock, 
  Globe, 
  Download, 
  Trash2,
  Settings as SettingsIcon
} from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your application preferences and account settings</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600">Receive updates about student progress</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-reports" className="text-base font-medium">
                    Weekly Reports
                  </Label>
                  <p className="text-sm text-gray-600">Get weekly summary of class performance</p>
                </div>
                <Switch id="weekly-reports" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-insights" className="text-base font-medium">
                    AI Insights
                  </Label>
                  <p className="text-sm text-gray-600">Notifications for new AI-generated insights</p>
                </div>
                <Switch id="ai-insights" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700">
                Update Password
              </Button>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Dark Mode</Label>
                  <p className="text-sm text-gray-600">Switch to dark theme</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-save Assessments</Label>
                  <p className="text-sm text-gray-600">Automatically save assessment data</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Analytics Tracking</Label>
                  <p className="text-sm text-gray-600">Help improve the app with anonymous usage data</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Export Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download your student data and assessments
                </p>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export All Data
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-2 text-red-600">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
