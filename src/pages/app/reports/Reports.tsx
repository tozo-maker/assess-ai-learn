
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Users, BarChart3, Calendar, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reports = () => {
  const recentReports = [
    {
      id: 1,
      title: "Class Performance Summary - March 2024",
      type: "Class Report",
      date: "2024-03-28",
      students: 24,
      status: "completed"
    },
    {
      id: 2,
      title: "Sarah Johnson - Individual Progress",
      type: "Student Report", 
      date: "2024-03-25",
      students: 1,
      status: "completed"
    },
    {
      id: 3,
      title: "Math Assessment Analysis",
      type: "Assessment Report",
      date: "2024-03-22",
      students: 24,
      status: "completed"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and manage student progress reports</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/app/reports/student/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Student Report</h3>
                  <p className="text-sm text-gray-600">Individual progress report</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/reports/class">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Class Report</h3>
                  <p className="text-sm text-gray-600">Classroom overview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Custom Report</h3>
                <p className="text-sm text-gray-600">Date range & filters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">{report.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.students} student{report.students !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-900 mb-2">Weekly Progress</h3>
              <p className="text-sm text-gray-600 mb-3">Student progress over the past week</p>
              <Button variant="outline" size="sm">Use Template</Button>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-900 mb-2">Parent Conference</h3>
              <p className="text-sm text-gray-600 mb-3">Comprehensive parent meeting report</p>
              <Button variant="outline" size="sm">Use Template</Button>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-900 mb-2">Assessment Summary</h3>
              <p className="text-sm text-gray-600 mb-3">Analysis of recent assessments</p>
              <Button variant="outline" size="sm">Use Template</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
