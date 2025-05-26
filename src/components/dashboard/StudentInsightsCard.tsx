
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Star,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudentInsight {
  id: string;
  name: string;
  performance: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'at_risk';
  lastAssessment: string;
  improvementArea?: string;
}

interface StudentInsightsCardProps {
  insights: StudentInsight[];
  className?: string;
}

const StudentInsightsCard: React.FC<StudentInsightsCardProps> = ({ insights, className = "" }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return { color: 'bg-green-100 text-green-800', icon: <Star className="h-3 w-3" /> };
      case 'good':
        return { color: 'bg-blue-100 text-blue-800', icon: <TrendingUp className="h-3 w-3" /> };
      case 'needs_attention':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> };
      case 'at_risk':
        return { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <User className="h-3 w-3" /> };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const priorityStudents = insights
    .filter(student => student.status === 'at_risk' || student.status === 'needs_attention')
    .slice(0, 3);

  const topPerformers = insights
    .filter(student => student.status === 'excellent')
    .slice(0, 3);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Student Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Priority Students */}
          {priorityStudents.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Priority Students
              </h4>
              <div className="space-y-2">
                {priorityStudents.map((student) => {
                  const statusBadge = getStatusBadge(student.status);
                  return (
                    <div key={student.id} className="p-3 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{student.name}</span>
                        <Badge className={statusBadge.color}>
                          {statusBadge.icon}
                          <span className="ml-1 capitalize">{student.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Performance: {student.performance}%</span>
                          {getTrendIcon(student.trend)}
                          <span className={`${student.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {student.trend === 'up' ? '+' : ''}{student.trendValue}%
                          </span>
                        </div>
                      </div>
                      {student.improvementArea && (
                        <p className="text-xs text-gray-600 mt-1">
                          Focus area: {student.improvementArea}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <Link to="/app/students">
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View All Students
                </Button>
              </Link>
            </div>
          )}

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-green-600" />
                Top Performers
              </h4>
              <div className="space-y-2">
                {topPerformers.map((student) => (
                  <div key={student.id} className="p-3 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{student.name}</span>
                      <Badge className="bg-green-100 text-green-800">
                        <Star className="h-3 w-3 mr-1" />
                        Excellent
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Performance: {student.performance}%</span>
                      {getTrendIcon(student.trend)}
                      <span className="text-green-600">+{student.trendValue}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {insights.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">No Student Data</h4>
              <p className="text-sm text-gray-600 mb-4">
                Add students and assessments to see insights here.
              </p>
              <Link to="/app/students/add">
                <Button size="sm">Add First Student</Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInsightsCard;
