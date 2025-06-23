import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Trophy, TrendingUp } from 'lucide-react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  grade_level: string;
}

const DashboardContent: React.FC = () => {
  // Fetch students data
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .limit(5);

      if (error) throw error;
      return data as Student[];
    },
    staleTime: 60000, // 1 minute
  });

  const { notifications, unreadCount } = useNotifications();

  // Get recent achievements from notifications
  const recentAchievements = notifications
    .filter(n => n.type === 'achievement')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-gray-600">Overview of your LearnSpark AI classroom</p>
        </div>
        <Button>Generate Report</Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">24</div>
            <p className="text-sm text-gray-500">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg. Assessment Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">86%</div>
            <p className="text-sm text-gray-500">Class average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">18</div>
            <p className="text-sm text-gray-500">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">12</div>
            <p className="text-sm text-gray-500">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements Section */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-gray-600">{achievement.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(achievement.timestamp, { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Activity
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  !notification.read 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Students Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <Button variant="secondary" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoadingStudents ? (
              <p className="text-gray-500">Loading students...</p>
            ) : (
              students.map((student) => (
                <div key={student.id} className="flex items-center space-x-3">
                  <Avatar>
                    {student.avatar_url ? (
                      <AvatarImage src={student.avatar_url} alt={student.first_name} />
                    ) : (
                      <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{student.first_name} {student.last_name}</p>
                    <p className="text-xs text-gray-500">Grade {student.grade_level}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContent;
