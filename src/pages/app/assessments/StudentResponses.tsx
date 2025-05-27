
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calendar, BarChart3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const StudentResponses = () => {
  const { id } = useParams();

  // Sample data
  const assessment = {
    title: "Unit 3 Math Assessment",
    date: "2024-03-15",
    totalQuestions: 20
  };

  const studentResponses = [
    {
      id: 1,
      name: "Sarah Johnson",
      score: 18,
      percentage: 90,
      completedAt: "2024-03-15 10:30 AM",
      timeSpent: "45 minutes"
    },
    {
      id: 2,
      name: "Mike Chen",
      score: 14,
      percentage: 70,
      completedAt: "2024-03-15 10:45 AM", 
      timeSpent: "52 minutes"
    },
    {
      id: 3,
      name: "Emma Davis",
      score: 19,
      percentage: 95,
      completedAt: "2024-03-15 10:25 AM",
      timeSpent: "38 minutes"
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      score: 16,
      percentage: 80,
      completedAt: "2024-03-15 11:00 AM",
      timeSpent: "48 minutes"
    }
  ];

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-100";
    if (percentage >= 80) return "text-blue-600 bg-blue-100";
    if (percentage >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const classAverage = Math.round(
    studentResponses.reduce((sum, student) => sum + student.percentage, 0) / studentResponses.length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/app/assessments/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Responses</h1>
          <p className="text-gray-600 mt-2">{assessment.title}</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{studentResponses.length}</p>
                <p className="text-sm text-gray-600">Students Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{classAverage}%</p>
                <p className="text-sm text-gray-600">Class Average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">45</p>
                <p className="text-sm text-gray-600">Avg Time (min)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">!</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">1</p>
                <p className="text-sm text-gray-600">Needs Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentResponses.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">
                      Completed: {student.completedAt} • Time: {student.timeSpent}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="font-medium">{student.score}/{assessment.totalQuestions}</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(student.percentage)}`}>
                    {student.percentage}%
                  </span>
                  
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Performance Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>90-100% (Excellent)</span>
                  <span>2 students</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>80-89% (Good)</span>
                  <span>1 student</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>70-79% (Satisfactory)</span>
                  <span>1 student</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Below 70% (Needs Support)</span>
                  <span>0 students</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Key Insights</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Strong overall performance with 81% class average</p>
                <p>• All students met minimum proficiency threshold</p>
                <p>• Emma Davis and Sarah Johnson showing excellence</p>
                <p>• Consider review of concepts for Mike Chen</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentResponses;
