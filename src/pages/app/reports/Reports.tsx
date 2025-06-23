
import React from 'react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ComprehensiveAnalyticsDashboard from '@/components/analytics/ComprehensiveAnalyticsDashboard';
import { BarChart3, FileText, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Reports: React.FC = () => {
  const actions = (
    <div className="flex items-center gap-3">
      <Button asChild>
        <Link to="/app/reports/progress-reports">
          <FileText className="h-4 w-4 mr-2" />
          Generate Progress Reports
        </Link>
      </Button>
      <BarChart3 className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <StandardPageLayout 
      title="Reports & Analytics"
      actions={actions}
    >
      <div className="space-y-8">
        {/* Quick Access Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button asChild size="lg">
                <Link to="/app/reports/progress-reports">
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Progress Reports
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-gray-600">
              Access the comprehensive progress report generation interface with advanced filtering, bulk operations, and customization options.
            </p>
          </CardContent>
        </Card>

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
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Performance Insights Coming Soon</h3>
              <p className="text-gray-600">
                Advanced performance insights and trends will be available here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StandardPageLayout>
  );
};

export default Reports;
