
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Communications: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600 mt-2">Manage parent communications and progress reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Communications Center</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Communications features will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Communications;
