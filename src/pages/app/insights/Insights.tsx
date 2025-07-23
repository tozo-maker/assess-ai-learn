
import React from 'react';
import { Link } from 'react-router-dom';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, User, Target, Lightbulb, BarChart3, Users } from 'lucide-react';

const Insights: React.FC = () => {
  const insightSections = [
    {
      title: 'Class Insights',
      description: 'Analyze class-wide performance patterns and trends',
      icon: Users,
      href: '/app/insights/class',
      color: 'text-blue-600'
    },
    {
      title: 'Individual Insights',
      description: 'Deep dive into individual student performance and learning patterns',
      icon: User,
      href: '/app/insights/individual',
      color: 'text-green-600'
    },
    {
      title: 'Skills Insights',
      description: 'Analyze skill mastery patterns and learning progression',
      icon: Target,
      href: '/app/insights/skills',
      color: 'text-purple-600'
    },
    {
      title: 'AI Recommendations',
      description: 'View personalized recommendations for student learning',
      icon: Lightbulb,
      href: '/app/insights/recommendations',
      color: 'text-amber-600'
    }
  ];

  return (
    <StandardPageLayout 
      title="AI Insights"
      description="Transform assessment data into actionable educational insights"
      breadcrumbs={[
        { label: 'Insights' }
      ]}
    >
      <div className="space-y-6">
        {/* Overview */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">AI-Powered Educational Analytics</h2>
              <p className="text-muted-foreground">
                Discover patterns, identify opportunities, and get personalized recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insightSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} to={section.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 ${section.color}`} />
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {section.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Getting Started with AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">1. Complete Assessments</h4>
                <p className="text-muted-foreground">
                  Add assessments and student responses to generate meaningful insights
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">2. Review Analysis</h4>
                <p className="text-muted-foreground">
                  Our AI analyzes patterns and identifies learning opportunities
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">3. Take Action</h4>
                <p className="text-muted-foreground">
                  Implement personalized recommendations to improve student outcomes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
};

export default Insights;
