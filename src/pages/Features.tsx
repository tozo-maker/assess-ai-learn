
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  Users, 
  FileText, 
  Target, 
  MessageCircle,
  Zap,
  Shield
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Brain className="h-12 w-12 text-blue-600" />,
      title: "AI-Powered Analysis",
      description: "Advanced AI analyzes assessment patterns and identifies learning gaps automatically.",
      benefits: ["Pattern recognition", "Mistake categorization", "Learning style adaptation"]
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-green-600" />,
      title: "Smart Analytics Dashboard",
      description: "Visual insights that make complex data easy to understand and act upon.",
      benefits: ["Real-time progress tracking", "Performance trends", "Class comparisons"]
    },
    {
      icon: <Users className="h-12 w-12 text-purple-600" />,
      title: "Student Management",
      description: "Organize and track all your students with detailed learning profiles.",
      benefits: ["Learning style tracking", "Individual progress", "Bulk import tools"]
    },
    {
      icon: <FileText className="h-12 w-12 text-orange-600" />,
      title: "Assessment Tools",
      description: "Streamlined assessment input with intelligent analysis and recommendations.",
      benefits: ["Quick data entry", "Multiple assessment types", "Automated insights"]
    },
    {
      icon: <Target className="h-12 w-12 text-red-600" />,
      title: "Goal Setting & Tracking",
      description: "Set personalized learning goals and track progress over time.",
      benefits: ["AI-suggested goals", "Milestone tracking", "Achievement celebrations"]
    },
    {
      icon: <MessageCircle className="h-12 w-12 text-indigo-600" />,
      title: "Parent Communication",
      description: "Generate professional reports and communication templates.",
      benefits: ["Automated reports", "Progress summaries", "Intervention recommendations"]
    }
  ];

  const additionalFeatures = [
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Lightning Fast",
      description: "Get insights in seconds, not hours"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Secure & Private",
      description: "Student data protected with enterprise-grade security"
    }
  ];

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for Modern Educators
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to transform assessment data into actionable insights that help every student succeed.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-gray-500 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {additionalFeatures.map((feature, index) => (
            <Card key={index} className="flex items-center p-6">
              <div className="mr-4">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your free trial and see how LearnSpark AI can transform your teaching.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
