import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  ArrowUpDown
} from 'lucide-react';
import { classOptimizationService } from '@/services/class-optimization-service';

export function ClassOptimizationDashboard() {
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  const { data: balanceAnalysis, isLoading } = useQuery({
    queryKey: ['class-balance-analysis'],
    queryFn: classOptimizationService.analyzeClassBalance,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!balanceAnalysis) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const { recommendations, averageClassSize, totalClasses } = balanceAnalysis;

  // Categorize recommendations
  const underutilized = recommendations.filter(r => r.type === 'underutilized');
  const overcrowded = recommendations.filter(r => r.type === 'overcrowded');
  const balanced = recommendations.filter(r => r.type === 'balanced');

  // Prepare chart data
  const chartData = recommendations.map(r => ({
    name: r.className.length > 15 ? `${r.className.substring(0, 15)}...` : r.className,
    students: r.currentSize,
    type: r.type
  }));

  const getBarColor = (type: string) => {
    switch (type) {
      case 'underutilized': return '#ef4444'; // red
      case 'overcrowded': return '#f59e0b'; // amber
      case 'balanced': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Class Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageClassSize)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balanced Classes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{balanced.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalClasses > 0 ? Math.round((balanced.length / totalClasses) * 100) : 0}% of classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {underutilized.length + overcrowded.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Classes to optimize
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Class Size Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Class Size Distribution
          </CardTitle>
          <CardDescription>
            Visual representation of student distribution across classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} students`,
                    props.payload.name
                  ]}
                />
                <Bar 
                  dataKey="students" 
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm">Balanced</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span className="text-sm">Overcrowded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm">Underutilized</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Underutilized Classes */}
        {underutilized.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <TrendingUp className="h-5 w-5" />
                Underutilized Classes ({underutilized.length})
              </CardTitle>
              <CardDescription>
                Classes with low student enrollment that may need attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {underutilized.map((rec) => (
                <Alert key={rec.classId}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{rec.className}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {rec.currentSize} student{rec.currentSize !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm">{rec.recommendedAction}</div>
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        {rec.currentSize}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Overcrowded Classes */}
        {overcrowded.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Users className="h-5 w-5" />
                Overcrowded Classes ({overcrowded.length})
              </CardTitle>
              <CardDescription>
                Classes with high student enrollment that may need redistribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overcrowded.map((rec) => (
                <Alert key={rec.classId}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{rec.className}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {rec.currentSize} students
                        </div>
                        <div className="text-sm">{rec.recommendedAction}</div>
                      </div>
                      <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                        {rec.currentSize}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      {(underutilized.length > 0 || overcrowded.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Recommended actions to optimize your class distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Auto-Balance Classes
              </Button>
              <Button variant="outline" size="sm">
                Merge Small Classes
              </Button>
              <Button variant="outline" size="sm">
                Redistribute Students
              </Button>
              <Button variant="outline" size="sm">
                Export Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Classes Balanced State */}
      {balanced.length === totalClasses && totalClasses > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Perfect Balance!
            </h3>
            <p className="text-center text-muted-foreground">
              All your classes are well-balanced with optimal student distribution.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}