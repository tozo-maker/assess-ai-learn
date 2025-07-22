import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  User, 
  FileText, 
  Target, 
  Mail, 
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'assessment' | 'goal' | 'communication' | 'achievement' | 'note';
  title: string;
  description: string;
  timestamp: Date;
  student?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
  showFilters?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  maxItems = 10,
  showFilters = true,
  onActivityClick
}) => {
  const [filter, setFilter] = useState<string>('all');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assessment': return FileText;
      case 'goal': return Target;
      case 'communication': return Mail;
      case 'achievement': return Award;
      case 'note': return BookOpen;
      default: return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'assessment': return 'text-blue-600 bg-blue-50';
      case 'goal': return 'text-green-600 bg-green-50';
      case 'communication': return 'text-purple-600 bg-purple-50';
      case 'achievement': return 'text-yellow-600 bg-yellow-50';
      case 'note': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'assessment': return 'Assessment';
      case 'goal': return 'Goal';
      case 'communication': return 'Message';
      case 'achievement': return 'Achievement';
      case 'note': return 'Note';
      default: return 'Activity';
    }
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  ).slice(0, maxItems);

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'assessment', label: 'Assessments' },
    { value: 'goal', label: 'Goals' },
    { value: 'communication', label: 'Communications' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'note', label: 'Notes' }
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
          {showFilters && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              
              return (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                    onActivityClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onActivityClick?.(activity)}
                >
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">
                        {activity.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {getActivityBadge(activity.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    
                    {activity.student && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={activity.student.avatar} />
                          <AvatarFallback className="text-xs">
                            {activity.student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500">
                          {activity.student.name}
                        </span>
                      </div>
                    )}
                    
                    {activity.metadata && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <span 
                            key={key}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {activities.length > maxItems && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">
              View All Activities ({activities.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;