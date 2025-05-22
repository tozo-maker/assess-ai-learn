
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AddStudent = () => {
  const actions = (
    <Link to="/students">
      <Button variant="outline" className="flex items-center space-x-2">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Students</span>
      </Button>
    </Link>
  );

  return (
    <PageShell 
      title="Add New Student" 
      description="Register a new student to your class"
      icon={<User className="h-6 w-6 text-blue-600" />}
      actions={actions}
    >
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input placeholder="Emma" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input placeholder="Thompson" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID (Optional)
                  </label>
                  <Input placeholder="ST-2024-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="k">Kindergarten</SelectItem>
                      <SelectItem value="1">1st Grade</SelectItem>
                      <SelectItem value="2">2nd Grade</SelectItem>
                      <SelectItem value="3">3rd Grade</SelectItem>
                      <SelectItem value="4">4th Grade</SelectItem>
                      <SelectItem value="5">5th Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Goals (Optional)
                </label>
                <Textarea 
                  placeholder="e.g., Improve reading comprehension, master multiplication tables..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Considerations (Optional)
                </label>
                <Textarea 
                  placeholder="e.g., IEP accommodations, learning preferences..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Link to="/students">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Add Student
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
};

export default AddStudent;
