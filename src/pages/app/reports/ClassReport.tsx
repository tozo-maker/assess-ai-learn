
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Download, Users, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClassReport = () => {
  const classData = {
    name: "5th Grade Class A",
    period: "March 2024",
    totalStudents: 24,
    averagePerformance: 78
  };

  const subjectAverages = [
    { name: "Mathematics", average: 81, trend: "up", change: 3 },
    { name: "Reading", average: 75, trend: "down", change: -2 },
    { name: "Science", average: 83, trend: "up", change: 5 },
    { name: "Writing", average: 72, trend: "stable", change: 0 }
  ];

  const performanceDistribution = [
    { range: "90-100%", count: 4, percentage: 17 },
    { range: "80-89%", count: 8, percentage: 33 },
    { range: "70-79%", count: 7, percentage: 29 },
    { range: "60-69%", count: 3, percentage: 13 },
    { range: "Below 60%", count: 2, percentage: 8 }
  ];

  const topPerformers = [
    { name: "Emma Davis", average: 94 },
    { name: "Alex Rodriguez", average: 91 },
    { name: "Maya Patel", average: 89 }
  ];

  const needsAttention = [
    { name: "Jake Wilson", average: 58, issue: "Consistent struggles across subjects" },
    { name: "Lisa Chen", average: 62, issue: "Reading comprehension challenges" }
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
            <h1 className="text-3xl font-bold text-gray-900">Class Report</h1>
            <p className="text-gray-600 mt-2">{classData.name} - {classData.period}</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Class Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{classData.totalStudents}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{classData.averagePerformance}%</p>
                <p className="text-sm text-gray-600">Class Average</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">67%</p>
                <p className="text-sm text-gray-600">Meeting Standards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">2</p>
                <p className="text-sm text-gray-600">Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectAverages.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{subject.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{subject.average}%</span>
                      <span className={`text-sm ${getTrendColor(subject.trend)}`}>
                        {getTrendIcon(subject.trend)} {Math.abs(subject.change)}
                      </span>
                    </div>
                  </div>
                  <Progress value={subject.average} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceDistribution.map((range, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{range.range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${range.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{range.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-900">{student.name}</span>
                  <span className="text-green-700 font-bold">{student.average}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Needing Attention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Students Needing Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {needsAttention.map((student, index) => (
              <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <span className="text-yellow-700 font-bold">{student.average}%</span>
                </div>
                <p className="text-sm text-yellow-800">{student.issue}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Class Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Mathematics:</strong> Class is performing well overall. Consider introducing more challenging problems for advanced students.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Reading:</strong> Focus on reading comprehension strategies. Consider small group interventions for struggling readers.
              </p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Science:</strong> Excellent progress! Continue hands-on experiments and encourage student-led investigations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassReport;
