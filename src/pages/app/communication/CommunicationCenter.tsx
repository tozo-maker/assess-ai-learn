
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  MessageCircle, 
  Bell, 
  Users, 
  Send,
  Calendar,
  FileText
} from 'lucide-react';

const CommunicationCenter = () => {
  const recentMessages = [
    {
      id: 1,
      recipient: "Sarah Johnson's Parents",
      subject: "Progress Update - Math Improvement",
      date: "2024-03-28",
      status: "sent"
    },
    {
      id: 2,
      recipient: "Mike Chen's Parents", 
      subject: "Reading Support Recommendation",
      date: "2024-03-27",
      status: "draft"
    },
    {
      id: 3,
      recipient: "All Parents - 5th Grade",
      subject: "Upcoming Science Fair",
      date: "2024-03-25",
      status: "sent"
    }
  ];

  const templates = [
    { name: "Progress Update", description: "General student progress communication" },
    { name: "Behavior Concern", description: "Address behavioral issues with parents" },
    { name: "Achievement Celebration", description: "Share positive achievements" },
    { name: "Meeting Request", description: "Request parent-teacher conference" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
        <p className="text-gray-600 mt-2">Manage parent communications and notifications</p>
      </div>

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Messages</CardTitle>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4 mr-2" />
                    Compose
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentMessages.map((message) => (
                      <div key={message.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{message.recipient}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            message.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {message.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{message.subject}</p>
                        <p className="text-xs text-gray-500">{message.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Progress Update
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Conference
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Send Class Update
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Messages Sent</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="font-medium">4.2 hours</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Communication Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {templates.map((template, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Use Template</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Automatic Notifications</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Send automated updates when certain conditions are met
                  </p>
                  <Button variant="outline">Configure Rules</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Weekly Reports</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Send weekly progress summaries to parents
                  </p>
                  <Button variant="outline">Setup Schedule</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Communication Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">All Parents - 5th Grade</h3>
                      <p className="text-sm text-gray-600">24 members</p>
                    </div>
                    <Button variant="outline">Send Message</Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Math Support Group</h3>
                      <p className="text-sm text-gray-600">8 members</p>
                    </div>
                    <Button variant="outline">Send Message</Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Advanced Learners</h3>
                      <p className="text-sm text-gray-600">6 members</p>
                    </div>
                    <Button variant="outline">Send Message</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationCenter;
