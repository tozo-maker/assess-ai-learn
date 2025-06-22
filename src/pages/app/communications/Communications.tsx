
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, FileText, Settings, MessageSquare } from 'lucide-react';
import PageTemplate from '@/components/ui/page-template';
import EmailComposer from '@/components/communications/EmailComposer';
import ProgressReports from './ProgressReports';
import CommunicationHistory from '@/components/communications/CommunicationHistory';
import EmailSettings from '@/components/communications/EmailSettings';

const Communications: React.FC = () => {
  const actions = (
    <div className="flex items-center gap-2">
      <Mail className="h-5 w-5 text-blue-600" />
    </div>
  );

  return (
    <PageTemplate
      title="Communications"
      description="Send emails and manage parent communications"
      actions={actions}
    >
      <div className="space-y-8">
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="compose" className="text-base">
              <Mail className="h-4 w-4 mr-2" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-base">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="history" className="text-base">
              <MessageSquare className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-base">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <EmailComposer />
          </TabsContent>

          <TabsContent value="reports">
            <ProgressReports />
          </TabsContent>

          <TabsContent value="history">
            <CommunicationHistory />
          </TabsContent>

          <TabsContent value="settings">
            <EmailSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default Communications;
