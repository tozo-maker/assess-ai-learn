
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnalyticsData {
  totalStudents: number;
  totalAssessments: number;
  averagePerformance: number;
  studentsAtRisk: number;
  studentsExcelling: number;
  recentGrowth: number;
  completionRate: number;
  engagementScore: number;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, className = "" }) => {
  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 85) return { color: 'bg-green-100 text-green-800', label: 'Excellent' };
    if (score >= 70) return { color: 'bg-yellow-100 text-yellow-800', label: 'Good' };
    return { color: 'bg-red-100 text-red-800', label: 'Needs Attention' };
  };

  const performanceBadge = getPerformanceBadge(data.averagePerformance);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Class Analytics Overview
          </span>
          <Badge className={performanceBadge.color}>
            {performanceBadge.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{data.totalStudents}</div>
              <div className="text-xs text-blue-600">Total Students</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{data.totalAssessments}</div>
              <div className="text-xs text-green-600">Assessments</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${getPerformanceColor(data.averagePerformance)}`}>
                {data.averagePerformance}%
              </div>
              <div className="text-xs text-purple-600">Avg Performance</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">{data.completionRate}%</div>
              <div className="text-xs text-orange-600">Completion Rate</div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Students at Risk</h4>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">{data.studentsAtRisk}</div>
              <p className="text-sm text-gray-600">Need immediate attention</p>
              <Link to="/app/students">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  View Details
                </Button>
              </Link>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">High Performers</h4>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">{data.studentsExcelling}</div>
              <p className="text-sm text-gray-600">Exceeding expectations</p>
              <Link to="/app/insights/class">
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  View Insights
                </Button>
              </Link>
            </div>
          </div>

          {/* Growth Indicator */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Recent Growth</h4>
                <p className="text-sm text-gray-600">Compared to last month</p>
              </div>
              <div className="flex items-center gap-2">
                {data.recentGrowth > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-lg font-bold ${data.recentGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.recentGrowth > 0 ? '+' : ''}{data.recentGrowth}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Link to="/app/assessments/add" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Create Assessment
              </Button>
            </Link>
            <Link to="/app/insights/class" className="flex-1">
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                View All Insights
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
