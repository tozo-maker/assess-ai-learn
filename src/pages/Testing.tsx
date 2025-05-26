
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube, Database, Brain, Users, ArrowRight, PlayCircle } from 'lucide-react';

const Testing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            LearnSpark AI Testing Suite
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive testing tools and sample data generation to validate and demonstrate 
            all platform capabilities for educational analytics and insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Sample Data Generation */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-blue-900">Comprehensive Sample Data</CardTitle>
                  <CardDescription className="text-blue-700">
                    Generate realistic educational dataset instantly
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                  12 diverse students with varied learning profiles
                </div>
                <div className="flex items-center text-sm">
                  <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                  8 comprehensive assessments across subjects
                </div>
                <div className="flex items-center text-sm">
                  <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                  Realistic responses with error patterns
                </div>
                <div className="flex items-center text-sm">
                  <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                  AI-generated insights and recommendations
                </div>
                <div className="flex items-center text-sm">
                  <PlayCircle className="h-4 w-4 mr-2 text-blue-600" />
                  Learning goals and communication history
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Foundation Testing */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-green-900">Foundation Testing</CardTitle>
                  <CardDescription className="text-green-700">
                    Validate core platform functionality
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <TestTube className="h-4 w-4 mr-2 text-green-600" />
                  Authentication and user management
                </div>
                <div className="flex items-center text-sm">
                  <TestTube className="h-4 w-4 mr-2 text-green-600" />
                  Student and assessment CRUD operations
                </div>
                <div className="flex items-center text-sm">
                  <TestTube className="h-4 w-4 mr-2 text-green-600" />
                  Database relationships and integrity
                </div>
                <div className="flex items-center text-sm">
                  <TestTube className="h-4 w-4 mr-2 text-green-600" />
                  Form validation and error handling
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Integration Testing */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <div className="flex items-center">
                <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-purple-900">AI Integration Testing</CardTitle>
                  <CardDescription className="text-purple-700">
                    Validate AI-powered educational insights
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  Anthropic Claude assessment analysis
                </div>
                <div className="flex items-center text-sm">
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  AI-generated learning recommendations
                </div>
                <div className="flex items-center text-sm">
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  Goal suggestions and insights
                </div>
                <div className="flex items-center text-sm">
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  Error handling and fallbacks
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Testing */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center">
                <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                  <TestTube className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-orange-900">Enhanced Testing</CardTitle>
                  <CardDescription className="text-orange-700">
                    Advanced system validation and performance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <TestTube className="h-4 w-4 mr-2 text-orange-600" />
                  Row-level security (RLS) policies
                </div>
                <div className="flex items-center text-sm">
                  <TestTube className="h-4 w-4 mr-2 text-orange-600" />
                  Search and filter functionality
                </div>
                <div className="flex items-center text-sm">
                  <TestTube className="h-4 w-4 mr-2 text-orange-600" />
                  Performance and concurrent operations
                </div>
                <div className="flex items-center text-sm">
                  <TestTube className="h-4 w-4 mr-2 text-orange-600" />
                  Data integrity and relationships
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Test LearnSpark AI?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Start with comprehensive sample data generation to instantly populate your platform 
                with realistic educational data, then run validation tests to ensure everything works perfectly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/app/testing" className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Generate Sample Data
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                  <Link to="/app/testing" className="flex items-center">
                    <TestTube className="h-5 w-5 mr-2" />
                    Run Tests
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">What You'll Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Data Ecosystem</h3>
              <p className="text-gray-600">
                Realistic students, assessments, responses, and teacher data that showcases 
                real-world usage scenarios and platform capabilities.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">
                Generated analysis, recommendations, and educational insights that demonstrate 
                the platform's artificial intelligence capabilities.
              </p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TestTube className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Validation</h3>
              <p className="text-gray-600">
                Thorough testing suite that validates functionality, performance, security, 
                and data integrity across all platform features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testing;
