
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Download, User, TrendingUp, Target } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const StudentReport = () => {
  const { id } = useParams();

  // Sample student data
  const student = {
    name: "Sarah Johnson",
    grade: "5th Grade",
    period: "March 2024",
    overallProgress: 82
  };

  const subjects = [
    { name: "Mathematics", current: 85, previous: 78, trend: "up" },
    { name: "Reading", current: 79, previous: 82, trend: "down" },
    { name: "Science", current: 88, previous: 85, trend: "up" },
    { name: "Writing", current: 76, previous: 73, trend: "up" }
  ];

  const goals = [
    { title: "Improve Math Fluency", progress: 75, status: "on-track" },
    { title: "Reading Comprehension", progress: 60, status: "needs-attention" },
    { title: "Science Vocabulary", progress: 90, status: "ahead" }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? "↗" : trend === "down" ? "↘" : "→";
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Report</h1>
            <p className="text-gray-600 mt-2">{student.name} - {student.period}</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Student Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Student Information</h3>
              <p className="text-gray-600">Name: {student.name}</p>
              <p className="text-gray-600">Grade: {student.grade}</p>
              <p className="text-gray-600">Report Period: {student.period}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Overall Progress</h3>
              <div className="space-y-2">
                <Progress value={student.overallProgress} className="h-3" />
                <p className="text-sm text-gray-600">{student.overallProgress}% overall performance</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Key Insights</h3>
              <p className="text-sm text-gray-600">
                Strong performance in Science and Math. Focus needed on Reading comprehension skills.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Subject Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{subject.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{subject.current}%</span>
                      <span className={`text-sm ${getTrendColor(subject.trend)}`}>
                        {getTrendIcon(subject.trend)} {Math.abs(subject.current - subject.previous)}
                      </span>
                    </div>
                  </div>
                  <Progress value={subject.current} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    goal.status === 'on-track' ? 'bg-green-100 text-green-800' :
                    goal.status === 'needs-attention' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {goal.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="space-y-2">
                  <Progress value={goal.progress} className="h-2" />
                  <p className="text-sm text-gray-600">{goal.progress}% complete</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Math Fluency:</strong> Continue current practice routine. Student shows consistent improvement in multiplication facts.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Reading Comprehension:</strong> Focus on inference skills and vocabulary development. Consider additional guided reading sessions.
              </p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Science:</strong> Student excels in hands-on activities. Encourage participation in science fair projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentReport;
