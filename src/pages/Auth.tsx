
import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Auth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">LearnSpark AI</h1>
          <p className="text-gray-600 mt-2">Transform your teaching with AI-powered insights</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Choose how you'd like to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link to="/auth/signup">Create New Account</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link to="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Want to see it in action first?{' '}
            <Link to="/demo" className="text-blue-600 hover:underline">
              View Demo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
