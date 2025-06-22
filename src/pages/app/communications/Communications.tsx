
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Settings, MessageSquare, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTemplate from '@/components/ui/page-template';
import { Button } from '@/components/ui/button';
import EmailComposer from '@/components/communications/EmailComposer';
import CommunicationHistory from '@/components/communications/CommunicationHistory';
import EmailSettings from '@/components/communications/EmailSettings';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText
} from '@/components/ui/design-system';

const Communications: React.FC = () => {
  const actions = (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline">
        <Link to="/app/reports/progress-reports">
          <FileText className="h-4 w-4 mr-2" />
          Progress Reports
        </Link>
      </Button>
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
        {/* Quick Access Card */}
        <DSCard>
          <DSCardHeader>
            <DSCardTitle>Quick Access</DSCardTitle>
          </DSCardHeader>
          <DSCardContent>
            <DSFlexContainer gap="md" className="flex-wrap">
              <Button asChild>
                <Link to="/app/reports/progress-reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Progress Reports
                </Link>
              </Button>
            </DSFlexContainer>
            <DSBodyText className="mt-4 text-gray-600">
              For comprehensive progress report generation and management, visit the dedicated Reports section.
            </DSBodyText>
          </DSCardContent>
        </DSCard>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="compose" className="text-base">
              <Mail className="h-4 w-4 mr-2" />
              Compose
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
