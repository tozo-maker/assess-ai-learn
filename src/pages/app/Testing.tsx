
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Testing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Testing</h1>
          <p className="text-gray-600 mt-2">Development and testing utilities</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Testing Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Testing features and development tools will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Testing;
