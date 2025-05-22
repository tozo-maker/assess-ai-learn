
import React from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Play, BarChart3, Users, Lightbulb } from 'lucide-react';

const Demo = () => {
  return (
    <PublicLayout>
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See LearnSpark AI in Action
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how teachers transform assessment data into actionable insights that help every student succeed.
            </p>
          </div>

          {/* Demo Video Placeholder */}
          <div className="bg-gray-900 rounded-lg aspect-video max-w-4xl mx-auto mb-16 flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">Interactive Demo</h3>
              <p className="text-gray-300">Coming Soon</p>
            </div>
          </div>

          {/* Demo Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Assessment Analysis</h3>
                <p className="text-gray-600">
                  See how AI identifies patterns and learning gaps from assessment data
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Student Insights</h3>
                <p className="text-gray-600">
                  Explore individual and class-wide analytics that reveal learning trends
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <Lightbulb className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Recommendations</h3>
                <p className="text-gray-600">
                  Get personalized teaching strategies and intervention suggestions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Try It Yourself?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start your free account and see the difference AI insights can make
            </p>
            <Link to="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Demo;
