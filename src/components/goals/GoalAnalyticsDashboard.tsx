
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { GoalWithMilestones } from '@/types/goals';

interface GoalAnalyticsDashboardProps {
  goals: GoalWithMilestones[];
}

const GoalAnalyticsDashboard: React.FC<GoalAnalyticsDashboardProps> = ({ goals }) => {
  // Calculate analytics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const overallCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Average progress
  const averageProgress = goals.length > 0 
    ? goals.reduce((acc, goal) => acc + (goal.progress_percentage || 0), 0) / goals.length 
    : 0;

  // Goals by status for pie chart
  const statusData = [
    { name: 'Active', value: activeGoals, color: '#3b82f6' },
    { name: 'Completed', value: completedGoals, color: '#10b981' },
    { name: 'Paused', value: goals.filter(g => g.status === 'paused').length, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // Progress distribution
  const progressRanges = [
    { range: '0-25%', count: goals.filter(g => (g.progress_percentage || 0) <= 25).length },
    { range: '26-50%', count: goals.filter(g => (g.progress_percentage || 0) > 25 && (g.progress_percentage || 0) <= 50).length },
    { range: '51-75%', count: goals.filter(g => (g.progress_percentage || 0) > 50 && (g.progress_percentage || 0) <= 75).length },
    { range: '76-100%', count: goals.filter(g => (g.progress_percentage || 0) > 75).length }
  ];

  // Goals nearing deadline
  const upcomingDeadlines = goals.filter(goal => {
    if (!goal.target_date || goal.status === 'completed') return false;
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 14 && daysUntilDeadline >= 0;
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold">{totalGoals}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Progress</p>
                <p className="text-2xl font-bold">{Math.round(averageProgress)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingDeadlines.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={progressRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Goals by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((goal) => {
                const daysLeft = Math.ceil(
                  (new Date(goal.target_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={goal.progress_percentage || 0} className="flex-1 h-2" />
                        <span className="text-sm text-gray-600">{goal.progress_percentage || 0}%</span>
                      </div>
                    </div>
                    <Badge variant={daysLeft <= 7 ? 'destructive' : 'default'}>
                      {daysLeft} days left
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalAnalyticsDashboard;
