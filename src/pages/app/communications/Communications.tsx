
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Users, MessageSquare } from 'lucide-react';

const Communications: React.FC = () => {
  const actions = (
    <Mail className="h-5 w-5 text-primary" />
  );

  return (
    <StandardPageLayout 
      title="Communications"
      description="Manage parent communications and progress reports"
      actions={actions}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Progress Reports Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Progress Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Generate comprehensive progress reports for students and share with parents.
            </p>
            <Button asChild className="w-full">
              <Link to="/app/reports/progress-reports">
                Generate Reports
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Email Communications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Send emails to parents, manage templates, and track communication history.
            </p>
            <Button variant="secondary" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Parent Portal Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Parent Portal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Provide parents with secure access to their child's progress and updates.
            </p>
            <Button variant="secondary" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Communication History Card */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Recent Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No communications yet</h3>
              <p className="text-gray-600">
                Your communication history will appear here once you start sending reports and messages.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default Communications;
