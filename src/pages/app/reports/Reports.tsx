
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import PageTemplate from '@/components/ui/page-template';
import { Button } from '@/components/ui/button';
import ComprehensiveAnalyticsDashboard from '@/components/analytics/ComprehensiveAnalyticsDashboard';
import { BarChart3, FileText, TrendingUp, Users, ArrowRight } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText
} from '@/components/ui/design-system';

const Reports: React.FC = () => {
  const actions = (
    <DSFlexContainer gap="sm">
      <Button asChild>
        <Link to="/app/reports/progress-reports">
          <FileText className="h-4 w-4 mr-2" />
          Generate Progress Reports
        </Link>
      </Button>
      <BarChart3 className="h-5 w-5 text-[#2563eb]" />
    </DSFlexContainer>
  );

  return (
    <PageTemplate
      title="Reports & Analytics"
      description="View comprehensive analytics and generate detailed reports"
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
              <Button asChild size="lg">
                <Link to="/app/reports/progress-reports">
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Progress Reports
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </DSFlexContainer>
            <DSBodyText className="mt-4 text-gray-600">
              Access the comprehensive progress report generation interface with advanced filtering, bulk operations, and customization options.
            </DSBodyText>
          </DSCardContent>
        </DSCard>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics Dashboard
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <ComprehensiveAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid gap-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Performance Insights Coming Soon</h3>
                <p className="text-gray-600">
                  Advanced performance insights and trends will be available here.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default Reports;
