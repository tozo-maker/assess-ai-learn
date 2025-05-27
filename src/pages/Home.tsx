
import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BarChart3, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Assessment Data into
            <span className="text-blue-600 block">Educational Insights</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            LearnSpark AI helps teachers understand not just what students scored, 
            but WHY they succeeded or struggled and HOW to help them improve.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/auth/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/demo">View Demo</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Educators
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to track, analyze, and improve student performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Smart Student Management
            </h3>
            <p className="text-gray-600">
              Easily manage student profiles, track learning preferences, and organize class rosters with bulk import capabilities.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              AI-Powered Analytics
            </h3>
            <p className="text-gray-600">
              Get comprehensive insights into student performance patterns, learning gaps, and personalized recommendations.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Goal Tracking
            </h3>
            <p className="text-gray-600">
              Set personalized learning goals, track progress over time, and celebrate student achievements.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Teaching?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of educators using LearnSpark AI to improve student outcomes.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth/signup">Start Your Free Trial</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
