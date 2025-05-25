
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Calendar } from 'lucide-react';

const ClassReportsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class-Wide Reports</CardTitle>
        <p className="text-sm text-gray-600">
          Generate comprehensive reports for the entire class or specific grade levels
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Class Performance Summary</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span>Standards Mastery Report</span>
            </Button>
          </div>
          <div className="text-center text-gray-500 py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Class-wide reporting features coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassReportsTab;
