
import React from 'react';
import PageShell from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Upload, User, TrendingUp, AlertCircle } from 'lucide-react';

const Students = () => {
  const students = [
    { id: 1, name: "Emma Thompson", grade: "5th", lastAssessment: "2 days ago", performance: "Above Average", needsAttention: false },
    { id: 2, name: "Marcus Johnson", grade: "5th", lastAssessment: "1 day ago", performance: "Below Average", needsAttention: true },
    { id: 3, name: "Sofia Rodriguez", grade: "5th", lastAssessment: "3 days ago", performance: "Average", needsAttention: false },
    { id: 4, name: "Aiden Kim", grade: "5th", lastAssessment: "1 day ago", performance: "Above Average", needsAttention: false },
  ];

  const actions = (
    <>
      <Link to="/students/import">
        <Button variant="outline" className="flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Import Students</span>
        </Button>
      </Link>
      <Link to="/students/add">
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Student</span>
        </Button>
      </Link>
    </>
  );

  return (
    <PageShell 
      title="Students" 
      description="Manage your students and track their progress"
      icon={<Users className="h-6 w-6 text-blue-600" />}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search students..." className="pl-10" />
          </div>
          <Button variant="outline">Filter</Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Need Attention</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Above Average</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Performance</p>
                  <p className="text-2xl font-bold">82%</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {students.map((student) => (
                <Link key={student.id} to={`/students/${student.id}`}>
                  <div className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-blue-600">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.grade} Grade</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Last Assessment</p>
                          <p className="text-sm font-medium">{student.lastAssessment}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Performance</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              student.performance === 'Above Average' ? 'text-green-600' :
                              student.performance === 'Below Average' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {student.performance}
                            </span>
                            {student.needsAttention && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
};

export default Students;
