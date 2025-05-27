
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  Users, 
  Target, 
  FileText, 
  MessageSquare,
  TrendingUp,
  GitCompare,
  ClipboardList,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student profiles with learning preferences, progress tracking, and bulk import capabilities.",
      benefits: ["Individual learning profiles", "Bulk CSV import", "Progress visualization", "Parent communication"]
    },
    {
      icon: ClipboardList,
      title: "Assessment Tracking",
      description: "Structured assessment input with AI-powered analysis and mistake categorization.",
      benefits: ["Multiple assessment types", "Rubric integration", "Time tracking", "Automated scoring"]
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Advanced analytics that identify learning patterns, gaps, and provide actionable recommendations.",
      benefits: ["Pattern recognition", "Learning gap analysis", "Personalized recommendations", "Predictive analytics"]
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Detailed dashboards showing individual and class-wide performance trends over time.",
      benefits: ["Individual progress tracking", "Class performance overview", "Skill mastery analysis", "Growth trajectories"]
    },
    {
      icon: GitCompare,
      title: "Comparative Analysis",
      description: "Compare student performance across assessments, time periods, and peer groups.",
      benefits: ["Cross-assessment comparison", "Historical analysis", "Peer benchmarking", "Trend identification"]
    },
    {
      icon: Target,
      title: "Goal Setting & Tracking",
      description: "Set personalized learning goals and track progress with milestone celebrations.",
      benefits: ["SMART goal creation", "Progress milestones", "Achievement tracking", "Motivation tools"]
    },
    {
      icon: FileText,
      title: "Comprehensive Reports",
      description: "Generate detailed reports for students, parents, and administrators.",
      benefits: ["Student progress reports", "Parent communications", "Admin summaries", "Export capabilities"]
    },
    {
      icon: MessageSquare,
      title: "Communication Tools",
      description: "Streamlined communication with students, parents, and school administration.",
      benefits: ["Automated updates", "Parent notifications", "Progress sharing", "Template library"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="text-blue-600 block">Enhance Student Learning</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover how LearnSpark AI's comprehensive feature set transforms assessment data 
              into actionable insights that drive student success.
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/auth/signup">Try All Features Free</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Integration Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Seamless Integration
            </h2>
            <p className="text-lg text-gray-600">
              LearnSpark AI works with your existing workflow and tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Data Import
              </h3>
              <p className="text-gray-600">
                Import student rosters and assessment data from CSV files or your existing systems.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Analytics
              </h3>
              <p className="text-gray-600">
                Get instant insights as you input assessment data with AI-powered analysis.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Flexible Configuration
              </h3>
              <p className="text-gray-600">
                Customize the platform to match your grading system, subjects, and workflow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Experience the Difference
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join educators who are already using LearnSpark AI to transform their teaching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/auth/signup">Start Free Trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link to="/demo">Schedule Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
