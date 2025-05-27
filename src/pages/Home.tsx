
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Brain, Users, TrendingUp } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Insights",
      description: "Transform assessment data into actionable insights with advanced AI analysis"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: "Smart Analytics",
      description: "Track student progress and identify learning patterns automatically"
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Student Management",
      description: "Easily manage your students and their learning journeys"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Progress Tracking",
      description: "Monitor growth and celebrate achievements with detailed reports"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Assessment Data into 
              <span className="text-blue-600"> Educational Insights</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              LearnSpark AI helps teachers understand not just what students scored, 
              but WHY they succeeded or struggled and HOW to help them improve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Understand Your Students
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From simple data input to comprehensive insights, LearnSpark AI transforms how you understand student learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of educators using AI to better understand their students.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
